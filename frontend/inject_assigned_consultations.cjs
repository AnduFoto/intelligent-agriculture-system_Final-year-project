const fs = require('fs');

const amTranslations = {
  "assigned_consultations_desc": "የተመደቡልዎትን የአርሶ አደር ምክክሮች ያስተዳድሩ እና ምላሽ ይስጡ።"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));
console.log('Final Amharic translation for assigned consultations applied.');
