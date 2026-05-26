import type { NodeOrToken, SourceCode } from './types';

export function getStartWithComments(node: NodeOrToken, sourceCode: SourceCode): number {
  const comments = sourceCode.getCommentsBefore(node);

  if (comments.length > 0) {
    return comments[0].range[0];
  }

  return node.range[0];
}
