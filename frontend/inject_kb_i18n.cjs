const fs = require('fs');

const amTranslations = {
  "knowledge_base_desc": "በወረዳ እና በቀበሌ ትምህርት ቡድኖች የታተሙ የተረጋገጡ መመሪያዎችን፣ ጥናቶችን እና የመከላከያ እርምጃዎችን ያግኙ።",
  "search_resources_placeholder": "በርዕስ፣ በሰብል፣ ወይም በአርእስት ይፈልጉ...",
  "all_publisher_types": "ሁሉም የአሳታሚ አይነቶች",
  "woreda_education": "የወረዳ ትምህርት",
  "special_woreda_education": "የልዩ ወረዳ ትምህርት",
  "kebele_education": "የቀበሌ ትምህርት",
  "education_portal": "የትምህርት መግቢያ",
  "agricultural_knowledge_base": "የግብርና እውቀት ቋት"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));
console.log('Knowledge Base translations applied.');
