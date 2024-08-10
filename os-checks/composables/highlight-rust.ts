import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import diff from 'highlight.js/lib/languages/diff';

export default function () {
  // 注册语言
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('diff', diff);

  // 渲染静态代码片段，需要这个
  onMounted(() => {
    const blocks = Array.from(document.querySelectorAll('pre code')) as HTMLElement[];
    blocks.forEach((block) => {
      // 确保 block 是 <code> 元素
      if (block.tagName === 'CODE') {
        hljs.highlightElement(block);
      }
    });
  });
}
