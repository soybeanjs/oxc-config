# @soybeanjs/oxc-config

[![npm version](https://img.shields.io/npm/v/@soybeanjs/oxc-config)](https://www.npmjs.com/package/@soybeanjs/oxc-config)
[![license](https://img.shields.io/github/license/soybeanjs/oxc-config)](https://github.com/soybeanjs/oxc-config/blob/main/LICENSE)

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) configuration for SoybeanJS projects.

> [中文](./README.md) | English

## Features

- 🚀 **oxfmt formatter config** — Unified code style with fine-grained import sorting groups
- 🔍 **oxlint linter config** — Integrated with ESLint / TypeScript / Unicorn / Vue plugins
- 📦 **Import sorting** — Auto-group and sort imports by dependency layer
- 🎯 **type-before-value rule** — Custom oxlint JS plugin ensuring `import type` comes after `import` for the same module

## Installation

```bash
pnpm add -D @soybeanjs/oxc-config oxfmt oxlint
```

## Usage

### oxfmt

Create `oxfmt.config.ts` at project root:

```ts
import { fmt } from '@soybeanjs/oxc-config';

export default fmt;
```

You can also extend it:

```ts
import { fmt } from '@soybeanjs/oxc-config';

export default {
  ...fmt,
  printWidth: 100 // Override defaults
};
```

#### Import Sort Groups

Imports are automatically grouped and sorted by dependency layer:

| Order | Group                                      | Description                                                                                        |
| ----- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 1     | `builtin`                                  | Node.js built-in modules (`node:fs`, `node:path`, etc.)                                            |
| 2     | `external-*`                               | External deps by layer in `order.json` (build-tools → test → framework → state → UI → CSS → utils) |
| 3     | `external`                                 | Other unclassified external deps                                                                   |
| 4     | `side_effect` / `side_effect_style`        | Side-effect and style side-effect imports                                                          |
| 5     | `internal-*`                               | Project aliases (`@/`) by layer (config → infra → data → state → logic → views)                    |
| 6     | `internal`                                 | Other unclassified internal imports                                                                |
| 7     | `subpath` / `parent` / `sibling` / `index` | Relative path imports                                                                              |
| 8     | `style`                                    | Stylesheet imports                                                                                 |
| 9     | `unknown`                                  | Unknown import types                                                                               |

External dependency sort order (`order.json`):

```
Build tools (vite, webpack, esbuild, tsdown...)
  → Testing (vitest, playwright, cypress...)
  → Frameworks (vue, nuxt, react, next...)
  → State management (pinia, zustand, jotai...)
  → UI libraries (element-plus, ant-design-vue, naive-ui...)
  → CSS engines (tailwindcss, unocss, postcss...)
  → Utilities (axios, date-fns, es-toolkit, @tanstack/**...)
```

Internal alias sort order (`order.json`):

```
Config (config, setting, constants...)
  → Shared/Utils (shared, utils, lib...)
  → Plugins/Directives (plugins, directives...)
  → Middleware (middleware...)
  → Data layer (api, service...)
  → i18n (i18n, locales...)
  → State (store, context...)
  → Composables/Hooks (composables, hooks...)
  → Router (router...)
  → Feature modules (modules...)
  → Views (components...)
  → Styles/Assets (styles, assets...)
```

> See the full ordering in `node_modules/@soybeanjs/oxc-config/dist/order.json`, or customize by editing `src/order.json` in the source.

### oxlint

Create `oxlint.config.ts` at project root:

```ts
import { lint } from '@soybeanjs/oxc-config';

export default lint;
```

#### Enabled Plugins

- **eslint** — ESLint-compatible rules
- **typescript** — TypeScript-specific rules
- **unicorn** — Best practice rules
- **oxc** — OXC-specific rules
- **import** — Import/Export rules
- **vue** — Vue SFC rules

#### Custom Rule: import-type-order

A custom oxlint JS plugin that ensures `import type` always comes after `import` for the same module:

```ts
// ✅ Correct
import { ref } from 'vue';
import type { Ref } from 'vue';

// ❌ Incorrect
import type { Ref } from 'vue';
import { ref } from 'vue';
```

The exported `lint` config already includes this plugin and rule. To override or extend:

```ts
import { lint } from '@soybeanjs/oxc-config';

export default {
  ...lint,
  jsPlugins: ['@soybeanjs/oxc-config/import-type-order'],
  rules: {
    'import-type-order/type-after-value': 'warn'
  }
};
```

## Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint --fix",
    "fmt": "oxfmt"
  }
}
```

## License

[MIT](./LICENSE)
