<template>
  <div>
    <Tree :value="nodes" class="packageFileTree" filterMode="strict" selectionMode="single" :selectionKeys="selectedKey"
      @update:selectionKeys="$emit('update:selectedKey', $event)">
    </Tree>
  </div>
</template>

<!-- 这应该是 primevue 的 bug：使用 node 的数据，导致节点无法展开 -->
<!-- primevue 的 bug2：这段注释甚至不能放进 Tree tag 里面，因为会无法显示节点 label -->
<!-- <template #nodetoggleicon="{ node: { data: { total } } }"> -->
<!--   <span> -->
<!--     {{ total }} -->
<!--   </span> -->
<!-- </template> -->

<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';

type Opts = { [key: string]: boolean };
const props = defineProps<{
  nodes: TreeNode[],
  // filter: boolean,
  selectedKey: Opts,
}>();
defineEmits(["update:selectedKey"]);

// const selectedKey = ref();
// watch(selectedKey, val => console.log(`${JSON.stringify(val)}`));
</script>

<style scoped>
.packageFileTree {
  --p-tree-node-hover-color: #ff5722;
  --p-tree-node-selected-color: #ff5722;
  --p-tree-node-focus-ring-color: #ff5722;
  --p-tree-node-icon-hover-color: #ff5722;
  --p-tree-node-icon-selected-color: #ff5722;
  --p-tree-node-toggle-button-focus-ring-color: #ff5722;
  --p-tree-node-toggle-button-hover-color: #ff5722;
  --p-tree-node-toggle-button-selected-hover-color: #ff5722;
  --p-tree-node-selected-background: #f2f2f2;
  --p-tree-node-gap: 0rem;
  --p-tree-padding: 0;
  --p-tree-node-padding: 0.3rem 0.2rem;
  --p-tree-node-toggle-button-size: 1.4rem;
}
</style>
