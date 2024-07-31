<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';

const nodes: TreeNode[] = [{
  key: "1",
  data: { name: "a", size: 1, type: true, },
  children: [
    {
      key: "11", data: { name: "aa", size: 11, type: true }, children: [
        { key: "11", data: { name: "aa", size: 11, type: true }, },
        { key: "12", data: { name: "ab", size: 12, type: true } },
        { key: "13", data: { name: "ac", size: 13, type: true } },
      ]
    },
    { key: "12", data: { name: "ab", size: 12, type: true } },
    { key: "13", data: { name: "ac", size: 13, type: true } },
  ]
},
{
  key: "2",
  data: { name: "b", size: 2, type: false, },
  children: [
    { key: "11", data: { name: "aa", size: 11, type: true } },
    { key: "12", data: { name: "ab", size: 12, type: true } },
    { key: "13", data: { name: "ac", size: 13, type: true } },
  ]
}]
</script>

<template>
  <Button label="Check" icon="pi pi-check-circle" />
  <TreeTable :value="nodes" tableStyle="min-width: 50rem">
    <Column field="name" header="Name" expander style="width: 34%"></Column>
    <Column field="size" header="Size" style="width: 33%"></Column>
    <Column field="type" header="Type" style="width: 33%"></Column>
  </TreeTable>

  <div>
    <i class="pi pi-check" style="font-size: 1rem"></i>
    <i class="pi pi-times" style="font-size: 1.5rem"></i>
    <i class="pi pi-search" style="font-size: 2rem"></i>
    <i class="pi pi-user" style="font-size: 2.5rem"></i>
  </div>

</template>
