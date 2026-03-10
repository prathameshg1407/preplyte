const fs = require('fs');

try {
  let fileText = fs.readFileSync('prisma/seeds/lms-devops-course.ts', 'utf8');
  
  // The blocks start with `content: \`` and end with `` `,\n          resources:` or `` `, \n        }` etc.
  // Instead of regex, let's parse it character by character or with a robust regex
  // Let's use regex but match the outer structure:
  // content:\s*`([\s\S]*?)`,\s*(resources:|isActive:|})
  
  let newCode = fileText.replace(/content:\s*`([\s\S]*?)`,\s*(resources:|isActive:|})/g, (match, inner, endMarker) => {
    // inner is the text inside the backticks.
    // Because it might be messed up with `\\\`` etc., let's unescape it first.
    // Unescape backticks:
    // If we have `\\\\\``, `\\\``, `\``, we just want to remove all backslashes before backticks?
    // Actually, any backslash before a backtick or a dollar sign was added to escape.
    let pureText = inner
        .replace(/\\\\\\`/g, '`')
        .replace(/\\\\`/g, '`')
        .replace(/\\`/g, '`')
        .replace(/\\\\\$\{/g, '${')
        .replace(/\\\\\$/g, '$')
        .replace(/\\\$\{/g, '${')
        .replace(/\\\$/g, '$');
    
    // Convert to JSON string
    let jsonString = JSON.stringify(pureText);
    
    // Ensure we don't accidentally create an invalid JSON output in JS context
    // Actually, JSON.stringify returns a valid JS string literal.
    
    return `content: ${jsonString},\n          ${endMarker}`;
  });

  // What about "};." at the end?
  newCode = newCode.replace(/\};\.\s*$/g, '};\n');

  fs.writeFileSync('prisma/seeds/lms-devops-course.ts', newCode, 'utf8');
  console.log('Fixed lms-devops-course.ts successfully.');
} catch (e) {
  console.error(e);
}
