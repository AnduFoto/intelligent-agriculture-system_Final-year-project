const fs = require('fs');
const amPath = './src/locales/am.json';
const enPath = './src/locales/en.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const translations = {
  "user_management_subtitle": "የአርሶ አደር፣ የባለሙያ እና የአስተዳዳሪ አካውንቶችን ያስተዳድሩ።",
  "create_user": "ተጠቃሚ ፍጠር",
  "search_users_placeholder": "በስም፣ ኢሜል፣ ስልክ ይፈልጉ...",
  "all_roles": "ሁሉም ሚናዎች",
  "farmer": "አርሶ አደር",
  "agriculture_officer": "የግብርና ባለሙያ",
  "administrator": "አስተዳዳሪ",
  "all_statuses": "ሁሉም ሁኔታዎች",
  "pending_verification": "ማረጋገጫ በመጠባበቅ ላይ",
  "active": "ንቁ",
  "suspended": "የታገደ",
  "hide_kebeles": "ቀበሌዎችን ደብቅ",
  "manage_kebeles": "ቀበሌዎችን ያስተዳድሩ",
  "reactivate": "እንደገና አንቃ",
  "suspend": "አግድ",
  
  // Direct matching for role strings from backend
  "role_FARMER": "አርሶ አደር",
  "role_OFFICER": "ባለሙያ",
  "role_ADMINISTRATOR": "አስተዳዳሪ",
  
  // Direct matching for status strings from backend
  "status_ACTIVE": "ንቁ",
  "status_PENDING_VERIFICATION": "ማረጋገጫ በመጠባበቅ ላይ",
  "status_SUSPENDED": "የታገደ"
};

for (const [key, amValue] of Object.entries(translations)) {
  amData[key] = amValue;
  if (!enData[key]) {
      enData[key] = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

// Fixing specific English defaults
enData["user_management_subtitle"] = "Manage Farmer, Officer, and Administrator accounts.";
enData["search_users_placeholder"] = "Search by name, email, phone...";
enData["role_FARMER"] = "FARMER";
enData["role_OFFICER"] = "OFFICER";
enData["role_ADMINISTRATOR"] = "ADMINISTRATOR";
enData["status_ACTIVE"] = "ACTIVE";
enData["status_PENDING_VERIFICATION"] = "PENDING VERIFICATION";
enData["status_SUSPENDED"] = "SUSPENDED";

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log("Injected translations for User Management page.");
