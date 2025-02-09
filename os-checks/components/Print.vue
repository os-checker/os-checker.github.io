<script setup lang="ts">
import type { Get } from '~/shared/file-tree/utils';

type Props = { get: Get };
const props = defineProps<Props>();

watch(() => props.get, val => console.log("Print", val));
</script>

<template>
  {{ props.get }}
</template>
