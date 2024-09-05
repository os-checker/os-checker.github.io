// NOTE: Nuxt 存在 bug，识别不到 $route 类型
// Property '$route' does not exist on type
//
// 见：https://github.com/nuxt/nuxt/issues/28373
// 
// 根据 https://github.com/nuxt/nuxt/releases/tag/v3.13.0
// 一个修复是创建这个 declarations.d.ts 文件。

import type {
  ComponentCustomOptions as _ComponentCustomOptions,
  ComponentCustomProperties as _ComponentCustomProperties,
} from 'vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends _ComponentCustomProperties { }
  interface ComponentCustomOptions extends _ComponentCustomOptions { }
}
