const fs = require('fs');

const amTranslations = {
  "browse_farmer_predictions": "የአርሶ አደር ምርመራዎችን አስስ",
  "select_kebele_explore": "የምርመራ እንቅስቃሴን ለመቃኘት ቀበሌ ይምረጡ።",
  "search_kebele_name": "ቀበሌን በስም ይፈልጉ...",
  "name_asc": "ስም (ከ ሀ-ፐ)",
  "name_desc": "ስም (ከ ፐ-ሀ)",
  "most_recently_active": "በቅርብ ጊዜ ንቁ የሆነ",
  "most_predictions": "ብዙ ምርመራዎች ያላቸው",
  "failed_load_kebeles_browse": "ቀበሌዎችን መጫን አልተቻለም።",
  "loading_kebeles": "ቀበሌዎችን በመጫን ላይ...",
  "no_kebeles_found": "ምንም ቀበሌ አልተገኘም።",
  "predictions_plural": "ምርመራዎች",
  "prediction_singular": "ምርመራ",
  "last_activity": "የመጨረሻ እንቅስቃሴ"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));

const enPath = './src/locales/en.json';
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const enTranslations = {
  "browse_farmer_predictions": "Browse Farmer Predictions",
  "select_kebele_explore": "Select a Kebele to explore prediction activity.",
  "search_kebele_name": "Search Kebele by name...",
  "name_asc": "Name (A–Z)",
  "name_desc": "Name (Z–A)",
  "most_recently_active": "Most recently active",
  "most_predictions": "Most predictions",
  "failed_load_kebeles_browse": "Could not load Kebeles.",
  "loading_kebeles": "Loading kebeles...",
  "no_kebeles_found": "No Kebeles found.",
  "predictions_plural": "predictions",
  "prediction_singular": "prediction",
  "last_activity": "Last activity"
};

for (const [key, value] of Object.entries(enTranslations)) {
  enData[key] = value;
}
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Browse Predictions translations applied.');
