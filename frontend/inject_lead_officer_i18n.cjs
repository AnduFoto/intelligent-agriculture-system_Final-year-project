const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "lead_officer_management": "ዋና ባለሙያ አስተዳደር",
  "select_a_kebele": "1. ቀበሌ ይምረጡ",
  "search_kebele_optional": "ቀበሌ ይፈልጉ (አማራጭ)",
  "search_kebele_placeholder": "ሁሉንም ቀበሌዎች ለማየት ባዶ ይተውት፣ ወይም ለማጣራት ይተይቡ...",
  "no_kebeles_found": "ምንም ቀበሌዎች አልተገኙም።",
  "officers_and_lead_officer": "2. {{kebeleName}} — ባለሙያዎች እና ዋና ባለሙያ",
  "current_lead_officer": "የአሁኑ ዋና ባለሙያ",
  "remove_lead_officer": "አስወግድ",
  "no_lead_officer_yet": "እስካሁን ምንም ዋና ባለሙያ አልተሰየመም።",
  "officers_assigned_to_kebele": "ለዚህ ቀበሌ የተመደቡ ባለሙያዎች ({{count}})",
  "no_officers_assigned_yet": "እስካሁን ምንም ባለሙያዎች ለዚህ ቀበሌ አልተመደቡም።",
  "select_an_officer": "-- ባለሙያ ይምረጡ --",
  "replace_lead_officer": "ዋና ባለሙያውን ቀይር",
  "designate_lead_officer": "እንደ ዋና ባለሙያ ሰይም",
  "failed_load_kebeles": "ቀበሌዎችን መጫን አልተሳካም።",
  "failed_load_kebele_details": "የቀበሌ ዝርዝሮችን መጫን አልተሳካም።",
  "please_select_officer_designate": "እንደ ዋና ባለሙያ ለመሰየም እባክዎ ባለሙያ ይምረጡ።",
  "is_now_lead_officer": "{{officerName}} አሁን የ {{kebeleName}} ዋና ባለሙያ ናቸው።",
  "failed_assign_lead_officer": "ዋና ባለሙያ መመደብ አልተሳካም።",
  "lead_officer_removed_success": "የዋና ባለሙያ ስያሜ ተወግዷል።",
  "failed_remove_lead_officer": "ዋና ባለሙያ ማስወገድ አልተሳካም።"
};

const englishDefaults = {
  "lead_officer_management": "Lead Officer Management",
  "select_a_kebele": "1. Select a Kebele",
  "search_kebele_optional": "Search Kebele (optional)",
  "search_kebele_placeholder": "Leave blank to see all Kebeles, or type to filter...",
  "no_kebeles_found": "No Kebeles found.",
  "officers_and_lead_officer": "2. {{kebeleName}} — Officers & Lead Officer",
  "current_lead_officer": "Current Lead Officer",
  "remove_lead_officer": "Remove",
  "no_lead_officer_yet": "No Lead Officer designated yet.",
  "officers_assigned_to_kebele": "Officers assigned to this Kebele ({{count}})",
  "no_officers_assigned_yet": "No officers are assigned to this Kebele yet.",
  "select_an_officer": "-- Select an officer --",
  "replace_lead_officer": "Replace Lead Officer",
  "designate_lead_officer": "Designate as Lead Officer",
  "failed_load_kebeles": "Failed to load Kebeles.",
  "failed_load_kebele_details": "Failed to load Kebele details.",
  "please_select_officer_designate": "Please select an officer to designate as Lead Officer.",
  "is_now_lead_officer": "{{officerName}} is now the Lead Officer for {{kebeleName}}.",
  "failed_assign_lead_officer": "Failed to assign Lead Officer.",
  "lead_officer_removed_success": "Lead Officer designation removed.",
  "failed_remove_lead_officer": "Failed to remove Lead Officer."
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}
for (const [key, enValue] of Object.entries(englishDefaults)) {
  enData[key] = enValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Lead Officer Management page.");
