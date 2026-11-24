const fs = require('fs');

const amTranslations = {
  "my_kebeles": "የእኔ ቀበሌዎች",
  "consultation_requests": "የምክክር ጥያቄዎች",
  "browse_predictions": "ምርመራዎችን አስስ",
  "saved_content": "የተቀመጡ ማህደሮች",
  "manage_knowledge_base": "የእውቀት ቋት አስተዳድር",
  "officer_workspace": "የባለሙያ የስራ ገበታ",
  "farmer_workspace": "የአርሶ አደር የስራ ገበታ",
  "admin_workspace": "የአስተዳዳሪ የስራ ገበታ",
  "crop_disease_detection_desc": "የሰብል ቅጠል ግልጽ ፎቶ በማስገባት የአርቴፊሻል ኢንተለጀንስ ምርመራ ያግኙ።",
  "view_history": "ታሪክ ይመልከቱ",
  "drag_and_drop_image": "ምስሉን እዚህ ይጎትቱ",
  "or_click_to_browse": "ወይም ከኮምፒውተርዎ ለመምረጥ ጠቅ ያድርጉ",
  "supported_formats": "የሚደገፉ የፋይል አይነቶች፡ JPG, PNG, WEBP",
  "analyze_image": "ምስል መርምር",
  "disease_detection": "የሰብል በሽታ ምርመራ",
  "consultations": "ምክክሮች",
  "specialization_mgmt": "የሙያ ዘርፍ አስተዳድር",
  "assign_kebele_managers": "የቀበሌ አስተዳዳሪዎችን መድብ",
  "officer_assignments": "የባለሙያ ምደባ",
  "lead_officers": "ዋና ባለሙያዎች",
  "crop_catalog": "የሰብል ማውጫ",
  "crop_mapping": "የሰብል ካርታ",
  "assign_woreda_managers": "የወረዳ አስተዳዳሪዎችን መድብ",
  "click_to_change": "ምስል ለመቀየር ጠቅ ያድርጉ"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));
console.log('Additional Amharic translations applied.');
