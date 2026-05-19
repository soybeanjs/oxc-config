import type { OxlintConfig } from "oxlint";

export const lint: OxlintConfig = {
  categories: {
    correctness: "error",
    suspicious: "error"
  },
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "vue"],
  jsPlugins: ["@soybeanjs/oxc-config/import-type-order"],
  rules: {
    "import/no-unassigned-import": "off",
    "import-type-order/type-after-value": "warn",
    "no-unused-vars": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/no-array-reverse": "off",
    "unicorn/no-array-sort": "off",
    "unicorn/no-empty-file": "off",
    "unicorn/require-module-specifiers": "off",
    "vue/prefer-import-from-vue": "off"
  }
};
