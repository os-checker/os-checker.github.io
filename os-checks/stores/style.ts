export const useStyleStore = defineStore('style', () => {
  const color = reactive({ green: "green", red: "red", grey: "grey" });
  const viewportHeight = ref(800);

  onMounted(() => {
    // 获取元素的计算后的样式
    const styles = window.getComputedStyle(document.documentElement);

    // 获取CSS变量的值
    color.green = styles.getPropertyValue('--p-emerald-500').trim();
    color.red = styles.getPropertyValue('--p-red-500').trim();
    color.grey = styles.getPropertyValue('--p-gray-400').trim();

    // 视窗高度
    viewportHeight.value = window.innerHeight;
    window.addEventListener('resize', () => {
      viewportHeight.value = window.innerHeight;
    });
  });

  return { color, viewportHeight }
});
