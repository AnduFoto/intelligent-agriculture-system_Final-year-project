const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "woreda_edu_managers_title": "የወረዳ ትምህርታዊ ስርዓት አስተዳዳሪዎች",
  "woreda_edu_managers_desc": "ለተወሰኑ ወረዳዎች ይፋዊ የግብርና ግብዓቶችን እንዲያስተዳድሩ ባለሙያዎችን ይመድቡ።",
  "assign_manager_btn": "አስተዳዳሪ መድብ",
  "assign_woreda_manager_modal_title": "የወረዳ ትምህርታዊ ስርዓት አስተዳዳሪ ይመድቡ",
  "select_officer_label": "ባለሙያ ይምረጡ",
  "select_officer_required": "እባክዎ ባለሙያ ይምረጡ",
  "search_officer_placeholder": "በስም ወይም በኢሜይል ይፈልጉ...",
  "cancel": "ሰርዝ",
  "officer_col": "ባለሙያ",
  "woreda_col": "ወረዳ",
  "assigned_date_col": "የተመደበበት ቀን",
  "actions_col": "እርምጃዎች",
  "remove_assignment_title": "ምደባን አስወግድ?",
  "remove_assignment_desc_woreda": "ይህ ባለሙያ ከዚህ በኋላ የዚህን ወረዳ የእውቀት ቋት ማስተዳደር አይችልም።",
  "yes_remove": "አዎ፣ አስወግድ",
  "remove": "አስወግድ",
  "failed_load_data": "መረጃ መጫን አልተሳካም",
  "woreda_location_error": "አካባቢን መወሰን አልተቻለም። ባለሙያው የወረዳ ወይም ልዩ ወረዳ አባል መሆኑን ያረጋግጡ።",
  "manager_assigned_success": "የወረዳ ትምህርታዊ ስርዓት አስተዳዳሪ በተሳካ ሁኔታ ተመድቧል",
  "failed_assign_manager": "አስተዳዳሪ መመደብ አልተሳካም",
  "manager_assignment_removed": "የአስተዳዳሪ ምደባ ተወግዷል",
  "failed_remove_assignment": "ምደባን ማስወገድ አልተሳካም"
};

const englishDefaults = {
  "woreda_edu_managers_title": "Woreda Educational System Managers",
  "woreda_edu_managers_desc": "Assign officers to manage official agricultural resources for specific Woredas.",
  "assign_manager_btn": "Assign Manager",
  "assign_woreda_manager_modal_title": "Assign Woreda Educational System Manager",
  "select_officer_label": "Select Officer",
  "select_officer_required": "Please select an officer",
  "search_officer_placeholder": "Search by name or email...",
  "cancel": "Cancel",
  "officer_col": "Officer",
  "woreda_col": "Woreda",
  "assigned_date_col": "Assigned Date",
  "actions_col": "Actions",
  "remove_assignment_title": "Remove assignment?",
  "remove_assignment_desc_woreda": "This officer will no longer be able to manage this Woreda's knowledge base.",
  "yes_remove": "Yes, Remove",
  "remove": "Remove",
  "failed_load_data": "Failed to load data",
  "woreda_location_error": "Could not determine Location. Ensure the officer belongs to a Woreda or Special Woreda.",
  "manager_assigned_success": "Woreda Educational System Manager assigned successfully",
  "failed_assign_manager": "Failed to assign manager",
  "manager_assignment_removed": "Manager assignment removed",
  "failed_remove_assignment": "Failed to remove assignment"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}
for (const [key, enValue] of Object.entries(englishDefaults)) {
  enData[key] = enValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Woreda Education Manager page.");
