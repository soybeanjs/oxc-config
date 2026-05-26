import { defineRule } from '@oxlint/plugins';
import { buildTypeImportStatement, buildValueImportStatement, canFixInlineTypeImport } from '../shared';

export const noInlineTypeImportRule = defineRule({
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Prefer top-level `import type` over inline `type` specifiers, including mixed value/type imports.',
      url: 'https://github.com/soybeanjs/oxc-config/blob/main/src/plugins/import/rules/no-inline-type-import.ts'
    },
    messages: {
      noInlineTypeImport:
        'Inline type import from "{{source}}" should use top-level `import type` declarations instead.'
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ImportDeclaration(node) {
        if (!canFixInlineTypeImport(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'noInlineTypeImport',
          data: { source: node.source.value },
          fix(fixer) {
            const valueImportText = buildValueImportStatement(node, sourceCode);
            const typeImportText = buildTypeImportStatement(node, sourceCode);
            const parts = [valueImportText, typeImportText].filter(Boolean);

            return fixer.replaceText(node, parts.join('\n'));
          }
        });
      }
    };
  }
});
