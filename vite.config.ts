import { resolve } from 'path';
import { defineConfig } from 'vite';

// Configuration for browser build
const domConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'interactiveShaderFormat',
      fileName: 'build',
      formats: ['umd']
    },
    outDir: 'dist',
  }
});

// Configuration for web worker build
const workerConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'interactiveShaderFormat',
      fileName: 'build-worker',
      formats: ['iife'] // 'this' in webpack is closest to IIFE in Vite
    },
    outDir: 'dist',
    target: 'webworker'
  }
});

// For multi-config support, we'll need a small wrapper function
export default defineConfig(({ mode }) => {
  if (mode === 'worker') {
    return workerConfig;
  }
  return domConfig;
});