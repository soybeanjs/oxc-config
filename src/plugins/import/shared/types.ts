import type { ESTree, Context } from '@oxlint/plugins';

export type SourceCode = Context['sourceCode'];

export type NodeOrToken = ESTree.Token | ESTree.Comment | ESTree.Span;

export type ImportDeclaration = ESTree.ImportDeclaration;

export type ImportDeclarationSpecifier = ESTree.ImportDeclarationSpecifier;

export interface ImportGroupItem {
  node: ImportDeclaration;
  bodyIndex: number;
}

export interface ImportStatementParts {
  defaultImports: string[];
  namespaceImports: string[];
  namedImports: string[];
}
