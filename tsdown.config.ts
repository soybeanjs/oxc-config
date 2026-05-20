import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugins/import': 'src/plugins/import/index.ts'
  },
  platform: 'neutral',
  deps: {
    neverBundle: ['oxlint', 'oxfmt']
  },
  clean: true,
  dts: true,
  sourcemap: false,
  minify: false
});
