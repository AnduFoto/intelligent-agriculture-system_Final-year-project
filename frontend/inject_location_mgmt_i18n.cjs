const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "location_management": "የአካባቢ አስተዳደር",
  "location_management_subtitle": "ክልሎችን፣ ዞኖችን፣ ልዩ ወረዳዎችን፣ ወረዳዎችን እና ቀበሌዎችን ያስተዳድሩ።",
  "name_required": "ስም ግዴታ ነው።",
  "failed_to_rename": "ስም መቀየር አልተሳካም።",
  "save": "አስቀምጥ",
  "cancel": "ሰርዝ",
  "edit": "አስተካክል",
  "delete": "ሰርዝ",
  "failed_create_region": "ክልል መፍጠር አልተሳካም።",
  "regions": "ክልሎች",
  "add_region": "ክልል አክል",
  "region_name": "የክልል ስም",
  "enter_region_name": "የክልል ስም ያስገቡ",
  "add": "አክል",
  "loading_regions": "ክልሎችን በመጫን ላይ...",
  "no_regions_yet": "ምንም ክልሎች የሉም።",
  "failed_add_zone": "ዞን ማከል አልተሳካም።",
  "failed_add_special_woreda": "ልዩ ወረዳ ማከል አልተሳካም።",
  "back_to_regions": "ወደ ክልሎች ተመለስ",
  "region": "ክልል",
  "zones": "ዞኖች",
  "add_zone": "ዞን አክል",
  "zone_name": "የዞን ስም",
  "no_zones_yet": "ምንም ዞኖች የሉም።",
  "special_woredas": "ልዩ ወረዳዎች",
  "add_special_woreda": "ልዩ ወረዳ አክል",
  "special_woreda_name": "የልዩ ወረዳ ስም",
  "no_special_woredas_yet": "ምንም ልዩ ወረዳዎች የሉም።",
  "failed_add_woreda": "ወረዳ ማከል አልተሳካም።",
  "back_to_region": "ወደ ክልል ተመለስ",
  "zone": "ዞን",
  "woredas": "ወረዳዎች",
  "add_woreda": "ወረዳ አክል",
  "woreda_name": "የወረዳ ስም",
  "no_woredas_yet": "ምንም ወረዳዎች የሉም።",
  "failed_add_kebele": "ቀበሌ ማከል አልተሳካም።",
  "back_to_zone": "ወደ ዞን ተመለስ",
  "woreda": "ወረዳ",
  "kebeles": "ቀበሌዎች",
  "add_kebele": "ቀበሌ አክል",
  "kebele_name": "የቀበሌ ስም",
  "no_kebeles_yet": "ምንም ቀበሌዎች የሉም።",
  "special_woreda": "ልዩ ወረዳ"
};

const englishDefaults = {
  "location_management": "Location Management",
  "location_management_subtitle": "Manage Regions, Zones, Special Woredas, Woredas, and Kebeles.",
  "name_required": "Name is required.",
  "failed_to_rename": "Failed to rename.",
  "save": "Save",
  "cancel": "Cancel",
  "edit": "Edit",
  "delete": "Delete",
  "failed_create_region": "Failed to create Region.",
  "regions": "Regions",
  "add_region": "Add Region",
  "region_name": "Region Name",
  "enter_region_name": "Enter region name",
  "add": "Add",
  "loading_regions": "Loading regions...",
  "no_regions_yet": "No regions yet.",
  "failed_add_zone": "Failed to add Zone.",
  "failed_add_special_woreda": "Failed to add Special Woreda.",
  "back_to_regions": "Back to Regions",
  "region": "Region",
  "zones": "Zones",
  "add_zone": "Add Zone",
  "zone_name": "Zone name",
  "no_zones_yet": "No zones yet.",
  "special_woredas": "Special Woredas",
  "add_special_woreda": "Add Special Woreda",
  "special_woreda_name": "Special Woreda name",
  "no_special_woredas_yet": "No special woredas yet.",
  "failed_add_woreda": "Failed to add Woreda.",
  "back_to_region": "Back to Region",
  "zone": "Zone",
  "woredas": "Woredas",
  "add_woreda": "Add Woreda",
  "woreda_name": "Woreda name",
  "no_woredas_yet": "No woredas yet.",
  "failed_add_kebele": "Failed to add Kebele.",
  "back_to_zone": "Back to Zone",
  "woreda": "Woreda",
  "kebeles": "Kebeles",
  "add_kebele": "Add Kebele",
  "kebele_name": "Kebele name",
  "no_kebeles_yet": "No kebeles yet.",
  "special_woreda": "Special Woreda"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}

for (const [key, enValue] of Object.entries(englishDefaults)) {
  enData[key] = enValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Location Management page.");
