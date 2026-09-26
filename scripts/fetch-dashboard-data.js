// Pulls traffic, sign-up and retention numbers for the Solo Supper dashboard.
// Reads GA4 via the Analytics Data API and sign-ups via Firebase Auth,
// then writes the combined result to dashboard-data.json at the repo root.
//
// Required environment variables (set as GitHub Actions secrets):
//   GA4_PROPERTY_ID          e.g. "123456789" (numeric only, no "properties/" prefix)
//   GA4_SERVICE_ACCOUNT_KEY  full contents of the GA4 service account JSON key
//   FIREBASE_SERVICE_ACCOUNT_KEY  full contents of the Firebase service account JSON key

const fs = require('fs');
const path = require('path');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const admin = require('firebase-admin');

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

  async function totals(startDate) {
    const [res] = await analyticsClient.runReport({
      property,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: metricNames.map((name) => ({ name })),
    });
    if (!res.rows || res.rows.length === 0) {
      return Object.fromEntries(metricNames.map((n) => [n, 0]));
    }
    return metricRow(res.rows[0], metricNames);
  }

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
  };
}

async function fetchFirebaseSignups(serviceAccountKey) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
  });

  let users = [];
  let pageToken;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users = users.concat(result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const creationTimes = users.map((u) => new Date(u.metadata.creationTime).getTime());
  const newLast7Days = creationTimes.filter((t) => now - t <= 7 * dayMs).length;
  const newLast30Days = creationTimes.filter((t) => now - t <= 30 * dayMs).length;

  // Daily sign-up counts for the last 30 days, oldest first.
  const dailyBuckets = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * dayMs).toISOString().slice(0, 10);
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

async function main() {
  const propertyId = requireEnv('GA4_PROPERTY_ID');
  const ga4Key = requireEnv('GA4_SERVICE_ACCOUNT_KEY');
  const firebaseKey = requireEnv('FIREBASE_SERVICE_ACCOUNT_KEY');

  const analyticsClient = new BetaAnalyticsDataClient({ credentials: JSON.parse(ga4Key) });

  console.log('Fetching GA4 data...');
  const ga4Data = await fetchGA4(analyticsClient, propertyId);

  console.log('Fetching Firebase sign-up data...');
  const signups = await fetchFirebaseSignups(firebaseKey);

  const output = {
    generatedAt: new Date().toISOString(),
    traffic: ga4Data.traffic,
    signups,
    retention: ga4Data.retention,
  };

  const outPath = path.join(__dirname, '..', 'dashboard-data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error('fetch-dashboard-data failed:', err);
  process.exit(1);
});
