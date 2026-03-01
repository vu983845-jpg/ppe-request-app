const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
let updated = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('ppe_master(name, unit)') || content.includes('ppe_master(name, unit, unit_price)')) {
        let newContent = content.replace(/ppe_master\(name, unit\)/g, 'ppe_master(name, unit, size)');
        newContent = newContent.replace(/ppe_master\(name, unit, unit_price\)/g, 'ppe_master(name, unit, unit_price, size)');
        fs.writeFileSync(file, newContent, 'utf8');
        updated++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Updated ${updated} files`);
