const fs = require('fs');

const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';

const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "notif_new_user": "አዲስ ተጠቃሚ ተመዝግቧል",
  "notif_joined_as": "እንደ ተቀላቅሏል",
  "no_recent_activity": "ምንም የቅርብ ጊዜ እንቅስቃሴ የለም።"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      // Create English defaults if missing
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["notif_new_user"] = "New User Registered";
enData["notif_joined_as"] = "joined as";
enData["no_recent_activity"] = "No recent activity.";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for remaining dashboard items.");
