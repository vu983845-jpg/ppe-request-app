const fs = require('fs');
const files = [
    'src/app/actions/dept-head.ts',
    'src/app/actions/hse.ts',
    'src/app/actions/hr.ts',
    'src/app/actions/plant-manager.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the import
    content = content.replace(/import \{ sendEmail, generateStatusEmailHtml \} from '@\/lib\/email'\n?/, '');

    // Remove individual await sendEmail({ ... }) blocks
    content = content.replace(/await sendEmail\(\{[\s\S]*?\}\)(?:\.catch\([^)]+\))?;?/g, '');

    // Remove the unused HTML generators
    content = content.replace(/const [a-zA-Z]+Html = generateStatusEmailHtml\(\{[\s\S]*?\}\);?/g, '');
    content = content.replace(/const baseUrl = process\.env\.APP_BASE_URL \|\| 'http:\/\/localhost:3000';?/g, '');
    content = content.replace(/\/\/ 1\. To HSE/g, '');
    content = content.replace(/\/\/ 2\. To Requester \(if has email\)/g, '');
    content = content.replace(/\/\/ Mail Requester/g, '');
    content = content.replace(/if \(request\.requester_email\) \{[\s\S]*?\n  \}/g, '');
    content = content.replace(/if \(!request\.requester_email\) return \{ success: true \}/g, '');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned emails in ${file}`);
});
