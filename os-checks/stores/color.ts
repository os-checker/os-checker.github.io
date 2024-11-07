export const useColorStore = defineStore('color', () => {
  const color = reactive({ green: "green", red: "red" });

  onMounted(() => {
    // 获取元素的计算后的样式
    const styles = window.getComputedStyle(document.documentElement);

    // 获取CSS变量的值
    color.green = styles.getPropertyValue('--p-emerald-500').trim();
    color.red = styles.getPropertyValue('--p-red-500').trim();
  });

  return { color }
});
