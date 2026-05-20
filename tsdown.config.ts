import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/import-type-order.js'],
  platform: 'neutral',
  deps: {
    neverBundle: ['oxlint', 'oxfmt']
  },
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false
});
