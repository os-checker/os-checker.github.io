<template>
  <div>
    <PanelMenu :model="items" class="packageFileMenu" :pt="{ itemIcon: { style: 'font-size: 0.8rem;' } }" />
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';

const props = defineProps({
  items: Array<MenuItem>,
});
</script>

<style scoped>
.packageFileMenu {
  --p-panelmenu-item-padding: 0.3rem;
  --p-panelmenu-panel-padding: 0.2rem;
  --p-panelmenu-item-gap: 0.2rem;
  --p-panelmenu-submenu-icon-focus-color: #ff5722;
  --p-panelmenu-item-icon-focus-color: #ff5722;
  --p-panelmenu-item-focus-color: #ff5722;
}
</style>
