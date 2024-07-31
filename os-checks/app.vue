<script setup lang="ts">
import MultiSelect from 'primevue/multiselect';
import type { TreeNode } from 'primevue/treenode';

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])
useAsyncData('home', () => queryContent('/nodes').findOne()).then(({ data }) => {
  nodes.value = data.value?.body as unknown as TreeNode[] ?? []
})

const columns = ref([
  { field: 'name', header: 'Name', expander: true },
  { field: 'size', header: 'Size' },
  { field: 'type', header: 'Type' }
]);

// interactive filter mode
const filters = ref<any>({});
const filterMode = ref<any>({});
const filterOptions = ref([
  { label: 'Lenient', value: 'lenient' },
  { label: 'Strict', value: 'strict' }
]);

const selectedColumns = ref(columns.value);
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};
</script>

<template>

  <TreeTable :value="nodes" tableStyle="min-width: 50rem" :filterMode="filterMode.value" :filters="filters">

    <template #header>
      <div class="container">
        <div class="left-to-right" style="text-align:left">
          <MultiSelect :modelValue="selectedColumns" @update:modelValue="onToggle" :options="columns"
            optionLabel="header" class="w-full sm:w-64" display="chip" />
        </div>
        <div class="right-to-left" style="display: flex;  justify-content: flex-end;">
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

  <div>
    <i class="pi pi-check" style="font-size: 1rem"></i>
    <i class="pi pi-times" style="font-size: 1.5rem"></i>
    <i class="pi pi-search" style="font-size: 2rem"></i>
    <i class="pi pi-user" style="font-size: 2.5rem"></i>
  </div>

</template>


<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  /* 让两个子 div 分别靠近容器的左右边缘 */
}

.left-to-right {
  display: flex;
  flex-direction: row;
  /* 默认值，子元素水平排列 */
  justify-content: flex-start;
  /* 子元素从左往右排列 */
}

.right-to-left {
  display: flex;
  justify-content: flex-end;
  /* 子元素在容器内靠右对齐 */
}
</style>