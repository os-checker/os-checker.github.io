<script lang="ts" setup>
const { tag, options } = defineProps<{
  tag: string,
  options: string[],
}>();

const selected = defineModel<string | null>({ default: null });
</script>

<template>
  <span class="input">{{ tag }}:</span>
  <span class="select">
    <Select v-model="selected" filter :options="options" />
  </span>
</template>

<style scoped>
.input {
  font-size: 14.5px;
  font-weight: bold;
  padding-right: 10px;
  color: var(--p-button-primary-background);
}

.select {
  padding-right: 10px;
}
</style>
