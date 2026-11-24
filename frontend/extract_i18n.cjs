const fs = require('fs');
const path = require('path');
const dict = {};

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scan(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Match t('key', 'Default text') or t("key", "Default text")
      // Simplistic regex but works for most cases
      const regex = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        dict[match[1]] = match[2];
      }
      
      // Also match without default text if we want to see missing ones?
      // Actually we just care about extracting the dict
    }
  }
}
scan('./src');
console.log('Extracted ' + Object.keys(dict).length + ' keys.');
fs.writeFileSync('./extracted_keys.json', JSON.stringify(dict, null, 2));
