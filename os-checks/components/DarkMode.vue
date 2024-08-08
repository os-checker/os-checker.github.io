<template>
  <ClientOnly>
    <span style="margin-right: 0.8rem;">
      <Button @click="toggleDarkMode" severity="contrast" :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'" />
    </span>
  </ClientOnly>
</template>

<script setup lang="ts">
// Toggle light vs dark theme.
const { $darkMode } = useNuxtApp();
const darkMode = $darkMode?.init || ref(false);
watch(darkMode, (dark) => {
  $darkMode.toggle(dark);
  $darkMode.store(dark); // Store dark theme locally
});
const toggleDarkMode = () => darkMode.value = !darkMode.value;
</script>
