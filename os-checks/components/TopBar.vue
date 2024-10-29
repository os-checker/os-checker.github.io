<template>
  <div style="display: flex;">

    <div class="topBarLeft">

      <NuxtLink to="/">
        <Button title="主页" icon="pi pi-home" />
      </NuxtLink>

      <NuxtLink to="/file-tree">
        <Button title="问题文件树" icon="pi pi-sitemap" />
      </NuxtLink>

      <NuxtLink to="/charts">
        <Button title="统计图" icon="pi pi-chart-bar" />
      </NuxtLink>

      <NuxtLink to="/target">
        <Button title="编译目标明细表" icon="pi pi-objects-column" />
      </NuxtLink>

      <NuxtLink to="/workflows">
        <Button title="Github Workflows" icon="pi pi-bell" />
      </NuxtLink>

      <NuxtLink to="/info">
        <Button title="Package & Testcase Infomation" icon="pi pi-microchip" />
      </NuxtLink>

    </div>

    <div class="topBarRight">

      <TargetDropDown />

      <Button title="使用说明" icon="pi pi-question" severity="info" as="a" target="_blank" rel="noopener"
        href="https://os-checker.github.io/book" />

      <DarkMode />

    </div>

  </div>
</template>

<style scoped>
.topBarLeft,
.topBarRight {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.25rem 0.8rem;
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

.topBarLeft {
  justify-content: flex-start;
  /* 子元素从左往右排列 */
}

.topBarRight {
  display: flex;
  /* 子元素在容器内靠右对齐 */
  justify-content: flex-end;
  /* 子元素在容器内靠右对齐 */
  margin-left: auto;
}
</style>
