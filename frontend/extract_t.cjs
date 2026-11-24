const fs = require('fs');

const file = fs.readFileSync('./src/pages/admin/AdminLocationManagementPage.jsx', 'utf8');
const regex = /t\('([^']+)',\s*'([^']+)'\)/g;
let match;
const keys = {};

while ((match = regex.exec(file)) !== null) {
  keys[match[1]] = match[2];
}

console.log(JSON.stringify(keys, null, 2));
