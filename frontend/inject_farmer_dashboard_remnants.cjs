const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "farmer_dashboard_subtitle": "የግብርና እንቅስቃሴዎ አጠቃላይ እይታ እነሆ።",
  "unread_alerts": "ያልተነበቡ ማሳወቂያዎች"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
console.log("Injected remaining farmer dashboard translations.");
