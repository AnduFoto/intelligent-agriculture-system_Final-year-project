const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "community_forum": "የማህበረሰብ መድረክ",
  "coming_soon": "በቅርብ ቀን"
};

const englishDefaults = {
  "community_forum": "Community Forum",
  "coming_soon": "Soon"
};

for (const [key, amValue] of Object.entries(translations)) {
  if (!amData[key]) {
      amData[key] = amValue;
  }
}
for (const [key, enValue] of Object.entries(englishDefaults)) {
  if (!enData[key]) {
      enData[key] = enValue;
  }
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected forum translations.");
