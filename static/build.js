import { build } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';
import path from 'path';

const files = [
  'vnc.html',
  'vnc_lite.html', 
  'vncrtckeepalive.html',
  'vncrtcheavy.html'
];

async function buildAll() {
  for (const file of files) {
    console.log(`Building ${file}...`);
    
    try {
      await build({
        plugins: [
          // Add Node.js polyfills for browser compatibility
          nodePolyfills({
            // Polyfill specific modules you need
            include: ['base64', 'buffer', 'util', 'stream', 'crypto'],
            globals: {
              Buffer: true,
              global: true,
              process: true
            }
          }),
          viteSingleFile({
            removeViteModuleLoader: true,
            useRecommendedBuildConfig: false,
            inlinePattern: [/.*/]
          })
        ],
        build: {
          assetsInlineLimit: 100000000,
          rollupOptions: {
		      //external: ['nodejs-base64'], // Mark as external
            input: file,
            output: {
              entryFileNames: '[name].min.js',
              chunkFileNames: '[name].min.js',
              assetFileNames: '[name].min.[ext]'
            }
          },
          outDir: 'dist'
        },
        define: {
          // Define global variables that Node.js modules might expect
          'process.env.NODE_ENV': JSON.stringify('production'),
          'global': 'globalThis'
        }
      });

      // Move and rename the built HTML file to current directory
      const sourcePath = path.join('dist', file);
      const fileNameWithoutExt = path.basename(file, '.html');
      const destPath = `${fileNameWithoutExt}.min.html`;
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`? Created ${destPath}`);
        
        // Also remove from dist to avoid confusion
        fs.unlinkSync(sourcePath);
      } else {
        console.log(`? Warning: ${sourcePath} not found after build`);
      }
      
    } catch (error) {
      console.error(`? Failed to build ${file}:`, error.message);
    }
  }
  
  console.log('\n?? Build completed!');
  console.log('Generated files in current directory:');
  files.forEach(file => {
    const fileNameWithoutExt = path.basename(file, '.html');
    console.log(`  - ${fileNameWithoutExt}.min.html`);
  });
}

buildAll().catch(console.error);
