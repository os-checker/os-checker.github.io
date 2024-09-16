<template>
  <ClientOnly>
    <span>
      <Button title="主题切换" @click="toggleDarkMode" severity="contrast" :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'" />
    </span>
  </ClientOnly>
</template>

<script setup lang="ts">
// Toggle light vs dark theme.
// $darkMode comes from plugins/dark-mode.client.ts provide object
const { $darkMode } = useNuxtApp();
const darkMode = $darkMode?.init || ref(false);
watch(darkMode, (dark) => {
  $darkMode.toggle(dark);
  $darkMode.store(dark); // Store dark theme locally
});
const toggleDarkMode = () => darkMode.value = !darkMode.value;
</script>
