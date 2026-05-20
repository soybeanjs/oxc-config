import { collectImportGroups, getStartWithComments, isTypeImport } from '../shared';
import type { RuleLike } from '../shared';

export const typeAfterValueRule: RuleLike = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Ensure value imports come before type imports for the same module source.',
      url: 'https://github.com/soybeanjs/oxc-config/blob/main/src/plugins/import/rules/type-after-value.ts'
    },
    messages: {
      typeBeforeValue: 'Type import from "{{source}}" must be placed after its value import.'
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      'Program:exit'() {
        const groups = collectImportGroups(sourceCode);

        for (const group of groups) {
          if (group.length < 2) {
            continue;
          }

          const hasTypeBeforeValue = group.some((item, index) => {
            if (!isTypeImport(item.node)) {
              return false;
            }

            for (let cursor = index + 1; cursor < group.length; cursor += 1) {
              if (!isTypeImport(group[cursor].node)) {
                return true;
              }
            }

            return false;
          });

          if (!hasTypeBeforeValue) {
            continue;
          }

          const sorted = [...group].sort((left, right) => {
            const leftIsType = isTypeImport(left.node);
            const rightIsType = isTypeImport(right.node);

            if (leftIsType === rightIsType) {
              return 0;
            }

            return leftIsType ? 1 : -1;
          });

          const firstNode = group[0].node;
          const lastNode = group[group.length - 1].node;

          context.report({
            node: firstNode,
            messageId: 'typeBeforeValue',
            data: { source: firstNode.source.value },
            fix(fixer) {
              const parts: string[] = [];

              for (let index = 0; index < sorted.length; index += 1) {
                const item = sorted[index];
                const previousItem = index > 0 ? sorted[index - 1] : null;
                const start = getStartWithComments(item.node, sourceCode);
                const text = sourceCode.text.slice(start, item.node.range[1]);

                if (index > 0 && previousItem) {
                  const previousOriginalIndex = group.findIndex(candidate => candidate === previousItem);
                  const currentOriginalIndex = group.findIndex(candidate => candidate === item);

                  if (Math.abs(currentOriginalIndex - previousOriginalIndex) === 1) {
                    const earlier = group[Math.min(previousOriginalIndex, currentOriginalIndex)];
                    const later = group[Math.max(previousOriginalIndex, currentOriginalIndex)];
                    const separator = sourceCode.text.slice(
                      earlier.node.range[1],
                      getStartWithComments(later.node, sourceCode)
                    );

                    parts.push(separator);
                  } else {
                    parts.push('\n');
                  }
                }

                parts.push(text);
              }

              return fixer.replaceTextRange(
                [getStartWithComments(firstNode, sourceCode), lastNode.range[1]],
                parts.join('')
              );
            }
          });
        }
      }
    };
  }
};
