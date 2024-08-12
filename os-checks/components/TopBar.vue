<template>
  <div style="display: flex;">
    <div class="topBar">

      <DarkMode />

      <NuxtLink to="/file-tree">
        <Button title="问题文件树" icon="pi pi-sitemap" />
      </NuxtLink>

      <NuxtLink to="/">
        <Button icon="pi pi-home" title="主页" />
      </NuxtLink>

    </div>
  </div>
</template>

<style scoped>
.topBar {
  display: flex;
  padding: 0.25rem 1rem;
  flex-direction: row;
  align-items: center;
  /* 子元素在容器内靠右对齐 */
  justify-content: flex-end;
  /* 子元素在容器内靠右对齐 */
  margin-left: auto;
  /* 允许子元素换行 */
  justify-content: space-between;
  /* 允许项目换行 */
  flex-wrap: wrap;
  /* 指定项目之间的间隔 */
  gap: 0.5rem;
  /* 垂直居中所有子元素 */
  height: 55px;
  /* 容器的高度 */
  --p-button-sm-padding-x: 0.8rem;
}
</style>
