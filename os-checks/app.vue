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
  flex-wrap: wrap;
  /* 允许子元素换行 */
  justify-content: space-between;
}

.left-to-right,
.right-to-left {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* 允许子元素在必要时换行 */
}

.left-to-right {
  justify-content: flex-start;
  /* 子元素从左往右排列 */
}

.right-to-left {
  justify-content: flex-end;
  /* 子元素在容器内靠右对齐 */
  margin-left: auto;
  /* 将第二个 div 推到容器的右侧 */
}

/* 子元素样式 */
.left-to-right div,
.right-to-left div {
  text-align: center;
  flex: 1 1 150px;
  /* 允许子元素有一定大小并根据需要换行 */
}

/* 媒体查询：对于较小的屏幕，调整元素的最小宽度 */
@media (max-width: 600px) {

  .left-to-right div,
  .right-to-left div {
    flex-basis: 100%;
    /* 在小屏幕上，每个子元素占据整行 */
    margin: 5px 0;
    /* 调整垂直方向的外边距 */
  }
}
</style>