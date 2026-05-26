import { definePlugin } from '@oxlint/plugins';
import { mergeDuplicatesRule, noInlineTypeImportRule, typeAfterValueRule } from './rules';

const plugin = definePlugin({
  meta: {
    name: 'soybeanjs-import'
  },
  rules: {
    'merge-duplicates': mergeDuplicatesRule,
    'no-inline-type-import': noInlineTypeImportRule,
    'type-after-value': typeAfterValueRule
  }
});

export default plugin;
