// extract-scripts.js
import fs from 'fs';
import path from 'path';

const htmlFiles = [
  'vncrtckeepalive.html',
  'vnc.html',
  'vnc_lite.html',
  'vncrtcheavy.html'
];

// Ensure extracted directory exists
if (!fs.existsSync('./extracted')) {
  fs.mkdirSync('./extracted');
}

htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptContent = '';
  let match;
  
  while ((match = scriptRegex.exec(content)) !== null) {
    scriptContent += match[1] + '\n\n';
  }
  
  if (scriptContent.trim()) {
    const jsFile = `./extracted/${path.basename(htmlFile, '.html')}.js`;
    fs.writeFileSync(jsFile, scriptContent, 'utf8');
    console.log(`? Extracted ${jsFile}`);
  }
});
