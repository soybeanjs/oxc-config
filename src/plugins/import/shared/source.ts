import type { BaseNode, SourceCodeLike } from './types';

export function getStartWithComments(node: BaseNode, sourceCode: SourceCodeLike): number {
  const comments = sourceCode.getCommentsBefore(node);

  if (comments.length > 0) {
    return comments[0].range[0];
  }

  return node.range[0];
}
