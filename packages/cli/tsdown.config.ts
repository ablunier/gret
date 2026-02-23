import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false, // CLI doesn't need type declarations
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node'
  }
});
