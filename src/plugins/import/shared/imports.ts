import type {
  ImportDeclarationNode,
  ImportDeclarationSpecifier,
  ImportGroupItem,
  ImportKind,
  ImportStatementParts,
  ImportSpecifierNode,
  SourceCodeLike
} from './types';

function isTypeKind(kind: ImportKind): boolean {
  return kind === 'type' || kind === 'typeof';
}

export function isImportDeclaration(node: unknown): node is ImportDeclarationNode {
  return Boolean(node) && typeof node === 'object' && (node as ImportDeclarationNode).type === 'ImportDeclaration';
}

export function isTypeImport(node: Pick<ImportDeclarationNode, 'importKind'>): boolean {
  return isTypeKind(node.importKind);
}

export function isInlineTypeSpecifier(node: ImportDeclarationSpecifier): node is ImportSpecifierNode {
  return node.type === 'ImportSpecifier' && isTypeKind(node.importKind);
}

export function getInlineTypeSpecifiers(node: ImportDeclarationNode): ImportSpecifierNode[] {
  return (node.specifiers ?? []).filter(isInlineTypeSpecifier);
}

export function hasInlineTypeSpecifier(node: ImportDeclarationNode): boolean {
  return !isTypeImport(node) && getInlineTypeSpecifiers(node).length > 0;
}

export function stripInlineTypeKeyword(text: string): string {
  return text.replace(/^type\s+/, '');
}

export function buildImportStatement(options: {
  importKeyword: string;
  specifierTexts: string[];
  sourceText: string;
}): string {
  const { importKeyword, specifierTexts, sourceText } = options;

  return `${importKeyword} ${specifierTexts.join(', ')} from ${sourceText};`;
}

export function buildNamedImportText(
  specifiers: ImportSpecifierNode[],
  sourceCode: SourceCodeLike,
  options: { stripTypeKeyword?: boolean } = {}
): string {
  const texts = specifiers.map(specifier => {
    const text = sourceCode.getText(specifier);

    return options.stripTypeKeyword ? stripInlineTypeKeyword(text) : text;
  });

  return `{ ${texts.join(', ')} }`;
}

export function buildValueImportStatement(node: ImportDeclarationNode, sourceCode: SourceCodeLike): string | null {
  const specifiers = node.specifiers ?? [];
  const defaultSpecifiers = specifiers
    .filter((specifier): specifier is Extract<ImportDeclarationSpecifier, { type: 'ImportDefaultSpecifier' }> => {
      return specifier.type === 'ImportDefaultSpecifier';
    })
    .map(specifier => sourceCode.getText(specifier));
  const namespaceSpecifiers = specifiers
    .filter((specifier): specifier is Extract<ImportDeclarationSpecifier, { type: 'ImportNamespaceSpecifier' }> => {
      return specifier.type === 'ImportNamespaceSpecifier';
    })
    .map(specifier => sourceCode.getText(specifier));
  const namedSpecifiers = specifiers.filter(
    (specifier): specifier is ImportSpecifierNode =>
      specifier.type === 'ImportSpecifier' && !isInlineTypeSpecifier(specifier)
  );
  const specifierTexts = [...defaultSpecifiers, ...namespaceSpecifiers];

  if (namedSpecifiers.length > 0) {
    specifierTexts.push(buildNamedImportText(namedSpecifiers, sourceCode));
  }

  if (specifierTexts.length === 0) {
    return null;
  }

  return buildImportStatement({
    importKeyword: 'import',
    specifierTexts,
    sourceText: sourceCode.getText(node.source)
  });
}

export function buildTypeImportStatement(node: ImportDeclarationNode, sourceCode: SourceCodeLike): string | null {
  const inlineTypeSpecifiers = getInlineTypeSpecifiers(node);

  if (inlineTypeSpecifiers.length === 0) {
    return null;
  }

  return buildImportStatement({
    importKeyword: 'import type',
    specifierTexts: [buildNamedImportText(inlineTypeSpecifiers, sourceCode, { stripTypeKeyword: true })],
    sourceText: sourceCode.getText(node.source)
  });
}

export function canFixInlineTypeImport(node: ImportDeclarationNode): boolean {
  return !isTypeImport(node) && node.specifiers != null && hasInlineTypeSpecifier(node) && node.withClause == null;
}

function createImportStatementParts(): ImportStatementParts {
  return {
    defaultImports: [],
    namespaceImports: [],
    namedImports: []
  };
}

function pushUnique(values: string[], text: string): void {
  if (!values.includes(text)) {
    values.push(text);
  }
}

function appendSpecifierText(
  target: ImportStatementParts,
  specifier: ImportDeclarationSpecifier,
  sourceCode: SourceCodeLike
): void {
  if (specifier.type === 'ImportDefaultSpecifier') {
    pushUnique(target.defaultImports, sourceCode.getText(specifier));
    return;
  }

  if (specifier.type === 'ImportNamespaceSpecifier') {
    pushUnique(target.namespaceImports, sourceCode.getText(specifier));
    return;
  }

  pushUnique(target.namedImports, stripInlineTypeKeyword(sourceCode.getText(specifier)));
}

function canBuildSingleImport(parts: ImportStatementParts): boolean {
  if (parts.defaultImports.length > 1 || parts.namespaceImports.length > 1) {
    return false;
  }

  if (parts.namespaceImports.length > 0 && parts.namedImports.length > 0) {
    return false;
  }

  return true;
}

function buildImportFromParts(
  parts: ImportStatementParts,
  sourceText: string,
  importKeyword: 'import' | 'import type'
): string | null {
  if (!canBuildSingleImport(parts)) {
    return null;
  }

  const specifierTexts = [...parts.defaultImports, ...parts.namespaceImports];

  if (parts.namedImports.length > 0) {
    specifierTexts.push(`{ ${parts.namedImports.join(', ')} }`);
  }

  if (specifierTexts.length === 0) {
    return null;
  }

  return buildImportStatement({
    importKeyword,
    specifierTexts,
    sourceText
  });
}

export function mergeImportGroup(group: ImportGroupItem[], sourceCode: SourceCodeLike): string[] | null {
  if (group.length < 2) {
    return null;
  }

  const valueParts = createImportStatementParts();
  const typeParts = createImportStatementParts();
  const sourceText = sourceCode.getText(group[0].node.source);

  for (const item of group) {
    if (item.node.withClause != null || (item.node.specifiers?.length ?? 0) === 0) {
      return null;
    }

    if (sourceCode.getCommentsBefore(item.node).length > 0 && item !== group[0]) {
      return null;
    }

    for (const specifier of item.node.specifiers ?? []) {
      if (isTypeImport(item.node) || isInlineTypeSpecifier(specifier)) {
        appendSpecifierText(typeParts, specifier, sourceCode);
      } else {
        appendSpecifierText(valueParts, specifier, sourceCode);
      }
    }
  }

  const mergedStatements = [
    buildImportFromParts(valueParts, sourceText, 'import'),
    buildImportFromParts(typeParts, sourceText, 'import type')
  ].filter((statement): statement is string => Boolean(statement));

  if (mergedStatements.length === 0 || mergedStatements.length >= group.length) {
    return null;
  }

  return mergedStatements;
}

export function collectImportGroups(sourceCode: SourceCodeLike): ImportGroupItem[][] {
  const allImports: ImportGroupItem[] = [];

  for (let index = 0; index < sourceCode.ast.body.length; index += 1) {
    const node = sourceCode.ast.body[index];

    if (isImportDeclaration(node)) {
      allImports.push({ node, bodyIndex: index });
    }
  }

  if (allImports.length < 2) {
    return [];
  }

  const groups: ImportGroupItem[][] = [];
  let currentGroup: ImportGroupItem[] = [allImports[0]];

  for (let index = 1; index < allImports.length; index += 1) {
    const previous = allImports[index - 1];
    const current = allImports[index];
    const linesBetween = current.node.loc.start.line - previous.node.loc.end.line;

    if (previous.node.source.value === current.node.source.value && linesBetween <= 1) {
      currentGroup.push(current);
    } else {
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }

  groups.push(currentGroup);

  return groups;
}
