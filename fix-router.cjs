const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/navigate\(\s*['"`](.*?)['"`]\s*\)/g, "navigate.push('$1')");
  content = content.replace(/navigate\(([^)]+)\)/g, "navigate.push($1)");

  // Handle navigate(1) or navigate(-1) from router-dom (back/forward)
  content = content.replace(/navigate\.push\(-1\)/g, "navigate.back()");
  content = content.replace(/navigate\.push\(1\)/g, "navigate.forward()");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed router push: ${filePath}`);
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
console.log('Router fix complete');
