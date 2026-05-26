import { defineRule } from '@oxlint/plugins';
import { collectImportGroups, getStartWithComments, mergeImportGroup } from '../shared';

export const mergeDuplicatesRule = defineRule({
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Merge duplicate imports from the same module into at most one value import and one type import.',
      url: 'https://github.com/soybeanjs/oxc-config/blob/main/src/plugins/import/rules/merge-duplicates.ts'
    },
    messages: {
      mergeDuplicates: 'Imports from "{{source}}" should be merged into at most one value import and one type import.'
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      'Program:exit'() {
        const groups = collectImportGroups(sourceCode);

        for (const group of groups) {
          const mergedStatements = mergeImportGroup(group, sourceCode);

          if (!mergedStatements) {
            continue;
          }

          const firstNode = group[0].node;
          const lastNode = group[group.length - 1].node;

          context.report({
            node: firstNode,
            messageId: 'mergeDuplicates',
            data: { source: firstNode.source.value },
            fix(fixer) {
              return fixer.replaceTextRange(
                [getStartWithComments(firstNode, sourceCode), lastNode.range[1]],
                mergedStatements.join('\n')
              );
            }
          });
        }
      }
    };
  }
});
