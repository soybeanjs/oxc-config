# @soybeanjs/oxc-config

[![npm version](https://img.shields.io/npm/v/@soybeanjs/oxc-config)](https://www.npmjs.com/package/@soybeanjs/oxc-config)
[![license](https://img.shields.io/github/license/soybeanjs/oxc-config)](https://github.com/soybeanjs/oxc-config/blob/main/LICENSE)

SoybeanJS 的共享 [oxlint](https://oxc.rs/docs/guide/usage/linter.html) 和 [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) 配置。

> 中文 | [English](./README.en.md)

## 特性

- 🚀 **oxfmt 格式化配置** — 统一代码风格，包含精细的 import 排序分组
- 🔍 **oxlint 代码检查** — 集成 ESLint / TypeScript / Unicorn / Vue 等插件
- 📦 **Import 排序** — 按依赖层级自动分组排序 external 和 internal import
- 🎯 **自定义 import 插件** — 附带自动合并重复导入、禁止 inline type import、保证 value import 在 type import 之前

## 安装

```bash
pnpm add -D @soybeanjs/oxc-config oxfmt oxlint
```

## 使用

### oxfmt 配置

在项目根目录创建 `oxfmt.config.ts`：

```ts
import { fmt } from '@soybeanjs/oxc-config';

export default fmt;
```

也可以在此基础上扩展：

```ts
import { fmt } from '@soybeanjs/oxc-config';

export default {
  ...fmt,
  printWidth: 100 // 覆盖默认配置
};
```

#### Import 排序分组

本配置将 import 按依赖层级自动分组排序：

| 顺序 | 分组                                       | 说明                                                                                            |
| ---- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1    | `builtin`                                  | Node.js 内置模块 (`node:fs`, `node:path` 等)                                                    |
| 2    | `external-*`                               | 外部依赖，按 `order.json` 中的层级排列（构建工具 → 测试 → 框架 → 状态管理 → UI → CSS → 工具库） |
| 3    | `external`                                 | 其他未分类的外部依赖                                                                            |
| 4    | `side_effect` / `side_effect_style`        | 副作用导入和样式副作用导入                                                                      |
| 5    | `internal-*`                               | 项目内部别名（`@/`），按依赖层级排列（配置 → 基础设施 → 数据层 → 状态 → 逻辑 → 视图）           |
| 6    | `internal`                                 | 其他未分类的内部导入                                                                            |
| 7    | `subpath` / `parent` / `sibling` / `index` | 相对路径导入                                                                                    |
| 8    | `style`                                    | 样式文件导入                                                                                    |
| 9    | `unknown`                                  | 未知类型导入                                                                                    |

External 依赖排序层级（`order.json`）：

```
构建工具 (vite, webpack, esbuild, tsdown...)
  → 测试 (vitest, playwright, cypress...)
  → 框架 (vue, nuxt, react, next...)
  → 状态管理 (pinia, zustand, jotai...)
  → UI 组件库 (element-plus, ant-design-vue, naive-ui...)
  → CSS 引擎 (tailwindcss, unocss, postcss...)
  → 工具库 (axios, date-fns, es-toolkit, @tanstack/**...)
```

Internal 别名排序层级（`order.json`）：

```
配置 (config, setting, constants...)
  → 共享/工具 (shared, utils, lib...)
  → 插件/指令 (plugins, directives...)
  → 中间件 (middleware...)
  → 数据层 (api, service...)
  → 国际化 (i18n, locales...)
  → 状态 (store, context...)
  → 逻辑复用 (composables, hooks...)
  → 路由 (router...)
  → 功能模块 (modules...)
  → 视图 (components...)
  → 样式/资源 (styles, assets...)
```

> 你可以在 `node_modules/@soybeanjs/oxc-config/dist/order.json` 中查看完整排序，或直接修改源码中的 `src/order.json` 来自定义。

### oxlint 配置

在项目根目录创建 `oxlint.config.ts`：

```ts
import { lint } from '@soybeanjs/oxc-config';

export default lint;
```

#### 启用的插件

- **eslint** — ESLint 兼容规则
- **typescript** — TypeScript 专用规则
- **unicorn** — 最佳实践规则
- **oxc** — OXC 特有规则
- **import** — Import/Export 规则
- **vue** — Vue SFC 规则

#### 自定义规则：soybeanjs-import

本配置附带一个 oxlint JS 插件，加载路径为 `@soybeanjs/oxc-config/plugins/import`，内置 3 条规则：

- `soybeanjs-import/merge-duplicates`：同一模块最多保留一条 value import 和一条 type import，并自动合并重复导入
- `soybeanjs-import/no-inline-type-import`：禁止 `import { type Foo }` 这种 inline type import，自动改成顶层 `import type`
- `soybeanjs-import/type-after-value`：同一模块内要求 value import 在前，type import 在后

示例：

```ts
// ✅ 修复后
import { a, b } from './types';
import type { DemoTest } from './types';

// ❌ 重复导入
import { b } from './types';
import { a } from './types';
import type { DemoTest } from './types';
```

```ts
// ✅ 修复后
import { a } from './types';
import type { DemoTest } from './types';

// ❌ inline type import
import { a, type DemoTest } from './types';
```

```ts
// ✅ 正确
import { ref } from 'vue';
import type { Ref } from 'vue';

// ❌ 错误
import type { Ref } from 'vue';
import { ref } from 'vue';
```

在 `oxlint.config.ts` 中启用：

(导出的lint默认已经包含了插件和规则，这里仅展示如何覆盖或添加规则)

```ts
import { lint } from '@soybeanjs/oxc-config';

export default {
  ...lint,
  jsPlugins: ['@soybeanjs/oxc-config/plugins/import'],
  rules: {
    'soybeanjs-import/merge-duplicates': 'warn',
    'soybeanjs-import/no-inline-type-import': 'warn',
    'soybeanjs-import/type-after-value': 'warn'
  }
};
```

## 脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "lint": "oxlint --fix",
    "fmt": "oxfmt"
  }
}
```

## 许可证

[MIT](./LICENSE)
