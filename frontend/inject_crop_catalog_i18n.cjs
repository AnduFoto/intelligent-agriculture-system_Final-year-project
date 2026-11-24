const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "crop_catalog": "የሰብል ማውጫ",
  "crop_catalog_desc": "ዓለም አቀፍ የሰብል ዝርዝር፣ በሁሉም ቀበሌዎች የተጋራ። ዋና ባለሙያዎች እነዚህን ከቀበሌያቸው የሙያ ዘርፎች ጋር ለየብቻ ያጣምራሉ።",
  "add_crop": "ሰብል አክል",
  "crop_name_label": "ስም",
  "crop_name_placeholder": "ለምሳሌ ጤፍ፣ ቡና፣ ቲማቲም",
  "description_optional": "መግለጫ (አማራጭ)",
  "short_description_placeholder": "አጭር መግለጫ",
  "adding": "በማከል ላይ...",
  "crops_count": "ሰብሎች ({{count}})",
  "no_crops_yet": "እስካሁን ምንም ሰብሎች አልታከሉም።",
  "mapped_to_specializations": "በሁሉም ቀበሌዎች ከ {{count}} የሙያ ዘርፍ(ፎች) ጋር ተጣምሯል",
  "deactivate": "አሰናክል",
  "activate": "አንቃ",
  "failed_load_catalog": "የሰብል ማውጫውን መጫን አልተሳካም።",
  "please_enter_crop_name": "እባክዎ የሰብል ስም ያስገቡ።",
  "crop_added_success": "ሰብሉ ወደ ማውጫው ተጨምሯል።",
  "failed_create_crop": "ሰብል መፍጠር አልተሳካም።",
  "failed_update_crop": "ሰብል ማዘመን አልተሳካም።",
  "inactive": "የማይንቀሳቀስ"
};

const englishDefaults = {
  "crop_catalog": "Crop Catalog",
  "crop_catalog_desc": "Global crop list, shared across all Kebeles. Lead Officers map these to their Kebele's specializations separately.",
  "add_crop": "Add Crop",
  "crop_name_label": "Name",
  "crop_name_placeholder": "e.g. Tef, Coffee, Tomato",
  "description_optional": "Description (optional)",
  "short_description_placeholder": "Short description",
  "adding": "Adding...",
  "crops_count": "Crops ({{count}})",
  "no_crops_yet": "No crops added yet.",
  "mapped_to_specializations": "Mapped to {{count}} specialization(s) across all Kebeles",
  "deactivate": "Deactivate",
  "activate": "Activate",
  "failed_load_catalog": "Failed to load crop catalog.",
  "please_enter_crop_name": "Please enter a crop name.",
  "crop_added_success": "Crop added to the catalog.",
  "failed_create_crop": "Failed to create crop.",
  "failed_update_crop": "Failed to update crop.",
  "inactive": "Inactive"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
}
for (const [key, enValue] of Object.entries(englishDefaults)) {
  enData[key] = enValue;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for Crop Catalog page.");
