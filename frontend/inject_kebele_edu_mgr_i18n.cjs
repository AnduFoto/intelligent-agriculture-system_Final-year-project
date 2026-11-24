const fs = require('fs');

const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';

const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "kebele_educational_system_managers": "የቀበሌ የትምህርት ሥርዓት አስተዳዳሪዎች",
  "assign_officers_manage_desc": "ለተወሰኑ ቀበሌዎች ይፋዊ የግብርና መረጃዎችን እንዲያስተዳድሩ ባለሙያዎችን ይመድቡ።",
  "officer_column": "ባለሙያ",
  "kebele_column": "ቀበሌ",
  "assigned_date_column": "የተመደበበት ቀን",
  "actions_column": "እርምጃዎች",
  "remove_assignment_q": "ምደባውን አስወግድ?",
  "remove_assignment_desc": "ይህ ባለሙያ ከዚህ በኋላ የዚህን ቀበሌ የእውቀት ቋት ማስተዳደር አይችልም።",
  "yes_remove": "አዎ፣ አስወግድ",
  "cancel": "ሰርዝ",
  "remove": "አስወግድ",
  "checking_authorization": "ፍቃድ በመፈተሽ ላይ...",
  "access_denied_lead_officer": "ክልከላ፡ የቀበሌ ትምህርት አስተዳዳሪዎችን ለመምራት ዋና ባለሙያ መሆን አለብዎት።",
  "assign_manager": "አስተዳዳሪ መድብ",
  "assign_kebele_manager_title": "የቀበሌ ትምህርት ሥርዓት አስተዳዳሪ መድብ",
  "select_officer_label": "ባለሙያ ይምረጡ",
  "please_select_officer": "እባክዎ ባለሙያ ይምረጡ",
  "search_name_email": "በስም ወይም በኢሜይል ይፈልጉ...",
  "failed_load_data": "መረጃ መጫን አልተሳካም",
  "could_not_determine_kebele": "ቀበሌውን ማወቅ አልተቻለም። እርስዎ ወይም ባለሙያው ለቀበሌ መመደባችሁን ያረጋግጡ።",
  "manager_assigned_success": "የቀበሌ የትምህርት ሥርዓት አስተዳዳሪ በተሳካ ሁኔታ ተመድቧል",
  "failed_assign_manager": "አስተዳዳሪ መመደብ አልተሳካም",
  "manager_assignment_removed": "የአስተዳዳሪ ምደባ ተወግዷል",
  "failed_remove_assignment": "ምደባ ማስወገድ አልተሳካም"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["kebele_educational_system_managers"] = "Kebele Educational System Managers";
enData["assign_officers_manage_desc"] = "Assign officers to manage official agricultural resources for specific Kebeles.";
enData["officer_column"] = "Officer";
enData["kebele_column"] = "Kebele";
enData["assigned_date_column"] = "Assigned Date";
enData["actions_column"] = "Actions";
enData["remove_assignment_q"] = "Remove assignment?";
enData["remove_assignment_desc"] = "This officer will no longer be able to manage this Kebele's knowledge base.";
enData["yes_remove"] = "Yes, Remove";
enData["cancel"] = "Cancel";
enData["remove"] = "Remove";
enData["checking_authorization"] = "Checking authorization...";
enData["access_denied_lead_officer"] = "Access Denied: You must be a designated Lead Officer to manage Kebele Education Managers.";
enData["assign_manager"] = "Assign Manager";
enData["assign_kebele_manager_title"] = "Assign Kebele Educational System Manager";
enData["select_officer_label"] = "Select Officer";
enData["please_select_officer"] = "Please select an officer";
enData["search_name_email"] = "Search by name or email...";
enData["failed_load_data"] = "Failed to load data";
enData["could_not_determine_kebele"] = "Could not determine Kebele. Ensure you or the officer are assigned to a Kebele.";
enData["manager_assigned_success"] = "Kebele Educational System Manager assigned successfully";
enData["failed_assign_manager"] = "Failed to assign manager";
enData["manager_assignment_removed"] = "Manager assignment removed";
enData["failed_remove_assignment"] = "Failed to remove assignment";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Kebele Education Manager page.");
