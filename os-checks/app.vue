<script setup lang="ts">
import MultiSelect from 'primevue/multiselect';
import type { TreeNode } from 'primevue/treenode';

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])
useAsyncData('home', () => queryContent('/test').findOne()).then(({ data }) => {
  nodes.value = data.value?.body as unknown as TreeNode[] ?? []
})

// FIXME: make fields/columns generated from nodes
const columns = ref([
  { field: 'user', header: 'User', expander: true },
  { field: 'repo', header: 'Repo' },
  { field: 'package', header: 'Package' },
  { field: 'total_count', header: 'Total Count' },
  { field: 'Unformatted(File)', header: 'Unformatted(File)' },
  { field: 'Unformatted(Line)', header: 'Unformatted(Line)' },
  { field: 'Clippy(Warn)', header: 'Clippy(Warn)' },
  { field: 'Clippy(Error)', header: 'Clippy(Error)' },
]);

// interactive filter mode
const filters = ref<any>({});
const filterMode = ref<any>({});
const filterOptions = ref([
  { label: 'Lenient', value: 'lenient' },
  { label: 'Strict', value: 'strict' }
]);

const selectedColumns = ref(columns.value.slice(0, 4));
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};
</script>

<template>

  <TreeTable :value="nodes" tableStyle="min-width: 50rem" :filterMode="filterMode.value" :filters="filters">

    <template #header>
      <div class="container">
        <div class="left-to-right">
          <MultiSelect :modelValue="selectedColumns" @update:modelValue="onToggle" :options="columns"
            optionLabel="header" class="w-full sm:w-64" display="chip" />
        </div>
        <div class="right-to-left">
          <span style="margin-right: 1rem;">
            <Select v-model="filterMode" :options="filterOptions" optionLabel="label" placeholder="搜索/筛选模式" />
          </span>
          <span style="display: inline-block;">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters.global" placeholder="Global Search" />
            </IconField>
          </span>
        </div>
      </div>
    </template>

    <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" :expander="col.expander">
      <template #filter>
        <InputText v-model="filters[col.field]" type="text" :placeholder="`Filter by ${col.field}`" />
      </template>
    </Column>

  </TreeTable>

</template>