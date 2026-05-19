import type { OxfmtConfig, CustomGroupItemConfig } from "oxfmt";
import order from "./order.json" with { type: "json" };

const customGroups: CustomGroupItemConfig[] = [];
const externalGroupNames: string[] = [];
const internalGroupNames: string[] = [];

order.external.forEach((item, index) => {
  const groupName = `external-${index}`;
  externalGroupNames.push(groupName);

  customGroups.push({
    groupName,
    elementNamePattern: [item],
    selector: "external"
  });
});

order.internal.forEach((item, index) => {
  const groupName = `internal-${index}`;
  internalGroupNames.push(groupName);

  customGroups.push({
    groupName,
    elementNamePattern: [item],
    selector: "internal"
  });
});

export const fmt: OxfmtConfig = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: "none",
  arrowParens: "avoid",
  htmlWhitespaceSensitivity: "ignore",
  experimentalSortPackageJson: {
    sortScripts: true
  },
  sortImports: {
    newlinesBetween: false,
    customGroups,
    groups: [
      "builtin",
      ...externalGroupNames,
      "external",
      "side_effect",
      "side_effect_style",
      ...internalGroupNames,
      "internal",
      "subpath",
      "parent",
      "sibling",
      "index",
      "style",
      "unknown"
    ]
  }
};
