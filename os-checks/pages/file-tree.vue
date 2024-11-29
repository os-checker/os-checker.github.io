<template>
  <div>
    <FileTree :fetch_path="(target: string) => `ui/file-tree/split/${target}.json`" />
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Issue File Tree' });
</script>
