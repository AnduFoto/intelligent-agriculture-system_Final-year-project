const fs = require('fs');

const amTranslations = {
  "my_educational_resources": "የእኔ የትምህርት መርጃዎች",
  "my_educational_resources_desc": "ያዘጋጁትን የግብርና እውቀት እና መርጃዎች ያስተዳድሩ።",
  "published": "ታትሟል",
  "draft": "ረቂቅ",
  "archived": "ማህደር"
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
  "published": "Published",
  "draft": "Draft",
  "archived": "Archived"
};

for (const [key, value] of Object.entries(enTranslations)) {
  enData[key] = value;
}
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('Education Dashboard translations applied.');
