/*
 * Opens a Solo Supper backup made by backup-firestore.js.
 *
 *   BACKUP_PASSPHRASE=... node backup-decrypt.js solo-supper-2026-10-13.ssbk > backup.json
 *
 * In PowerShell:
 *   $env:BACKUP_PASSPHRASE = "..."; node backup-decrypt.js solo-supper-2026-10-13.ssbk > backup.json
 */
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

const file = process.argv[2], pass = process.env.BACKUP_PASSPHRASE;
if (!file || !pass) { console.error('Usage: BACKUP_PASSPHRASE=... node backup-decrypt.js <file.ssbk>'); process.exit(1); }
const buf = fs.readFileSync(file);
if (buf.slice(0, 5).toString() !== 'SSBK1') { console.error('Not a Solo Supper backup file.'); process.exit(1); }
const salt = buf.slice(5, 21), iv = buf.slice(21, 33), tag = buf.slice(33, 49), body = buf.slice(49);
const k = crypto.scryptSync(pass, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const d = crypto.createDecipheriv('aes-256-gcm', k, iv);
d.setAuthTag(tag);
let gz;
try { gz = Buffer.concat([d.update(body), d.final()]); } catch (e) { console.error('Wrong passphrase, or the file is damaged.'); process.exit(1); }
process.stdout.write(JSON.stringify(JSON.parse(zlib.gunzipSync(gz).toString()), null, 1));
