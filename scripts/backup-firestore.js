/*
 * Nightly backup of everything Solo Supper keeps in Firebase: every Firestore
 * document (accounts, Pro status, planners, gift and promo codes, dashboard
 * data) and the list of sign-in accounts. Run by
 * .github/workflows/backup.yml.
 *
 * The repository is public, so the file is encrypted (AES-256-GCM with a key
 * made from BACKUP_PASSPHRASE) before it is stored as a workflow artifact.
 * Without the passphrase it is unreadable. To read one:
 *
 *   BACKUP_PASSPHRASE=... node backup-decrypt.js solo-supper-2026-10-13.ssbk > backup.json
 *
 * Env: FIREBASE_SERVICE_ACCOUNT_KEY (JSON), BACKUP_PASSPHRASE, OUT_DIR.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const admin = require('firebase-admin');

function fail(msg) { console.error('::error::' + msg); process.exit(1); }

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const pass = process.env.BACKUP_PASSPHRASE;
if (!key) fail('FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
if (!pass || pass.length < 12) fail('BACKUP_PASSPHRASE is not set (or shorter than 12 characters). Add it in GitHub: Settings > Secrets and variables > Actions > New repository secret, and keep a copy in your password manager: backups cannot be read without it.');

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(key)) });
const db = admin.firestore();

// Firestore values that JSON can't hold directly.
function plain(v) {
  if (v === null || v === undefined) return v;
  if (v instanceof admin.firestore.Timestamp) return { __time: v.toDate().toISOString() };
  if (v instanceof admin.firestore.GeoPoint) return { __geo: [v.latitude, v.longitude] };
  if (v instanceof admin.firestore.DocumentReference) return { __ref: v.path };
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return { __bytes: Buffer.from(v).toString('base64') };
  if (Array.isArray(v)) return v.map(plain);
  if (typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = plain(v[k]); return o; }
  return v;
}

const counts = {};
async function dumpCollection(col) {
  const out = {};
  // listDocuments also finds "empty" parents such as users/{uid}, which hold
  // only a planner subcollection.
  const refs = await col.listDocuments();
  for (const ref of refs) {
    const snap = await ref.get();
    const entry = {};
    if (snap.exists) entry.data = plain(snap.data());
    const subs = await ref.listCollections();
    if (subs.length) {
      entry.collections = {};
      for (const sub of subs) entry.collections[sub.id] = await dumpCollection(sub);
    }
    out[ref.id] = entry;
    counts[col.path.replace(/\/[^/]+\//g, '/*/')] = (counts[col.path.replace(/\/[^/]+\//g, '/*/')] || 0) + 1;
  }
  return out;
}

async function dumpAuth() {
  const users = [];
  let token;
  do {
    const page = await admin.auth().listUsers(1000, token);
    page.users.forEach(function (u) {
      users.push({ uid: u.uid, email: u.email || null, emailVerified: u.emailVerified, displayName: u.displayName || null,
        providers: u.providerData.map(function (p) { return p.providerId; }), disabled: u.disabled,
        created: u.metadata.creationTime, lastSignIn: u.metadata.lastSignInTime });
    });
    token = page.pageToken;
  } while (token);
  return users;
}

function encrypt(buf, passphrase) {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const k = crypto.scryptSync(passphrase, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const c = crypto.createCipheriv('aes-256-gcm', k, iv);
  const body = Buffer.concat([c.update(buf), c.final()]);
  return Buffer.concat([Buffer.from('SSBK1'), salt, iv, c.getAuthTag(), body]);
}

(async function main() {
  const started = Date.now();
  const firestore = {};
  const cols = await db.listCollections();
  for (const col of cols) firestore[col.id] = await dumpCollection(col);
  let auth = [];
  try { auth = await dumpAuth(); } catch (e) { console.log('::warning::Could not list sign-in accounts (' + e.message + '); Firestore was still backed up.'); }
  const doc = { kind: 'solo-supper-backup', version: 1, createdAt: new Date().toISOString(),
    projectId: JSON.parse(key).project_id, firestore: firestore, auth: auth };
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify(doc)));
  const outDir = process.env.OUT_DIR || 'backup-out';
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'solo-supper-' + doc.createdAt.slice(0, 10) + '.ssbk');
  fs.writeFileSync(file, encrypt(gz, pass));
  console.log('Backed up ' + Object.keys(counts).map(function (k) { return k + ': ' + counts[k]; }).join(', ') +
    '; sign-in accounts: ' + auth.length + '. ' + Math.round(fs.statSync(file).size / 1024) + ' KB encrypted, in ' + Math.round((Date.now() - started) / 1000) + 's.');
})().catch(function (e) { fail('Backup failed: ' + (e && e.message || e)); });
