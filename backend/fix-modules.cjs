const fs = require('fs');
let code = fs.readFileSync('prisma/seeds/lms-devops-course.ts', 'utf8');

// The file has multiple modules inside `modules: [` array
// We need to find each module start, e.g. `title: "...",` and add missing properties
code = code.replace(/title:\s*"([^"]*)",(\s*description:\s*"[^"]*",)?/g, (match, titleStr, descStr) => {
    // Check if this is a module or topic by looking at its surroundings, but we can safely add these to topics and modules
    // Actually, only modules require shortDescription. Let's just find `description: "...",` that follows `title: "...",` in modules.
    if (!descStr) return match; // fallback
    
    return `${match}\n            shortDescription: "Learn about ${titleStr}",\n            points: 10,\n            estimatedMinutes: 60,\n            isActive: true,`;
});

fs.writeFileSync('prisma/seeds/lms-devops-course.ts', code, 'utf8');
console.log('Modules updated');
