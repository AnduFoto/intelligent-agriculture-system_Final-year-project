const fs = require('fs');

const amTranslations = {
  "welcome_back_user": "እንኳን በደህና መጡ፣ {{name}}",
  "officer_dashboard_subtitle": "የእርስዎን የሥራ ኃላፊነቶች አጠቃላይ እይታ እነሆ።",
  "officer_activity": "የባለሙያ እንቅስቃሴ",
  "demo_activity_1_title": "አዲስ የምክክር ጥያቄ",
  "demo_activity_1_desc": "ከ አበበ (ቀበሌ 01)",
  "demo_activity_1_time": "ከ10 ደቂቃ በፊት",
  "demo_activity_2_title": "የምርመራ ማስጠንቀቂያ",
  "demo_activity_2_desc": "በዞን 4 ላይ ከፍተኛ የዋግ በሽታ ታይቷል",
  "demo_activity_2_time": "ከ2 ሰዓት በፊት",
  "demo_activity_3_title": "ጽሑፍ ታትሟል",
  "demo_activity_3_desc": "በ'በጋ ወራት መስኖ' ላይ ያዘጋጁት ጽሑፍ ታትሟል",
  "demo_activity_3_time": "ትናንት",
  "all_rights_reserved": "መብቱ በህግ የተጠበቀ ነው።"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));
console.log('Final Amharic translations applied.');
