const fs = require('fs');

try {
  let code = fs.readFileSync('prisma/seeds/lms-devops-course.ts', 'utf8');
  
  let matchCount = 0;
  // Let's use regex to find content blocks.
  // We want to match `content: \``, then anything until `\`,\r?\n\s+resources` or `\`,\r?\n\s+isActive` or `\`\r?\n\s+}`
  let newCode = code.replace(/content:\s*`([\s\S]*?)`,\s*(resources:|isActive:|})/g, (match, inner, endMarker) => {
    matchCount++;
    let fixedContent = inner.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    return `content: \`${fixedContent}\`,\n          ${endMarker}`;
  });

  // What about "};." at the end?
  newCode = newCode.replace(/\};\.\s*$/g, '};\n');

  fs.writeFileSync('prisma/seeds/lms-devops-course.ts', newCode, 'utf8');
  console.log(`Fixed lms-devops-course.ts successfully. Replaced ${matchCount} blocks.`);
} catch(e) {
  console.error(e);
}
