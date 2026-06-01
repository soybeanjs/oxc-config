import type { OxlintConfig } from 'oxlint';

export const lint: OxlintConfig = {
  categories: {
    correctness: 'error',
    suspicious: 'error'
  },
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'vue'],
  jsPlugins: ['@soybeanjs/oxc-config/plugins/import'],
  rules: {
    'soybeanjs-import/merge-duplicates': 'warn',
    'soybeanjs-import/no-inline-type-import': 'warn',
    'soybeanjs-import/type-after-value': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-unassigned-import': 'off',
    'no-underscore-dangle': 'off',
    'object-shorthand': 'warn',
    'typescript/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports'
      }
    ],
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-array-reverse': 'off',
    'unicorn/no-array-sort': 'off',
    'unicorn/no-empty-file': 'off',
    'unicorn/require-module-specifiers': 'off',
    'vue/prefer-import-from-vue': 'off'
  }
};
