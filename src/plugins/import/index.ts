import type { PluginLike } from './shared';
import { mergeDuplicatesRule, noInlineTypeImportRule, typeAfterValueRule } from './rules';

const plugin: PluginLike = {
  meta: {
    name: 'soybeanjs-import'
  },
  rules: {
    'merge-duplicates': mergeDuplicatesRule,
    'no-inline-type-import': noInlineTypeImportRule,
    'type-after-value': typeAfterValueRule
  }
};

export default plugin;
