<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div>
    {{ $route.params.user }} - {{ $route.params.repo }}
  </div>
</template>
