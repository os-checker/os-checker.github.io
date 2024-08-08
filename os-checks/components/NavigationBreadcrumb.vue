<template>
  <div>
    <Breadcrumb :home="home" :model="items">
      <template #item="{ item }">
        <NuxtLink :to="item.url"><span :class="item.icon"></span></NuxtLink>
      </template>
      <template #separator> / </template>
    </Breadcrumb>
  </div>
</template>

<script setup>
const home = ref({ icon: 'pi pi-home', url: "/" });
const items = ref([{ icon: 'pi pi-sitemap' }]);
</script>
