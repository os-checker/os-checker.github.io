<script setup lang="ts">
import Button from 'primevue/button';
import type { CheckerResult, FileTree } from '~/shared/file-tree';
import type { Get } from '~/shared/file-tree/utils';

type Props = {
  get: Get, tmp: string,
  tabs: CheckerResult[],
  selectedTab: string,
  fileTree: FileTree,
};
const props = defineProps<Props>();

watch(() => props.get, val => console.log("Print", val));
watch(() => props.fileTree, val => console.log("Print fileTree", val));
</script>

<template>
  <Button>{{ props.tmp }}</Button>
  <div>
    fileTree.data.length: {{ props.fileTree.data.length }}
  </div>
  <div>
    tabs: {{ props.tabs }}
  </div>
  <div>
    selectedTab: {{ props.selectedTab }}
  </div>

  {{ props.get }}
</template>
