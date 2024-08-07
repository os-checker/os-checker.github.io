<template>
  <div ref="containerRef">
    <div v-for="snip in snippets">
      <pre><code :class="`language-${lang} codeblock`" v-html="snip" /></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';


const props = defineProps({
  // 一组代码块文本；这里的类型技巧仅仅为了解决 ts 的类型推断问题，如果写 Array
  // 或者 Array<string>，则出现 Type 'string[] | Ref<string[], string[]>' is not assignable to type 'string[] | undefined'；
  // 注意，不能在父组件传递 snippets 时使用 :snippets="tab.snippets.value"，这会丧失反应式（tab.snippets 数据更新，但子组件不更新）！
  snippets: [String, Array] as unknown as PropType<string[] | Ref<string[], string[]>>,
  // 指定被高亮的语言类型，目前仅为 rust 或者 diff
  lang: { type: String, default: () => "rust" },
});

const containerRef = ref<HTMLElement | null>(null);

function highlight() {
  // 找到所有的code标签并进行高亮
  const codeElements = containerRef.value?.querySelectorAll(`.language-${props.lang}.codeblock`);
  codeElements?.forEach((block) => {
    if (block.tagName === 'CODE') {
      hljs.highlightElement(block as HTMLElement);
      // console.log("hljs highlighted", props.lang);
    }
  });
}

// 侦听动态代码片段的内容变化
watch(() => props.snippets, (_val) => {
  // console.log(_val.length);
  // 等待DOM更新
  nextTick(highlight);
}, { deep: true }); // 确保深度侦听数组内部的变化

// 组件挂载后立即高亮（比如从首次网络获取时渲染）
onMounted(highlight);
</script>
