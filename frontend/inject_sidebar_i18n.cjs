const fs = require('fs');

const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';

const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "kebele_consultations": "የቀበሌ ምክክሮች",
  "officer_workspace": "የባለሙያ የስራ ቦታ",
  "admin_portal": "የአስተዳዳሪ ማዕከል",
  "farmer_workspace": "የአርሶ አደር የስራ ቦታ",
  "back_to_kebele_consultations": "ወደ ቀበሌ ምክክሮች ተመለስ",
  "failed_load_kebele_consultations": "የቀበሌ ምክክሮችን መጫን አልተሳካም",
  
  // Notification dynamic parsing fallbacks
  "notif_new_message_prefix": "አዲስ መልእክት: ",
  "notif_message_sent_prefix": "አዲስ መልእክት ልኳል",
  "notif_prediction_complete": "የበሽታ ምርመራ ተጠናቋል",
  "notif_analysis_of": "የ",
  "notif_completed": " ምርመራ ተጠናቋል: "
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      // Create English defaults if missing
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

// Fix english equivalents that we injected
enData["kebele_consultations"] = "Kebele Consultations";
enData["officer_workspace"] = "Officer Workspace";
enData["admin_portal"] = "Administrator Portal";
enData["farmer_workspace"] = "Farmer Workspace";
enData["back_to_kebele_consultations"] = "Back to Kebele Consultations";
enData["failed_load_kebele_consultations"] = "Failed to load Kebele consultations.";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for sidebar and workspace titles.");
