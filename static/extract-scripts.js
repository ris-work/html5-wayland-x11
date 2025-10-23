import fs from 'fs';
import path from 'path';

const htmlFiles = [
  'vncrtckeepalive.html',
  'vnc.html',
  'vnc_lite.html',
  'vncrtcheavy.html'
];

console.log('Extracting JavaScript from HTML files...');

// Create extracted directory
if (!fs.existsSync('./extracted')) {
  fs.mkdirSync('./extracted');
}

htmlFiles.forEach(htmlFile => {
  try {
    if (!fs.existsSync(htmlFile)) {
      console.error(`Input file not found: ${htmlFile}`);
      return;
    }
    
    const content = fs.readFileSync(htmlFile, 'utf8');
    
    // Extract script content
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptContent = '';
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      scriptContent += match[1] + '\n\n';
    }
    
    if (scriptContent.trim()) {
      // Write JavaScript file
      const jsFileName = `${path.basename(htmlFile, '.html')}.js`;
      const jsFilePath = path.join('./extracted', jsFileName);
      fs.writeFileSync(jsFilePath, scriptContent, 'utf8');
      console.log(`? Extracted ${jsFilePath}`);
    }
  } catch (error) {
    console.error(`? Error processing ${htmlFile}:`, error.message);
  }
});

console.log('Extraction completed!');
