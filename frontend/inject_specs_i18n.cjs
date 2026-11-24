const fs = require('fs');

const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';

const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "specialization_management": "የሙያ ዘርፍ አስተዳደር",
  "lead_officer_for": "ዋና ባለሙያ ለ",
  "add_professional_specialization": "አዲስ የሙያ ዘርፍ ያክሉ",
  "spec_name": "ስም",
  "spec_name_placeholder": "ለምሳሌ፦ የእፅዋት ሳይንስ እና የሰብል ምርት ባለሙያዎች",
  "spec_description": "መግለጫ (አማራጭ)",
  "spec_description_placeholder": "የዚህ ሙያ አጭር መግለጫ",
  "add_specialization": "የሙያ ዘርፍ አክል",
  "adding": "በማከል ላይ...",
  "specializations_in": "በ{{kebele}} ያሉ የሙያ ዘርፎች",
  "officers_in": "በ{{kebele}} ያሉ ባለሙያዎች",
  "inactive": "የቦዘነ",
  "active": "ንቁ",
  "officers_assigned_count": "{{count}} ባለሙያ(ዎች) ተመድበዋል",
  "activate": "አንቃ",
  "deactivate": "አቦዝን",
  "assign_officer_to_spec": "ባለሙያን ወደ ሙያ ዘርፍ መድብ",
  "select_officer": "-- ባለሙያ ይምረጡ --",
  "select_specialization": "-- የሙያ ዘርፍ ይምረጡ --",
  "assign": "መድብ",
  "assigning": "በመመደብ ላይ...",
  "no_specs_assigned": "ምንም የሙያ ዘርፍ አልተመደበም።",
  "remove": "አስወግድ",
  "remove_spec_confirm": "ይህን የሙያ ዘርፍ ከባለሙያው ላይ ማስወገድ ይፈልጋሉ?",
  "select_both_officer_spec": "እባክዎ ባለሙያ እና የሙያ ዘርፍ ይምረጡ።",
  "enter_spec_name": "እባክዎ የሙያ ዘርፍ ስም ያስገቡ።",
  "spec_created": "የሙያ ዘርፍ ተፈጥሯል።",
  "spec_assigned": "የሙያ ዘርፍ ለባለሙያው ተመድቧል።"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

enData["specialization_management"] = "Specialization Management";
enData["lead_officer_for"] = "Lead Officer for";
enData["add_professional_specialization"] = "Add Professional Specialization";
enData["spec_name"] = "Name";
enData["spec_name_placeholder"] = "e.g. Plant Science & Crop Production Officers";
enData["spec_description"] = "Description (optional)";
enData["spec_description_placeholder"] = "Short description of this specialty";
enData["add_specialization"] = "Add Specialization";
enData["adding"] = "Adding...";
enData["specializations_in"] = "Specializations in {{kebele}}";
enData["officers_in"] = "Officers in {{kebele}}";
enData["inactive"] = "Inactive";
enData["active"] = "Active";
enData["officers_assigned_count"] = "{{count}} officer(s) assigned";
enData["activate"] = "Activate";
enData["deactivate"] = "Deactivate";
enData["assign_officer_to_spec"] = "Assign Officer to Specialization";
enData["select_officer"] = "-- Select an officer --";
enData["select_specialization"] = "-- Select a specialization --";
enData["assign"] = "Assign";
enData["assigning"] = "Assigning...";
enData["no_specs_assigned"] = "No specializations assigned.";
enData["remove"] = "Remove";
enData["remove_spec_confirm"] = "Remove this specialization from the officer?";
enData["select_both_officer_spec"] = "Select both an officer and a specialization.";
enData["enter_spec_name"] = "Please enter a specialization name.";
enData["spec_created"] = "Specialization created.";
enData["spec_assigned"] = "Specialization assigned to officer.";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for specializations page.");
