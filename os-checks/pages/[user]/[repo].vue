<script setup lang="ts">
const route = useRoute();
const user = route.params.user;
const repo = route.params.repo;
</script>

<template>
  <div>
    <FileTree :fetch_path="(target: string) => `ui/repos/${user}/${repo}/${target}.json`" />
  </div>
</template>
