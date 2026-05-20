import type { OxfmtConfig, CustomGroupItemConfig } from 'oxfmt';
import order from './order.json' with { type: 'json' };

const customGroups: CustomGroupItemConfig[] = [];
const externalGroupNames: string[] = [];
const internalGroupNames: string[] = [];
const parentGroupNames: string[] = [];
const siblingGroupNames: string[] = [];

order.external.forEach((item, index) => {
  const groupName = `external-${index}`;
  externalGroupNames.push(groupName);

  customGroups.push({
    groupName,
    elementNamePattern: [item],
    selector: 'external'
  });

  if (item.endsWith('-**')) {
    const _groupName = `external-subpath-${index}`;
    externalGroupNames.push(_groupName);
    customGroups.push({
      groupName: _groupName,
      elementNamePattern: [item.concat('/**')],
      selector: 'external'
    });
  }
});

order.internal.forEach((item, index) => {
  const groupName = `internal-${index}`;
  internalGroupNames.push(groupName);

  customGroups.push({
    groupName,
    elementNamePattern: [item],
    selector: 'internal'
  });

  const parentGroupName = `parent-${index}`;
  parentGroupNames.push(parentGroupName);
  customGroups.push({
    groupName: parentGroupName,
    elementNamePattern: [item.replace('@/', '**/')],
    selector: 'parent'
  });

  const siblingGroupName = `sibling-${index}`;
  siblingGroupNames.push(siblingGroupName);
  customGroups.push({
    groupName: siblingGroupName,
    elementNamePattern: [item.replace('@/', '**/')],
    selector: 'sibling'
  });
});

export const fmt: OxfmtConfig = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'ignore',
  experimentalSortPackageJson: {
    sortScripts: true
  },
  sortImports: {
    newlinesBetween: false,
    customGroups,
    groups: [
      'builtin',
      ...externalGroupNames,
      'external',
      'side_effect',
      'side_effect_style',
      ...internalGroupNames,
      'internal',
      'subpath',
      ...parentGroupNames,
      'parent',
      ...siblingGroupNames,
      'sibling',
      'index',
      'style',
      'unknown'
    ]
  }
};
