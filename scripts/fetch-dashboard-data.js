// Pulls traffic, sign-up, retention and in-app engagement numbers for the
// Solo Supper dashboard. Reads GA4 via the Analytics Data API, sign-ups via
// Firebase Auth, and recipe/shopping-list/device usage via Firestore (the
// same users/{uid}/planner/state documents the app itself syncs, plus a
// lightweight users/{uid}/deviceLog/main doc for cross-device counting),
// then saves the combined result privately in Firestore at admin/dashboard,
// where only the admin page (through /api/admin) can read it. Set
// DASHBOARD_FILE=1 to also write dashboard-data.json locally for debugging.
//
// Required environment variables (set as GitHub Actions secrets):
//   GA4_PROPERTY_ID          e.g. "123456789" (numeric only, no "properties/" prefix)
//   GA4_SERVICE_ACCOUNT_KEY  full contents of the GA4 service account JSON key
//   FIREBASE_SERVICE_ACCOUNT_KEY  full contents of the Firebase service account JSON key
//
// The platform (web vs Android app) split needs a one-off GA4 console step:
// Admin > Custom definitions > Custom dimensions > Create, scope "User",
// User property "app_platform", name "App platform". Until that exists this
// script just returns zeros for it rather than failing the whole run.

const fs = require('fs');
const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { JWT } = require('google-auth-library');
const admin = require('firebase-admin');

const DAY_MS = 24 * 60 * 60 * 1000;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function metricRow(row, metricNames) {
  const out = {};
  metricNames.forEach((name, i) => {
    out[name] = Number(row.metricValues[i].value);
  });
  return out;
}

async function fetchGA4(analyticsClient, propertyId) {
  const property = `properties/${propertyId}`;

  // Headline totals for 7 and 30 day windows.
  const metricNames = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'userEngagementDuration'];

  async function totals(startDate, endDate) {
    const [res] = await analyticsClient.runReport({
      property,
      dateRanges: [{ startDate, endDate: endDate || 'today' }],
      metrics: metricNames.map((name) => ({ name })),
    });
    if (!res.rows || res.rows.length === 0) {
      return Object.fromEntries(metricNames.map((n) => [n, 0]));
    }
    return metricRow(res.rows[0], metricNames);
  }

  const dau = await totals('yesterday', 'yesterday');
  const last7 = await totals('7daysAgo');
  const last30 = await totals('30daysAgo');

  // Daily active users, last 30 days, for the trend chart.
  const [dailyRes] = await analyticsClient.runReport({
    property,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
  const dailyUsers = (dailyRes.rows || []).map((row) => ({
    date: `${row.dimensionValues[0].value.slice(0, 4)}-${row.dimensionValues[0].value.slice(4, 6)}-${row.dimensionValues[0].value.slice(6, 8)}`,
    users: Number(row.metricValues[0].value),
  }));

  // Top pages, last 30 days.
  const [pagesRes] = await analyticsClient.runReport({
    property,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });
  const topPages = (pagesRes.rows || []).map((row) => ({
    path: row.dimensionValues[0].value,
    title: row.dimensionValues[1].value,
    views: Number(row.metricValues[0].value),
  }));

  // New vs returning, last 28 days - used as the retention signal.
  const [retentionRes] = await analyticsClient.runReport({
    property,
    dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'newVsReturning' }],
    metrics: [{ name: 'activeUsers' }],
  });
  const newVsReturning = { new: 0, returning: 0 };
  (retentionRes.rows || []).forEach((row) => {
    const key = row.dimensionValues[0].value;
    const value = Number(row.metricValues[0].value);
    if (key === 'new') newVsReturning.new = value;
    else if (key === 'returning') newVsReturning.returning = value;
  });

  // Web vs Android-app split, from the "app_platform" user property the app
  // sets on every session (see index.html). Needs the GA4 custom dimension
  // described at the top of this file - until that's created, GA4 rejects
  // the unknown dimension name, so this is wrapped and just zeros out.
  let platform = { web: 0, android: 0, configured: true };
  try {
    const [platformRes] = await analyticsClient.runReport({
      property,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'customUser:app_platform' }],
      metrics: [{ name: 'activeUsers' }],
    });
    (platformRes.rows || []).forEach((row) => {
      const key = row.dimensionValues[0].value;
      const value = Number(row.metricValues[0].value);
      if (key === 'android_app') platform.android += value;
      else if (key === 'web') platform.web += value;
    });
  } catch (err) {
    console.warn('Platform split unavailable (custom dimension "app_platform" probably not created yet in GA4):', err.message);
    platform = { web: 0, android: 0, configured: false };
  }

  // Client-side JS errors, last 7 days, reported as a GA4 "exception" event
  // (see the window.onerror hook in index.html). A simple production
  // health signal - should normally read zero.
  let exceptions7d = 0;
  try {
    const [exRes] = await analyticsClient.runReport({
      property,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'exception' } },
      },
    });
    (exRes.rows || []).forEach((row) => { exceptions7d += Number(row.metricValues[0].value); });
  } catch (err) {
    console.warn('Exception-count query failed:', err.message);
  }

  const mau = last30.activeUsers;
  const wau = last7.activeUsers;
  const dauCount = dau.activeUsers;

  return {
    traffic: {
      last7Days: {
        users: last7.activeUsers,
        newUsers: last7.newUsers,
        sessions: last7.sessions,
        pageViews: last7.screenPageViews,
        avgEngagementTimeSec: last7.sessions ? Math.round(last7.userEngagementDuration / last7.sessions) : 0,
      },
      last30Days: {
        users: last30.activeUsers,
        newUsers: last30.newUsers,
        sessions: last30.sessions,
        pageViews: last30.screenPageViews,
        avgEngagementTimeSec: last30.sessions ? Math.round(last30.userEngagementDuration / last30.sessions) : 0,
      },
      dailyUsers,
      topPages,
    },
    retention: {
      newVsReturning,
      windowDays: 28,
    },
    stickiness: {
      dau: dauCount,
      wau,
      mau,
      dauMauPct: mau ? Math.round((dauCount / mau) * 100) : 0,
    },
    platform,
    siteHealth: {
      exceptions7d,
    },
  };
}

// Where visitors come from, with Pinterest and Instagram picked out, for the
// "From social" panel. Sign-ups and checkouts are the GA4 events the app sends
// (sign_up, begin_checkout, pro_checkout_complete), credited to the channel
// that first brought that visitor. Only visitors who accepted analytics are
// counted, so treat these as a sample rather than a full count.
function channelOf(source, medium) {
  const s = String(source || '').toLowerCase();
  const m = String(medium || '').toLowerCase();
  if (/pinterest|pin\.it/.test(s)) return 'pinterest';
  if (/instagram|^ig$/.test(s)) return 'instagram';
  if (/facebook|^fb$|t\.co|twitter|x\.com|tiktok|reddit|linkedin|threads|bsky|mastodon/.test(s) || m === 'social') return 'otherSocial';
  if (m === 'organic' || /google|bing|duckduckgo|ecosia|yahoo/.test(s)) return 'search';
  if (s === '(direct)' || s === '') return 'direct';
  return 'other';
}
const CHANNELS = ['pinterest', 'instagram', 'otherSocial', 'search', 'direct', 'other'];

function isoWeekMonday(yw) {
  // "202641" -> Monday of ISO week 41 of 2026, as YYYY-MM-DD.
  const year = Number(String(yw).slice(0, 4));
  const week = Number(String(yw).slice(4));
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * DAY_MS + (week - 1) * 7 * DAY_MS);
  return monday.toISOString().slice(0, 10);
}

async function fetchSocial(analyticsClient, propertyId) {
  const property = `properties/${propertyId}`;
  const blank = () => ({ visits7: 0, visits30: 0, newUsers30: 0, signUps30: 0, checkouts30: 0, proStarts30: 0 });
  const byChannel = Object.fromEntries(CHANNELS.map((c) => [c, blank()]));
  const out = { configured: true, byChannel, weekly: [], topLanding: [] };

  async function report(req) {
    const [res] = await analyticsClient.runReport({ property, limit: 10000, ...req });
    return res.rows || [];
  }

  try {
    for (const [range, key] of [['7daysAgo', 'visits7'], ['30daysAgo', 'visits30']]) {
      const rows = await report({
        dateRanges: [{ startDate: range, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'newUsers' }],
      });
      rows.forEach((row) => {
        const c = byChannel[channelOf(row.dimensionValues[0].value, row.dimensionValues[1].value)];
        c[key] += Number(row.metricValues[0].value);
        if (key === 'visits30') c.newUsers30 += Number(row.metricValues[1].value);
      });
    }

    const events = await report({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'firstUserSource' }, { name: 'firstUserMedium' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['sign_up', 'begin_checkout', 'pro_checkout_complete'] } } },
    });
    events.forEach((row) => {
      const c = byChannel[channelOf(row.dimensionValues[0].value, row.dimensionValues[1].value)];
      const n = Number(row.metricValues[0].value);
      const ev = row.dimensionValues[2].value;
      if (ev === 'sign_up') c.signUps30 += n;
      else if (ev === 'begin_checkout') c.checkouts30 += n;
      else if (ev === 'pro_checkout_complete') c.proStarts30 += n;
    });

    // Visits per week from Pinterest and Instagram, last 12 weeks.
    // Every one of the last 12 weeks, so quiet weeks show as gaps, not missing.
    const weeks = {};
    const today = new Date();
    const thisMonday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - ((today.getUTCDay() + 6) % 7) * DAY_MS);
    for (let i = 11; i >= 0; i--) {
      const w = new Date(thisMonday.getTime() - i * 7 * DAY_MS).toISOString().slice(0, 10);
      weeks[w] = { week: w, pinterest: 0, instagram: 0 };
    }
    const weekly = await report({
      dateRanges: [{ startDate: '84daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'isoYearIsoWeek' }, { name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }],
    });
    weekly.forEach((row) => {
      const ch = channelOf(row.dimensionValues[1].value, row.dimensionValues[2].value);
      const w = isoWeekMonday(row.dimensionValues[0].value);
      if (!weeks[w]) return;
      if (ch === 'pinterest' || ch === 'instagram') weeks[w][ch] += Number(row.metricValues[0].value);
    });
    out.weekly = Object.values(weeks).sort((a, b) => (a.week < b.week ? -1 : 1));

    // Which pages social visitors land on, last 30 days.
    const landing = {};
    const lp = await report({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPage' }, { name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }],
    });
    lp.forEach((row) => {
      const ch = channelOf(row.dimensionValues[1].value, row.dimensionValues[2].value);
      if (ch !== 'pinterest' && ch !== 'instagram') return;
      const page = row.dimensionValues[0].value.split('?')[0] || '/';
      landing[page] = (landing[page] || 0) + Number(row.metricValues[0].value);
    });
    out.topLanding = Object.entries(landing).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([path, sessions]) => ({ path, sessions }));
  } catch (err) {
    console.warn('Social report failed:', err.message);
    out.configured = false;
    out.error = String(err.message || err).slice(0, 200);
  }
  return out;
}

// The GA4 property is shared with Neil's other websites, so every Solo
// Supper report is limited to Solo Supper's own addresses (the website, its
// Cloudflare previews, and the Android app, which runs on "localhost").
// Everything else is reported separately on the "Other sites" tab.
const SOLO_HOSTS = '(www\\.)?solosupper\\.co\\.uk|([a-z0-9-]+\\.)?solo-supper\\.pages\\.dev|localhost';
const SOLO_FILTER = { filter: { fieldName: 'hostName', stringFilter: { matchType: 'FULL_REGEXP', value: SOLO_HOSTS } } };
const OTHER_FILTER = { notExpression: SOLO_FILTER };

// Wraps the GA4 client so every report also carries the given host filter.
function scoped(client, hostFilter) {
  return {
    runReport: (req) => client.runReport(Object.assign({}, req, {
      dimensionFilter: req.dimensionFilter ? { andGroup: { expressions: [req.dimensionFilter, hostFilter] } } : hostFilter,
    })),
  };
}

// ---------------------------------------------------------------- other sites
// Everything in the GA4 property that isn't Solo Supper. Neil's GitHub Pages
// projects all live on one host (neilfletcher.github.io/<project>/), so each
// project folder counts as its own site, and the homepage (the build log) is
// one more. Any other host counts as a site of its own.
const HOME_HOST = 'neilfletcher.github.io';
// Usage events the sites send (see window.ssTrack in each site), with an
// optional "detail" parameter (a tab, bow type, room or section; never a person).
const USAGE_EVENTS = ['spine_calculated', 'data_loaded', 'tab_viewed', 'sheet_connected', 'workout_logged', 'room_viewed', 'section_reached', 'step_ticked', 'project_opened'];

function siteKeyOf(host, path) {
  host = host || '(not set)';
  if (host !== HOME_HOST) return host + '/';
  const seg = String(path || '/').split('/')[1] || '';
  if (!seg || /\.html?$/i.test(seg)) return host + '/';
  return host + '/' + seg + '/';
}

function reEscape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function siteFilter(key) {
  const host = key.slice(0, key.indexOf('/'));
  const seg = key.slice(key.indexOf('/') + 1).replace(/\/$/, '');
  const byHost = { filter: { fieldName: 'hostName', stringFilter: { matchType: 'EXACT', value: host } } };
  if (host !== HOME_HOST) return byHost;
  const path = seg ? '/' + reEscape(seg) + '(/.*)?' : '/|/[^/]+\\.html?';
  return { andGroup: { expressions: [byHost, { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'FULL_REGEXP', value: path, caseSensitive: false } } }] } };
}

function rowsOf(res) { return (res && res.rows) || []; }
function num(v) { return Number(v && v.value) || 0; }

async function fetchOtherSites(analyticsClient, propertyId) {
  const property = `properties/${propertyId}`;
  const all = scoped(analyticsClient, OTHER_FILTER);
  const out = { configured: true, sites: [], dailyUsers: [], topPages: [], sources: [], heatmap: [], outbound: [], countries: [],
    totals: { users7: 0, usersPrev7: 0, users30: 0, views30: 0 } };
  const run = async (client, req) => (await client.runReport(Object.assign({ property }, req)))[0];
  const R3 = [{ startDate: '6daysAgo', endDate: 'today', name: 'd7' }, { startDate: '13daysAgo', endDate: '7daysAgo', name: 'p7' }, { startDate: '29daysAgo', endDate: 'today', name: 'd30' }];
  const D30 = [{ startDate: '29daysAgo', endDate: 'today' }];

  try {
    // Totals across every other site.
    const tot = await run(all, { dateRanges: R3, metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }] });
    rowsOf(tot).forEach((row) => {
      const k = row.dimensionValues[0].value;
      if (k === 'd7') out.totals.users7 = num(row.metricValues[0]);
      if (k === 'p7') out.totals.usersPrev7 = num(row.metricValues[0]);
      if (k === 'd30') { out.totals.users30 = num(row.metricValues[0]); out.totals.views30 = num(row.metricValues[1]); }
    });

    const daily = await run(all, { dateRanges: D30, dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] });
    out.dailyUsers = rowsOf(daily).map((row) => {
      const d = row.dimensionValues[0].value;
      return { date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, users: num(row.metricValues[0]) };
    });

    // Find the sites: every host and project folder with page views in the last 90 days.
    const pages = await run(all, {
      dateRanges: [{ startDate: '89daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'hostName' }, { name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 2000,
    });
    const found = {};
    rowsOf(pages).forEach((row) => {
      const host = row.dimensionValues[0].value, path = row.dimensionValues[1].value, title = row.dimensionValues[2].value;
      const key = siteKeyOf(host, path);
      const s = found[key] || (found[key] = { key, views90: 0, title: '' });
      s.views90 += num(row.metricValues[0]);
      if (!s.title && title && title !== '(not set)') s.title = title;
    });

    const keys = Object.values(found).sort((a, b) => b.views90 - a.views90).slice(0, 15);
    for (const f of keys) {
      const client = scoped(analyticsClient, siteFilter(f.key));
      const s = { key: f.key, url: 'https://' + f.key, name: f.key === HOME_HOST + '/' ? 'Build log (homepage)' : (f.title || f.key).replace(/^Neil Fletcher:\s*/i, ''),
        views90: f.views90, users7: 0, usersPrev7: 0, users30: 0, newUsers30: 0, sessions30: 0, views30: 0, engagedSessions30: 0, engagementSec30: 0,
        daily: [], devices: {}, sources: [], countries: [], returning: { new: 0, returning: 0 }, pages: [], referrers: [], lastSeen: null, actions: [] };

      const t = await run(client, { dateRanges: R3, metrics: ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'engagedSessions', 'userEngagementDuration'].map((name) => ({ name })) });
      rowsOf(t).forEach((row) => {
        const k = row.dimensionValues[0].value, m = row.metricValues.map(num);
        if (k === 'd7') s.users7 = m[0];
        if (k === 'p7') s.usersPrev7 = m[0];
        if (k === 'd30') Object.assign(s, { users30: m[0], newUsers30: m[1], sessions30: m[2], views30: m[3], engagedSessions30: m[4], engagementSec30: m[5] });
      });

      const d = await run(client, { dateRanges: [{ startDate: '89daysAgo', endDate: 'today' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] });
      const byDay = {};
      rowsOf(d).forEach((row) => { const v = row.dimensionValues[0].value; byDay[`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`] = num(row.metricValues[0]); });
      const seen = Object.keys(byDay).filter((k) => byDay[k] > 0).sort();
      s.lastSeen = seen.length ? seen[seen.length - 1] : null;
      for (let i = 29; i >= 0; i--) {
        const day = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
        s.daily.push(byDay[day] || 0);
      }

      if (s.users30 > 0) {
        const dev = await run(client, { dateRanges: D30, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }] });
        rowsOf(dev).forEach((row) => { s.devices[row.dimensionValues[0].value] = num(row.metricValues[0]); });

        const src = await run(client, { dateRanges: D30, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }], limit: 500 });
        const bySrc = {};
        rowsOf(src).forEach((row) => {
          const c = channelOf(row.dimensionValues[0].value, row.dimensionValues[1].value);
          const label = c === 'other' ? row.dimensionValues[0].value : c;
          bySrc[label] = (bySrc[label] || 0) + num(row.metricValues[0]);
        });
        s.sources = Object.entries(bySrc).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([source, sessions]) => ({ source, sessions }));

        const ctry = await run(client, { dateRanges: D30, dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 4 });
        s.countries = rowsOf(ctry).map((row) => ({ country: row.dimensionValues[0].value, users: num(row.metricValues[0]) }));

        const ret = await run(client, { dateRanges: D30, dimensions: [{ name: 'newVsReturning' }], metrics: [{ name: 'activeUsers' }] });
        rowsOf(ret).forEach((row) => { const k = row.dimensionValues[0].value; if (k === 'new' || k === 'returning') s.returning[k] = num(row.metricValues[0]); });

        const pg = await run(client, { dateRanges: D30, dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 });
        s.pages = rowsOf(pg).map((row) => ({ path: row.dimensionValues[0].value, title: row.dimensionValues[1].value, views: num(row.metricValues[0]), engagementSec: num(row.metricValues[1]) }));

        // Where visitors were just before: shows how much the homepage feeds each tool.
        const ref = await run(client, { dateRanges: D30, dimensions: [{ name: 'pageReferrer' }], metrics: [{ name: 'screenPageViews' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 25 });
        const byRef = {};
        rowsOf(ref).forEach((row) => {
          let r = row.dimensionValues[0].value || '';
          try { const u = new URL(r); r = u.hostname + (u.hostname === HOME_HOST ? u.pathname.replace(/^(\/[^/]*\/?).*/, '$1') : ''); } catch (e) { r = '(direct)'; }
          if (siteKeyOf(r.split('/')[0], '/' + r.split('/').slice(1).join('/')) === s.key) return; // moving around inside the same site
          byRef[r] = (byRef[r] || 0) + num(row.metricValues[0]);
        });
        // What people do: the usage events, with who did them and the top details.
        const evFilter = { filter: { fieldName: 'eventName', inListFilter: { values: USAGE_EVENTS } } };
        const ev = await run(client, { dateRanges: D30, dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }], dimensionFilter: evFilter });
        s.actions = rowsOf(ev).map((row) => ({ event: row.dimensionValues[0].value, count: num(row.metricValues[0]), users: num(row.metricValues[1]), details: [] }))
          .sort((a, b) => b.count - a.count);
        if (s.actions.length) {
          try {
            // Needs the event-scoped custom dimension "detail" in GA4 (Admin > Custom definitions).
            const dt = await run(client, { dateRanges: D30, dimensions: [{ name: 'eventName' }, { name: 'customEvent:detail' }], metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }], dimensionFilter: evFilter, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 60 });
            rowsOf(dt).forEach((row) => {
              const a = s.actions.find((x) => x.event === row.dimensionValues[0].value), d = row.dimensionValues[1].value;
              if (a && d && d !== '(not set)') a.details.push({ detail: d, count: num(row.metricValues[0]), users: num(row.metricValues[1]) });
            });
            s.detailsConfigured = true;
          } catch (err) {
            s.detailsConfigured = false;
          }
        }

        s.referrers = Object.entries(byRef).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([from, views]) => ({ from, views }));
      }
      out.sites.push(s);
    }

    // When people visit: day of week by hour, last 30 days (UK time, as set in GA4).
    const hm = await run(all, { dateRanges: D30, dimensions: [{ name: 'dayOfWeek' }, { name: 'hour' }], metrics: [{ name: 'activeUsers' }], limit: 200 });
    out.heatmap = rowsOf(hm).map((row) => ({ dow: Number(row.dimensionValues[0].value), hour: Number(row.dimensionValues[1].value), users: num(row.metricValues[0]) }));

    const ctry = await run(all, { dateRanges: D30, dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 6 });
    out.countries = rowsOf(ctry).map((row) => ({ country: row.dimensionValues[0].value, users: num(row.metricValues[0]) }));

    const src = await run(all, { dateRanges: D30, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }], limit: 1000 });
    const by = {};
    rowsOf(src).forEach((row) => {
      const c = channelOf(row.dimensionValues[0].value, row.dimensionValues[1].value);
      by[c] = (by[c] || 0) + num(row.metricValues[0]);
    });
    out.sources = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([channel, sessions]) => ({ channel, sessions }));

    // Links clicked out of the sites (GA4 records these automatically as "click").
    try {
      const clicks = (dims) => run(all, {
        dateRanges: D30, dimensions: dims.map((name) => ({ name })), metrics: [{ name: 'eventCount' }],
        dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'click' } } },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 10,
      });
      // Link text makes Amazon links readable (book titles); fall back to the address alone.
      let oc, withText = true;
      try { oc = await clicks(['linkUrl', 'linkText']); } catch (e) { withText = false; oc = await clicks(['linkUrl']); }
      out.outbound = rowsOf(oc).map((row) => ({ url: row.dimensionValues[0].value, text: withText ? row.dimensionValues[1].value : '', clicks: num(row.metricValues[0]) })).filter((x) => x.url && x.url !== '(not set)');
    } catch (err) {
      console.warn('Outbound clicks unavailable:', err.message);
    }
  } catch (err) {
    console.warn('Other-sites report failed:', err.message);
    out.configured = false;
    out.error = String(err.message || err).slice(0, 200);
  }
  return out;
}

// Neil's own accounts are left out of every number (EXCLUDE_EMAILS can add more).
const INTERNAL_EMAILS = ['neil.fletcher@gmail.com', 'test@trooperlooper.co.uk'].concat(String(process.env.EXCLUDE_EMAILS || '').toLowerCase().split(/[,\s]+/).filter(Boolean));
const internalUids = new Set();

async function fetchFirebaseSignups() {
  let users = [];
  let pageToken;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users = users.concat(result.users);
    pageToken = result.pageToken;
  } while (pageToken);
  users = users.filter((u) => {
    if (u.email && INTERNAL_EMAILS.includes(u.email.toLowerCase())) { internalUids.add(u.uid); return false; }
    return true;
  });

  const now = Date.now();

  const creationTimes = users.map((u) => new Date(u.metadata.creationTime).getTime());
  const newLast7Days = creationTimes.filter((t) => now - t <= 7 * DAY_MS).length;
  const newLast30Days = creationTimes.filter((t) => now - t <= 30 * DAY_MS).length;

  // Daily sign-up counts for the last 30 days, oldest first.
  const dailyBuckets = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    dailyBuckets[d] = 0;
  }
  creationTimes.forEach((t) => {
    const d = new Date(t).toISOString().slice(0, 10);
    if (d in dailyBuckets) dailyBuckets[d] += 1;
  });

  return {
    totalUsers: users.length,
    newLast7Days,
    newLast30Days,
    dailySignups: Object.entries(dailyBuckets).map(([date, count]) => ({ date, count })),
  };
}

// Recipe titles live in the site's recipes-data.js (older copies kept them in
// app.js), not in Firestore. Rather than keep a second copy that can drift,
// read them from the checked-out repo each run and pull out
// id: "...", title: "..." pairs with a regex, which is good enough since the
// format is consistent.
function loadRecipeTitles() {
  const titles = {};
  const pattern = /id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"/g;
  ['recipes-data.js', 'app.js'].forEach((file) => {
    const p = path.join(__dirname, '..', file);
    if (!fs.existsSync(p)) return;
    const source = fs.readFileSync(p, 'utf8');
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (!titles[match[1]]) titles[match[1]] = match[2];
    }
  });
  if (!Object.keys(titles).length) console.warn('No recipe titles found - names will show as raw ids');
  return titles;
}

function tallyIds(entries, idKey) {
  const counts = {};
  entries.forEach((entry) => {
    const id = entry && entry[idKey];
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

function topFromCounts(counts, titles, limit) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ id, title: titles[id] || id, count }));
}

async function fetchEngagement(titles, totalSignups) {
  const db = admin.firestore();
  // Every user's synced planner state lives at users/{uid}/planner/state -
  // a collection group query reads all of them in one pass regardless of uid.
  const snapshot = await db.collectionGroup('planner').get();

  const now = Date.now();
  const DORMANT_AFTER_DAYS = 30;

  let activePlanners = 0;
  let usingShoppingList = 0;
  let confirmedCookers = 0;
  let dormantAccounts = 0;
  let unknownActivity = 0; // synced accounts with no updatedAt at all (older/seed docs)
  const cookedCounts = {};
  const plannedCounts = {};
  const favouriteCounts = {};
  // "Tried" means ticked as cooked. Planning a dish (including every Surprise
  // me and auto-fill, many of them swapped straight out again) is counted apart.
  const touchedRecipeIds = new Set();
  const plannedRecipeIds = new Set();

  let skipped = 0;
  snapshot.forEach((doc) => {
    // users/{uid}/planner/state: leave out Neil's own accounts.
    if (internalUids.has(doc.ref.path.split('/')[1])) { skipped += 1; return; }
    const data = doc.data() || {};

    const plan = Array.isArray(data.plan) ? data.plan : [];
    const batch = Array.isArray(data.batch) ? data.batch : [];
    if (plan.some(Boolean) || batch.length > 0) activePlanners += 1;

    const checked = data.checked && typeof data.checked === 'object' ? data.checked : {};
    if (Object.values(checked).some(Boolean)) usingShoppingList += 1;

    const cookLog = Array.isArray(data.cookLog) ? data.cookLog : [];
    if (cookLog.length > 0) confirmedCookers += 1;
    Object.entries(tallyIds(cookLog, 'id')).forEach(([id, n]) => {
      cookedCounts[id] = (cookedCounts[id] || 0) + n;
      touchedRecipeIds.add(id);
    });

    const history = Array.isArray(data.history) ? data.history : [];
    Object.entries(tallyIds(history, 'id')).forEach(([id, n]) => {
      plannedCounts[id] = (plannedCounts[id] || 0) + n;
      plannedRecipeIds.add(id);
    });

    const ratings = data.ratings && typeof data.ratings === 'object' ? data.ratings : {};
    Object.entries(ratings).forEach(([id, rating]) => {
      if (rating === 5) favouriteCounts[id] = (favouriteCounts[id] || 0) + 1;
    });

    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      const ageDays = (now - data.updatedAt.toDate().getTime()) / DAY_MS;
      if (ageDays > DORMANT_AFTER_DAYS) dormantAccounts += 1;
    } else {
      unknownActivity += 1;
    }
  });

  const trackedAccounts = snapshot.size - skipped;
  const totalRecipes = Object.keys(titles).length;

  // Cross-device usage - a separate, isolated doc per account
  // (users/{uid}/deviceLog/main) that app.js writes to on sign-in, kept out
  // of the planner/state collection group above so it can never affect the
  // counts already computed from that doc.
  let multiDeviceAccounts = 0;
  let deviceTrackedAccounts = 0;
  try {
    const deviceSnapshot = await db.collectionGroup('deviceLog').get();
    deviceSnapshot.forEach((doc) => {
      if (internalUids.has(doc.ref.path.split('/')[1])) return;
      const ids = (doc.data() || {}).ids;
      deviceTrackedAccounts += 1;
      if (Array.isArray(ids) && ids.length > 1) multiDeviceAccounts += 1;
    });
  } catch (err) {
    console.warn('Device-log query failed (users/{uid}/deviceLog/main may not exist yet):', err.message);
  }

  return {
    trackedAccounts,
    activePlanners,
    usingShoppingList,
    topCooked: topFromCounts(cookedCounts, titles, 10),
    topPlanned: topFromCounts(plannedCounts, titles, 10),
    topFavourited: topFromCounts(favouriteCounts, titles, 10),
    funnel: {
      signedUp: totalSignups,
      tracked: trackedAccounts,
      builtAPlan: activePlanners,
      usedShoppingList: usingShoppingList,
      confirmedACook: confirmedCookers,
    },
    library: {
      totalRecipes,
      everTouched: touchedRecipeIds.size,
      everPlanned: plannedRecipeIds.size,
      neverTouchedPct: totalRecipes ? Math.round(((totalRecipes - touchedRecipeIds.size) / totalRecipes) * 100) : 0,
    },
    dormant: {
      count: dormantAccounts,
      pct: trackedAccounts ? Math.round((dormantAccounts / trackedAccounts) * 100) : 0,
      thresholdDays: DORMANT_AFTER_DAYS,
      unknownActivity,
    },
    crossDevice: {
      trackedAccounts: deviceTrackedAccounts,
      multiDevice: multiDeviceAccounts,
      pct: deviceTrackedAccounts ? Math.round((multiDeviceAccounts / deviceTrackedAccounts) * 100) : 0,
    },
  };
}

// ------------------------------------------------------------ Search Console
// Uses the same service account as GA4. It needs adding as a user on the
// Search Console property (Settings > Users and permissions, "Restricted" is
// enough), and the Google Search Console API enabled in that account's Google
// Cloud project. GSC_SITE can name the property; otherwise the one for
// solosupper.co.uk is found. Google's numbers lag by two or three days.
async function fetchSearchConsole(keyJson) {
  const key = JSON.parse(keyJson);
  const out = { configured: false, serviceAccount: key.client_email };
  const client = new JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const api = 'https://www.googleapis.com/webmasters/v3';
  const day = (n) => new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
  try {
    let site = process.env.GSC_SITE;
    if (!site) {
      const { data } = await client.request({ url: `${api}/sites` });
      const mine = (data.siteEntry || []).filter((x) => /solosupper\.co\.uk/.test(x.siteUrl) && x.permissionLevel !== 'siteUnverifiedUser');
      site = (mine.find((x) => x.siteUrl.startsWith('sc-domain:')) || mine[0] || {}).siteUrl;
      if (!site) { out.error = 'This service account has not been added to the solosupper.co.uk property in Search Console yet.'; return out; }
    }
    out.site = site;
    const query = async (body) => {
      const { data } = await client.request({ url: `${api}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, method: 'POST', data: body });
      return data.rows || [];
    };
    const sum = (rows) => {
      const t = rows.reduce((a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions, pos: a.pos + r.position * r.impressions }), { clicks: 0, impressions: 0, pos: 0 });
      return { clicks: t.clicks, impressions: t.impressions, ctr: t.impressions ? t.clicks / t.impressions : 0, position: t.impressions ? t.pos / t.impressions : 0 };
    };
    const daily = await query({ startDate: day(90), endDate: day(0), dimensions: ['date'], rowLimit: 1000 });
    out.daily = daily.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
    const last = out.daily.length ? out.daily[out.daily.length - 1].date : day(3);
    const lastMs = Date.parse(last + 'T00:00:00Z');
    const inRange = (from, to) => daily.filter((r) => { const t = Date.parse(r.keys[0] + 'T00:00:00Z'); return t > lastMs - to * DAY_MS && t <= lastMs - from * DAY_MS; });
    out.dataTo = last;
    out.last28 = sum(inRange(0, 28));
    out.prev28 = sum(inRange(28, 56));
    const range28 = { startDate: new Date(lastMs - 27 * DAY_MS).toISOString().slice(0, 10), endDate: last };
    out.topQueries = (await query({ ...range28, dimensions: ['query'], rowLimit: 15 }))
      .map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
    out.topPages = (await query({ ...range28, dimensions: ['page'], rowLimit: 10 }))
      .map((r) => ({ path: r.keys[0].replace(/^https?:\/\/[^/]+/, '') || '/', clicks: r.clicks, impressions: r.impressions, position: r.position }));
    out.pagesWithImpressions = (await query({ ...range28, dimensions: ['page'], rowLimit: 5000 })).length;
    try {
      const { data } = await client.request({ url: `${api}/sites/${encodeURIComponent(site)}/sitemaps` });
      out.sitemaps = (data.sitemap || []).map((m) => ({ path: m.path, lastDownloaded: m.lastDownloaded || null, errors: Number(m.errors) || 0, warnings: Number(m.warnings) || 0,
        submitted: (m.contents || []).reduce((t, c) => t + (Number(c.submitted) || 0), 0) }));
    } catch (e) { out.sitemaps = []; }
    out.configured = true;
  } catch (err) {
    const msg = (err.response && err.response.data && err.response.data.error && err.response.data.error.message) || err.message;
    out.error = /has not been used|is disabled/i.test(msg) ? 'The Google Search Console API is not switched on for this service account\'s Google Cloud project yet.' : msg;
  }
  return out;
}

// ------------------------------------------------------------ Cloudflare Web Analytics
// Every visit, cookies or not (Google Analytics only counts people who say
// yes to the banner). Needs a Cloudflare API token with Account > Account
// Analytics > Read, as the CF_API_TOKEN secret. CF_ACCOUNT_ID is optional.
async function fetchCloudflare() {
  const token = process.env.CF_API_TOKEN;
  if (!token) return { configured: false, error: 'Add a Cloudflare API token (Account Analytics: Read) as the GitHub secret CF_API_TOKEN.' };
  const host = process.env.CF_HOST || 'solosupper.co.uk';
  const headers = { authorization: 'Bearer ' + token, 'content-type': 'application/json' };
  try {
    let account = process.env.CF_ACCOUNT_ID;
    if (!account) {
      const a = await (await fetch('https://api.cloudflare.com/client/v4/accounts', { headers })).json();
      if (!a.success || !a.result || !a.result.length) throw new Error('Add your Cloudflare account ID as the GitHub secret CF_ACCOUNT_ID (this token can\'t look it up).');
      account = a.result[0].id;
    }
    const day = (n) => new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
    const f = '{ date_geq: $d0, date_leq: $d1, requestHost: $h }';
    const query = `query ($a: String!, $d0: Date!, $d1: Date!, $h: String!) { viewer { accounts(filter: { accountTag: $a }) {
      daily: rumPageloadEventsAdaptiveGroups(limit: 100, filter: ${f}, orderBy: [date_ASC]) { count sum { visits } dimensions { date } }
      pages: rumPageloadEventsAdaptiveGroups(limit: 10, filter: ${f}, orderBy: [count_DESC]) { count dimensions { requestPath } }
      refs: rumPageloadEventsAdaptiveGroups(limit: 10, filter: ${f}, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost } }
      countries: rumPageloadEventsAdaptiveGroups(limit: 8, filter: ${f}, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { countryName } }
      devices: rumPageloadEventsAdaptiveGroups(limit: 5, filter: ${f}, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { deviceType } }
    } } }`;
    const r = await fetch('https://api.cloudflare.com/client/v4/graphql', { method: 'POST', headers, body: JSON.stringify({ query, variables: { a: account, d0: day(29), d1: day(0), h: host } }) });
    const j = await r.json();
    if (j.errors && j.errors.length) throw new Error(j.errors.map((e) => e.message).join('; '));
    const acc = (((j.data || {}).viewer || {}).accounts || [])[0] || {};
    const daily = (acc.daily || []).map((x) => ({ date: x.dimensions.date, visits: x.sum.visits, views: x.count }));
    const since = (n) => daily.filter((x) => x.date >= day(n - 1)).reduce((t, x) => ({ visits: t.visits + x.visits, views: t.views + x.views }), { visits: 0, views: 0 });
    return {
      configured: true, host,
      daily, last7: since(7), last30: since(30),
      pages: (acc.pages || []).map((x) => ({ path: x.dimensions.requestPath, views: x.count })),
      referrers: (acc.refs || []).map((x) => ({ host: x.dimensions.refererHost || '(direct or app)', visits: x.sum.visits })),
      countries: (acc.countries || []).map((x) => ({ name: x.dimensions.countryName, visits: x.sum.visits })),
      devices: (acc.devices || []).map((x) => ({ name: x.dimensions.deviceType, visits: x.sum.visits })),
    };
  } catch (err) {
    return { configured: false, error: err.message };
  }
}

async function main() {
  const propertyId = requireEnv('GA4_PROPERTY_ID');
  const ga4Key = requireEnv('GA4_SERVICE_ACCOUNT_KEY');
  const firebaseKey = requireEnv('FIREBASE_SERVICE_ACCOUNT_KEY');

  const analyticsClient = new BetaAnalyticsDataClient({ credentials: JSON.parse(ga4Key) });
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseKey)),
  });

  console.log('Fetching GA4 data...');
  const ga4Data = await fetchGA4(scoped(analyticsClient, SOLO_FILTER), propertyId);

  console.log('Fetching social traffic from GA4...');
  const social = await fetchSocial(scoped(analyticsClient, SOLO_FILTER), propertyId);

  console.log('Fetching traffic for the other websites...');
  const otherSites = await fetchOtherSites(analyticsClient, propertyId);

  console.log('Fetching Search Console data...');
  const search = await fetchSearchConsole(ga4Key);
  // As a GitHub annotation too, so the run's summary shows whether it worked.
  console.log(search.configured ? `::notice title=Search Console::Connected to ${search.site}, data to ${search.dataTo}, ${search.last28.impressions} impressions in 28 days` : `::warning title=Search Console::Not ready (${search.serviceAccount}): ${search.error}`);

  console.log('Fetching Cloudflare Web Analytics...');
  const cloudflare = await fetchCloudflare();
  console.log(cloudflare.configured ? '::notice title=Cloudflare Web Analytics::Connected' : `::warning title=Cloudflare Web Analytics::Not ready: ${cloudflare.error}`);

  console.log('Fetching Firebase sign-up data...');
  const signups = await fetchFirebaseSignups();

  console.log('Fetching recipe/device engagement data from Firestore...');
  const titles = loadRecipeTitles();
  const engagement = await fetchEngagement(titles, signups.totalUsers);

  const output = {
    generatedAt: new Date().toISOString(),
    traffic: ga4Data.traffic,
    signups,
    retention: ga4Data.retention,
    stickiness: ga4Data.stickiness,
    platform: ga4Data.platform,
    siteHealth: ga4Data.siteHealth,
    social,
    search,
    cloudflare,
    otherSites,
    engagement,
  };

  // Stored as one JSON string: simpler than mapping every nested list to Firestore fields.
  await admin.firestore().collection('admin').doc('dashboard').set({
    json: JSON.stringify(output),
    updatedAt: Date.now(),
  });
  console.log('Saved to Firestore admin/dashboard');

  if (process.env.DASHBOARD_FILE === '1') {
    const outPath = path.join(__dirname, '..', 'dashboard-data.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error('fetch-dashboard-data failed:', err);
  process.exit(1);
});
