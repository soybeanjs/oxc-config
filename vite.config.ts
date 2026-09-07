import { defineConfig } from 'vite-plus';
import { fmt, lint } from './src';

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  fmt,
  lint,
  pack: {
    entry: {
      index: 'src/index.ts',
      'plugins/import': 'src/plugins/import/index.ts'
    },
    platform: 'neutral',
    deps: {
      neverBundle: ['oxlint', 'oxfmt']
    },
    dts: true
  }
});
