const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "my_consultations_desc": "የግብርና ምክክሮችዎን ይከታተሉ እና ያስተዳድሩ",
  "unassigned": "ያልተመደበ",
  "assigned_to": "ተመድቧል ለ"
};

for (const [key, amValue] of Object.entries(translations)) {
  if (!amData[key]) {
      amData[key] = amValue;
  }
}

// In case assigned_to wasn't fully saved before or if we need to enforce it
amData["my_consultations_desc"] = "የግብርና ምክክሮችዎን ይከታተሉ እና ያስተዳድሩ";
amData["unassigned"] = "ያልተመደበ";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
console.log("Injected my consultations desc translations.");
