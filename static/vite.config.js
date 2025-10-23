import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  
  build: {
	  target: 'es2022',
    rollupOptions: {
	    target: 'es2022',
      input: {
        vnc: 'vnc.html',
        vnc_lite: 'vnc_lite.html',
        vncrtckeepalive: 'vncrtckeepalive.html',
        vncrtcheavy: 'vncrtcheavy.html'
      },
      output: {
        entryFileNames: '[name].min.js',
        chunkFileNames: '[name].min.js',
        assetFileNames: '[name].min.[ext]'
      }
    },
    outDir: 'dist'
  }
});
