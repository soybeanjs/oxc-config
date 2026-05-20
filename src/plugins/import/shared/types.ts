export type ImportKind = 'type' | 'typeof' | 'value' | undefined;

export interface Position {
  line: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface BaseNode {
  type: string;
  range: [number, number];
  loc: SourceLocation;
}

export interface CommentNode {
  range: [number, number];
}

export interface LiteralSourceNode extends BaseNode {
  value: string;
}

export interface ImportSpecifierNode extends BaseNode {
  type: 'ImportSpecifier';
  importKind?: ImportKind;
  imported: BaseNode;
}

export interface ImportDefaultSpecifierNode extends BaseNode {
  type: 'ImportDefaultSpecifier';
}

export interface ImportNamespaceSpecifierNode extends BaseNode {
  type: 'ImportNamespaceSpecifier';
}

export type ImportDeclarationSpecifier =
  | ImportSpecifierNode
  | ImportDefaultSpecifierNode
  | ImportNamespaceSpecifierNode;

export interface ImportDeclarationNode extends BaseNode {
  type: 'ImportDeclaration';
  importKind?: ImportKind;
  source: LiteralSourceNode;
  specifiers?: ImportDeclarationSpecifier[] | null;
  withClause?: unknown | null;
}

export interface ProgramNode extends BaseNode {
  body: BaseNode[];
}

export interface SourceCodeLike {
  text: string;
  ast: ProgramNode;
  getText(node?: { range: [number, number] } | null): string;
  getCommentsBefore(node: BaseNode): CommentNode[];
}

export interface ImportStatementParts {
  defaultImports: string[];
  namespaceImports: string[];
  namedImports: string[];
}

export interface FixerLike {
  replaceTextRange(range: [number, number], text: string): unknown;
  replaceText(node: BaseNode, text: string): unknown;
}

export interface ReportDescriptor {
  node: BaseNode;
  messageId: string;
  data?: Record<string, string>;
  fix?: (fixer: FixerLike) => unknown;
}

export interface RuleContextLike {
  sourceCode: SourceCodeLike;
  report(descriptor: ReportDescriptor): void;
}

export type VisitorLike = Record<string, ((node: any) => void) | undefined>;

export interface RuleMetaLike {
  type: string;
  fixable?: 'code';
  docs?: {
    description: string;
    url?: string;
  };
  messages?: Record<string, string>;
  schema?: unknown[];
}

export interface RuleLike {
  meta?: RuleMetaLike;
  create: (context: RuleContextLike) => VisitorLike;
}

export interface PluginLike {
  meta: {
    name: string;
  };
  rules: Record<string, RuleLike>;
}

export interface ImportGroupItem {
  node: ImportDeclarationNode;
  bodyIndex: number;
}
