const fs = require('fs');

const files = fs.readdirSync('docs');
for (const file of files) {
    if (file.endsWith('.md')) {
        const path = 'docs/' + file;
        let content = fs.readFileSync(path, 'utf-8');
        if (content.startsWith('---')) {
            content = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
            fs.writeFileSync(path, content, 'utf-8');
            console.log(`Cleaned ${file}`);
        }
    }
}
