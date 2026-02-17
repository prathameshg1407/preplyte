import fs from 'fs';
const path = 'src/module/admin/lms/course/course.controller.ts';
try {
    console.log(fs.readFileSync(path, 'utf8'));
} catch (err) {
    console.error(err);
}
