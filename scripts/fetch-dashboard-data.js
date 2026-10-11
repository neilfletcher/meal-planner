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

async function fetchFirebaseSignups() {
  let users = [];
  let pageToken;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users = users.concat(result.users);
    pageToken = result.pageToken;
  } while (pageToken);

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
  const touchedRecipeIds = new Set();

  snapshot.forEach((doc) => {
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
      touchedRecipeIds.add(id);
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

  const trackedAccounts = snapshot.size;
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

async function main() {
  const propertyId = requireEnv('GA4_PROPERTY_ID');
  const ga4Key = requireEnv('GA4_SERVICE_ACCOUNT_KEY');
  const firebaseKey = requireEnv('FIREBASE_SERVICE_ACCOUNT_KEY');

  const analyticsClient = new BetaAnalyticsDataClient({ credentials: JSON.parse(ga4Key) });
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseKey)),
  });

  console.log('Fetching GA4 data...');
  const ga4Data = await fetchGA4(analyticsClient, propertyId);

  console.log('Fetching social traffic from GA4...');
  const social = await fetchSocial(analyticsClient, propertyId);

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
