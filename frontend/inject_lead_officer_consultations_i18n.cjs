const fs = require('fs');

const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';

const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "lead_officer_overview": "የዋና ባለሙያ አጠቃላይ እይታ ለ",
  "officer_workload": "የባለሙያ የስራ ጫና",
  "all_statuses": "ሁሉም ሁኔታዎች",
  "assigned_to": "ተመድቧል ለ",
  "farmer_label": "አርሶ አደር:",
  "no_officers_assigned": "ለዚህ ቀበሌ የተመደበ ባለሙያ የለም።"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      // Create English defaults if missing
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["lead_officer_overview"] = "Lead Officer overview for";
enData["officer_workload"] = "Officer Workload";
enData["all_statuses"] = "All statuses";
enData["assigned_to"] = "Assigned to";
enData["farmer_label"] = "Farmer: ";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Lead Officer Consultations Page.");
