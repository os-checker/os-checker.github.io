<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])
useAsyncData('home', () => queryContent('/test').findOne()).then(({ data }) => {
  let value = data.value?.body as unknown as TreeNode[] ?? [];
  // 展平单仓库单项目成一行数据
  for (let i = 0; i < value.length; i++) {
    let node = value[i];
    if (!node.children) {
      continue;
    }
    if (node.children.length === 1) {
      node = node.children[0];
      value[i] = node;
      continue;
    }
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].data.total_count === 0) {
        // 当总计为 0，不要显示 0
        node.children[i].data.total_count = null;
      }
    }
  }
  nodes.value = value
})

// TODO: make fields/columns generated from nodes
const columns = ref([
  { field: 'user', header: 'User', expander: true },
  { field: 'repo', header: 'Repo' },
  { field: 'package', header: 'Package' },
  { field: 'total_count', header: '报告数量' },
  { field: 'Clippy(Error)', header: 'Clippy(Errors)' },
  { field: 'Clippy(Warn)', header: 'Clippy(Warns)' },
  { field: 'Unformatted(File)', header: '未格式化' },
]);

// interactive filter
const filterHeaderInputs = ref<any>({});
// 只对非数值列筛选
const filterHeaders = ['user', 'repo', 'package']

const selectedColumns = ref(columns.value);
const onToggle = (val: any) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};

// Toggle light vs dark theme.
const { $darkMode } = useNuxtApp();
// function getDarkMode() {
//   return $darkMode?.get() || false;
//   // if (import.meta.browser) {
//   //   return localStorage.getItem("darkMode") ? true : false;
//   // } else {
//   //   return true
//   // }
// }
// function setDarkMode(dark: boolean) {
//   if (dark) {
//     $darkMode.set(dark);
//   }
//   // if (import.meta.browser && dark) {
//   //   localStorage.setItem("darkMode", "1");
//   // }
// }
// function toggleDarkModeClass(dark: boolean) {
//   $darkMode.toggle(dark);
// document.querySelector("html")?.classList.toggle("my-app-dark", dark);
// }
function toggleDarkMode() {
  darkMode.value = !darkMode.value;
}
const darkMode = ref($darkMode?.get() || false);
watch(darkMode, (dark) => {
  $darkMode.toggle(dark);
  // Store dark theme locally
  $darkMode.store(dark);
});
</script>

<template>

  <TreeTable :value="nodes" tableStyle="min-width: 50rem" removableSort sortMode="multiple">

    <template #header>
      <div class="container">
        <div class="left-to-right">
          <MultiSelect :modelValue="selectedColumns" @update:modelValue="onToggle" :options="columns"
            optionLabel="header" class="w-full sm:w-64" display="chip" />
        </div>
        <div class="right-to-left">

          <span style="margin-right: 0.8rem;">
            <Button @click="toggleDarkMode" :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'" severity="contrast" />
          </span>

          <span style="display: inline-block;">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText placeholder="Global Search" />
            </IconField>
          </span>
        </div>
      </div>
    </template>

    <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" :expander="col.expander" sortable>
      <template #filter>
        <InputText v-if="filterHeaders.includes(col.field)" v-model="filterHeaderInputs[col.field]" type="text"
          :placeholder="`Filter by ${col.field}`" />
      </template>
    </Column>

  </TreeTable>


</template>
