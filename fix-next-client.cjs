const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Prepend "use client" if it has imports from react (useState, useEffect, etc) or next/navigation
  if (!content.includes('"use client"') && !content.includes("'use client'")) {
    if (content.includes('useState') || content.includes('useEffect') || content.includes('useRef') || content.includes('framer-motion') || content.includes('next/navigation')) {
      content = '"use client";\n' + content;
    }
  }

  // Fix wrong imports
  content = content.replace(/useLocation/g, 'usePathname');
  content = content.replace(/useNavigate/g, 'useRouter');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Client fix complete');
