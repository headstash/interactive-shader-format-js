import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const buildConfig = mode === 'worker'
    ? {
        lib: {
          entry: resolve(__dirname, 'src/main.js'),
          name: 'interactiveShaderFormat',
          fileName: 'build-worker',
          formats: ['iife'] as const,
        },
        outDir: 'dist',
      }
    : {
        lib: {
          entry: resolve(__dirname, 'src/main.js'),
          name: 'interactiveShaderFormat',
          fileName: 'build',
          formats: ['umd'] as const,
        },
        outDir: 'dist',
      };

  return {
    build: buildConfig,
    test: {
      include: ['tests/**/*-test.js'],
      environment: 'node',
    },
  };
});
