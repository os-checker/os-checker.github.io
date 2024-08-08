<template>
  <div>
    <div class="naviBreadcrumb">
      <Button icon="pi pi-home" text>
        <NuxtLink to="/"><span class="pi pi-home" /></NuxtLink>
      </Button>

      <Button icon="pi pi-sitemap" text />

      <DarkMode />
    </div>

    <!-- <Breadcrumb :home="home" :model="items"> -->
    <!--   <template #item="{ item }"> -->
    <!--     <NuxtLink :to="item.url"><span :class="item.icon" /></NuxtLink> -->
    <!--   </template> -->
    <!--   <template #separator> / </template> -->
    <!-- </Breadcrumb> -->
  </div>
</template>

<script setup>
// const home = ref({ icon: 'pi pi-home', url: "/" });
// const items = ref([{ icon: 'pi pi-sitemap' }]);
</script>

<style scoped>
.naviBreadcrumb {
  display: flex;
  align-items: center;
  /* 垂直居中所有子元素 */
  height: 55px;
  /* 容器的高度 */
  --p-button-sm-padding-x: 0.8rem;
}
</style>
