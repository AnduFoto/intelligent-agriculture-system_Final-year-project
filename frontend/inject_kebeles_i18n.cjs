const fs = require('fs');

const amTranslations = {
  "my_assigned_kebeles": "የተመደቡልኝ ቀበሌዎች",
  "my_assigned_kebeles_subtitle": "በአስተዳዳሪ የተመደቡልዎት ቀበሌዎች።",
  "failed_load_kebeles_assigned": "የተመደቡልዎትን ቀበሌዎች መጫን አልተቻለም።",
  "no_assigned_kebeles_contact_admin": "እስካሁን ምንም ቀበሌ አልተመደበልዎትም። እባክዎ አስተዳዳሪን ያነጋግሩ።",
  "assigned": "ተመድቧል፡",
  "by": "በ"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));

const enPath = './src/locales/en.json';
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const enTranslations = {
  "my_assigned_kebeles": "My Assigned Kebeles",
  "my_assigned_kebeles_subtitle": "The Kebeles you cover, as assigned by an Administrator.",
  "failed_load_kebeles_assigned": "Could not load your assigned Kebeles.",
  "no_assigned_kebeles_contact_admin": "No Kebeles have been assigned to you yet. Contact an Administrator.",
  "assigned": "Assigned",
  "by": "by"
};

for (const [key, value] of Object.entries(enTranslations)) {
  enData[key] = value;
}
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('My Kebeles translations applied.');
