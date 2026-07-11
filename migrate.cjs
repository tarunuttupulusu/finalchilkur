const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace imports
  content = content.replace(/import\s+\{([^}]*Link[^}]*)\}\s+from\s+['"]react-router-dom['"];/g, (match, p1) => {
    let others = p1.replace(/Link,?/g, '').trim();
    if (others.endsWith(',')) others = others.slice(0, -1);
    let res = `import Link from 'next/link';\n`;
    if (others.length > 0) {
      res += `import { ${others} } from 'next/navigation';\n`;
    }
    return res;
  });

  content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];/g, "import { $1 } from 'next/navigation';");

  // Replace hooks
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  content = content.replace(/useLocation\(\)/g, 'usePathname()');
  // NOTE: Next.js usePathname returns just the string path, while useLocation returns an object with pathname
  content = content.replace(/location\.pathname/g, 'pathname');
  // Need to fix useLocation assignment
  content = content.replace(/const location = usePathname\(\);/g, 'const pathname = usePathname();');
  content = content.replace(/const \{ pathname \} = usePathname\(\);/g, 'const pathname = usePathname();');

  // Replace <Link to=... with <Link href=...
  content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
console.log('Migration complete');
