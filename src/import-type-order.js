/**
 * oxlint JS plugin: import-type-order
 *
 * 确保同一模块的 `import type` 始终在 `import` (value import) 之后。
 * 与 oxfmt 的 sortImports 配合使用：oxfmt 负责分组排序，此插件负责同模块 value-before-type。
 *
 * 基于 eslint-plugin-simple-import-sort 的核心思路实现。
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * 判断 import 是否为 type-only import（`import type { X } from '...'`）
 * 也兼容 `import typeof`（Flow 语法）。
 */
function isTypeImport(node) {
  return node.importKind === "type" || node.importKind === "typeof";
}

/**
 * 获取 import 声明前附着的注释的起始位置。
 * 如果没有前导注释，返回节点自身的起始位置。
 */
function getStartWithComments(node, sourceCode) {
  const comments = sourceCode.getCommentsBefore(node);
  if (comments.length > 0) {
    return comments[0].range[0];
  }
  return node.range[0];
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

const rule = {
  meta: {
    type: "layout",
    fixable: "code",
    docs: {
      description: "Ensure value imports come before type imports for the same module source.",
      url: "https://github.com/soybeanjs/oxfmt-import-order"
    },
    messages: {
      typeBeforeValue: 'Type import from "{{source}}" must be placed after its value import.'
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      "Program:exit"() {
        const body = sourceCode.ast.body;

        // 收集所有 ImportDeclaration（按源代码顺序）
        const allImports = [];
        for (let i = 0; i < body.length; i++) {
          if (body[i].type === "ImportDeclaration") {
            allImports.push({ node: body[i], bodyIndex: i });
          }
        }

        if (allImports.length < 2) return;

        // 将连续的同 source import 分组
        // 例如：import type { X } from 'vue'; import { computed } from 'vue' → 同一组
        const groups = [];
        let currentGroup = [allImports[0]];

        for (let i = 1; i < allImports.length; i++) {
          const prev = allImports[i - 1];
          const curr = allImports[i];

          // 检查是否连续（中间没有其他类型的语句，也没有空行隔开）
          const linesBetween = curr.node.loc.start.line - prev.node.loc.end.line;

          if (prev.node.source.value === curr.node.source.value && linesBetween <= 1) {
            // 同 source 且紧邻 → 同一组
            currentGroup.push(curr);
          } else {
            // 不同 source 或中间有空行 → 新组
            groups.push(currentGroup);
            currentGroup = [curr];
          }
        }
        groups.push(currentGroup);

        // 检查每个分组：value import 必须在 type import 之前
        for (const group of groups) {
          if (group.length < 2) continue;

          // 判断当前顺序是否正确
          const hasTypeBeforeValue = group.some((item, i) => {
            if (!isTypeImport(item.node)) return false;
            // 当前是 type import，检查后面是否有同 source 的 value import
            for (let j = i + 1; j < group.length; j++) {
              if (!isTypeImport(group[j].node)) return true;
            }
            return false;
          });

          if (!hasTypeBeforeValue) continue;

          // --- 需要排序：value imports 在前，type imports 在后 ---
          // 各自保持原始相对顺序（稳定排序）
          const sorted = [...group].sort((a, b) => {
            const aIsType = isTypeImport(a.node);
            const bIsType = isTypeImport(b.node);
            if (aIsType === bIsType) return 0; // 保持同类之间的原始顺序
            return aIsType ? 1 : -1; // value 在前，type 在后
          });

          const firstNode = group[0].node;
          const lastNode = group[group.length - 1].node;
          const source = firstNode.source.value;

          context.report({
            node: firstNode,
            messageId: "typeBeforeValue",
            data: { source },
            fix(fixer) {
              // 收集排序后的节点文本及其前导注释
              const parts = [];
              for (let i = 0; i < sorted.length; i++) {
                const item = sorted[i];
                const prevItem = i > 0 ? sorted[i - 1] : null;

                // 获取当前 import 的完整文本（含前导注释）
                const start = getStartWithComments(item.node, sourceCode);
                const text = sourceCode.text.slice(start, item.node.range[1]);

                // 获取当前 import 与前一个 import 之间的分隔文本
                // （原顺序中的分隔符，我们尽量保留）
                if (i > 0) {
                  const prevOriginalIndex = group.findIndex(g => g === prevItem);
                  const currOriginalIndex = group.findIndex(g => g === item);

                  // 使用原始顺序中相邻节点的分隔文本
                  // 如果原始中也是相邻的，直接取它们之间的文本
                  if (Math.abs(currOriginalIndex - prevOriginalIndex) === 1) {
                    const earlier = group[Math.min(prevOriginalIndex, currOriginalIndex)];
                    const later = group[Math.max(prevOriginalIndex, currOriginalIndex)];
                    const sep = sourceCode.text.slice(
                      earlier.node.range[1],
                      getStartWithComments(later.node, sourceCode)
                    );
                    parts.push(sep);
                  } else {
                    // 原顺序中不相邻，使用换行作为分隔
                    parts.push("\n");
                  }
                }

                parts.push(text);
              }

              const rangeStart = getStartWithComments(firstNode, sourceCode);
              const rangeEnd = lastNode.range[1];

              return fixer.replaceTextRange([rangeStart, rangeEnd], parts.join(""));
            }
          });
        }
      }
    };
  }
};

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

const plugin = {
  meta: {
    name: "import-type-order"
  },
  rules: {
    "type-after-value": rule
  }
};

export default plugin;
