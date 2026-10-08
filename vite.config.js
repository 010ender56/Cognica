import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: "./src", 
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "src/index.html"),
        editor: resolve(__dirname, "src/editor.html"),
        quiz: resolve(__dirname, "src/quiz.html"),
        import: resolve(__dirname, "src/import.html"),
        settings: resolve(__dirname, "src/settings.html"),
      },
    },
  },
  outDir: "../dist", 
});
