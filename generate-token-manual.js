const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
const payload = {
  userId: 1,
  fullName: "Abijith Asokan",
  email: "abijithasokan@crayonspictures.com",
  workspace: "studio",
  role: "admin",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
};

const secret = "streamvista_super_secret_key_2026";

const unsignedToken = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(payload));

const signature = crypto.createHmac('sha256', secret)
  .update(unsignedToken)
  .digest();

const token = unsignedToken + "." + base64url(signature);

console.log("Your StreamVista Access Token (Valid for 7 days):");
console.log(token);
