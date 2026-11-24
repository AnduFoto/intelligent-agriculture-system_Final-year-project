const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "officer_kebele_assignments": "የባለሙያ ቀበሌ ምደባዎች",
  "select_officer_to_manage": "የተመደቡላቸውን ቀበሌዎች ለማስተዳደር የግብርና ባለሙያ ይምረጡ።",
  "loading_officers": "ባለሙያዎችን በመጫን ላይ...",
  "no_officers_yet": "እስካሁን ምንም የባለሙያ አካውንቶች የሉም።",
  "manage_kebeles_arrow": "ቀበሌዎችን ያስተዳድሩ →"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["officer_kebele_assignments"] = "Officer Kebele Assignments";
enData["select_officer_to_manage"] = "Select an Agriculture Officer to manage their assigned Kebeles.";
enData["loading_officers"] = "Loading officers...";
enData["no_officers_yet"] = "No Officer accounts exist yet.";
enData["manage_kebeles_arrow"] = "Manage Kebeles →";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Officer Kebele Assignments page.");
