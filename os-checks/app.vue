<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

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

const columns = ref([
  { field: 'name', header: 'Name', expander: true },
  { field: 'size', header: 'Size' },
  { field: 'type', header: 'Type' }
]);

interface Filters {
  [key: string]: string;
}
const filters = ref<Filters>({ global: "", name: "", size: "size:)", type: "" });
</script>

<template>
  <Button label="Check" icon="pi pi-check-circle" />
  <TreeTable :value="nodes" tableStyle="min-width: 50rem" filterMode="lenient">
    <template #header>
      <div class="flex justify-end">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters['global']" placeholder="Global Search" />
        </IconField>
      </div>
    </template>
    <Column v-for="col in columns" :field="col.field" :header="col.header" :expander="col.expander">
      <template #filter>
        <InputText v-model="filters[col.field]" type="text" :placeholder="`Filter by ${col.field}`" />
      </template>
    </Column>
  </TreeTable>

  <div>
    <i class="pi pi-check" style="font-size: 1rem"></i>
    <i class="pi pi-times" style="font-size: 1.5rem"></i>
    <i class="pi pi-search" style="font-size: 2rem"></i>
    <i class="pi pi-user" style="font-size: 2.5rem"></i>
  </div>

</template>
