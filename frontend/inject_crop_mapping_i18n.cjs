const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "crop_mapping_title": "የሰብል እና የሙያ ዘርፍ ማጣመሪያ",
  "crop_mapping_desc": "በእያንዳንዱ ቀበሌ የትኛው የሙያ ዘርፍ የትኛውን ዓለም አቀፍ ሰብል እንደሚያስተዳድር ይወስኑ። ይህ የምክክር አቅጣጫን ይወስናል።",
  "select_kebele_1": "1. ቀበሌ ይምረጡ",
  "search_kebele_placeholder": "ሁሉንም ቀበሌዎች ለማየት ባዶ ይተውት፣ ወይም ለማጣራት ይተይቡ...",
  "no_kebeles_found": "ምንም ቀበሌዎች አልተገኙም።",
  "kebele_step_2": "2. {{kebeleName}}",
  "no_specializations_yet_admin": "ይህ ቀበሌ እስካሁን ምንም የሙያ ዘርፍ የለውም — ሰብሎች እዚህ ከመጣመራቸው በፊት የዋና ባለሙያው መፍጠር አለበት።",
  "select_crop": "-- ሰብል ይምረጡ --",
  "select_specialization": "-- የሙያ ዘርፍ ይምረጡ --",
  "mapping_status": "በማጣመር ላይ...",
  "map_crop": "ሰብል አጣምር",
  "current_mappings": "የአሁን ማጣመሪያዎች",
  "no_crops_in_catalog": "በማውጫው ውስጥ እስካሁን ምንም ሰብሎች የሉም።",
  "not_mapped_in_kebele": "በዚህ ቀበሌ ውስጥ አልተጣመረም።",
  "remove_mapping": "ማጣመሪያን አስወግድ",
  "remove_mapping_confirm": "ይህንን የሙያ ዘርፍ ማጣመሪያ ከሰብሉ ላይ ማስወገድ ይፈልጋሉ?",
  "failed_load_kebeles": "ቀበሌዎችን መጫን አልተሳካም።",
  "failed_load_kebele_data": "የዚህን ቀበሌ መረጃ መጫን አልተሳካም።",
  "select_crop_and_spec": "እባክዎ ሁለቱንም ሰብል እና የሙያ ዘርፍ ይምረጡ።",
  "crop_mapped_success": "ሰብሉ ከሙያ ዘርፉ ጋር ተጣምሯል።",
  "failed_map_crop": "ሰብሉን ማጣመር አልተሳካም።",
  "failed_unmap": "ማጣመሪያውን ማስወገድ አልተሳካም።"
};

const englishDefaults = {
  "crop_mapping_title": "Crop-to-Specialization Mapping",
  "crop_mapping_desc": "Decide which specialization, in each Kebele, handles each global crop. This determines consultation routing.",
  "select_kebele_1": "1. Select a Kebele",
  "search_kebele_placeholder": "Leave blank to see all Kebeles, or type to filter...",
  "no_kebeles_found": "No Kebeles found.",
  "kebele_step_2": "2. {{kebeleName}}",
  "no_specializations_yet_admin": "This Kebele has no specializations yet — its Lead Officer needs to create some before crops can be mapped here.",
  "select_crop": "-- Select a crop --",
  "select_specialization": "-- Select a specialization --",
  "mapping_status": "Mapping...",
  "map_crop": "Map Crop",
  "current_mappings": "Current Mappings",
  "no_crops_in_catalog": "No crops in the catalog yet.",
  "not_mapped_in_kebele": "Not mapped in this Kebele.",
  "remove_mapping": "Remove mapping",
  "remove_mapping_confirm": "Remove this specialization mapping from the crop?",
  "failed_load_kebeles": "Failed to load Kebeles.",
  "failed_load_kebele_data": "Failed to load data for this Kebele.",
  "select_crop_and_spec": "Select both a crop and a specialization.",
  "crop_mapped_success": "Crop mapped to specialization.",
  "failed_map_crop": "Failed to map crop.",
  "failed_unmap": "Failed to unmap."
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}
for (const [key, enValue] of Object.entries(englishDefaults)) {
  enData[key] = enValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Crop Mapping page.");
