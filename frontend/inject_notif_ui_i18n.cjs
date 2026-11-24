const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "notifications_title": "ማሳወቂያዎች",
  "mark_all_read": "ሁሉንም እንደተነበበ ምልክት አድርግ",
  "no_new_notifications": "ምንም አዲስ ማሳወቂያ የለም",
  "view_all_notifications": "ሁሉንም ማሳወቂያዎች ይመልከቱ",
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["notifications_title"] = "Notifications";
enData["mark_all_read"] = "Mark all as read";
enData["no_new_notifications"] = "No new notifications";
enData["view_all_notifications"] = "View All Notifications";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected notification UI translations.");
