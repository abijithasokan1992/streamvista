const jwt = require('jsonwebtoken');

const JWT_SECRET = "streamvista_super_secret_key_2026";
const payload = {
  userId: 1,
  fullName: "Abijith Asokan",
  email: "abijithasokan@crayonspictures.com",
  workspace: "studio",
  role: "admin"
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
console.log("Your StreamVista Access Token (Valid for 7 days):");
console.log(token);
