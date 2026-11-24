const fs = require('fs');

const amTranslations = {
  "saved_educational_content": "የተቀመጡ የትምህርት መርጃዎች",
  "saved_educational_content_desc": "ምልክት ያደረጉባቸውን የግብርና መመሪያዎች፣ ጥናቶች እና የመከላከያ እርምጃዎች በቀላሉ ያግኙ።",
  "no_saved_resources": "ምንም የተቀመጠ መርጃ የለም",
  "no_saved_resources_desc": "እስካሁን ምንም የትምህርት መርጃዎችን አላስቀመጡም። ጠቃሚ መመሪያዎችን ለማግኘት ቤተ-መጽሐፍቱን ያስሱ።",
  "bookmarks": "ምልክቶች"
};

const amPath = './src/locales/am.json';
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

for (const [key, value] of Object.entries(amTranslations)) {
  amData[key] = value;
}

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2));
console.log('Saved Resources translations applied.');
