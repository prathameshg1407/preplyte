import fs from 'fs';
import path from 'path';

const root = 'src/module/admin/lms';
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else {
            console.log(`${filePath}: ${stat.size} bytes`);
        }
    });
}
try {
    walk(root);
} catch (e) { console.error(e); }
