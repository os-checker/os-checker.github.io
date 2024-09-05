<script setup lang="ts">
import type { FetchError } from 'ofetch';
import type { TreeNode } from 'primevue/treenode';
import type { Columns } from '~/shared/types';

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])

const dataColumns = ref<Columns>([]);

// pick data columns
const selectedColumns = ref(dataColumns.value);
const onToggle = (val: any) => selectedColumns.value = dataColumns.value.filter(col => val.includes(col));

const basic = useBasicStore();
const { current, columns } = storeToRefs(basic);

function init(target: string, columns: Columns) {
  dataColumns.value = columns;
  selectedColumns.value = columns;

  const path = `ui/home/split/${target}.json`;
  githubFetch<TreeNode[]>({ path })
    .then((value) => {
      // const value = data as TreeNode[];
      // const value = JSON.parse(data as string) as TreeNode[];
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
      }
      nodes.value = value
    }).catch((err: FetchError) => {
      if (err.statusCode === 404) {
        nodes.value = [{ key: "0", data: { user: "ALL", repo: "ALL", package: "ALL", total_count: 0 } }];
      }
    });
}

init(basic.current, basic.columns);
watchEffect(() => init(current.value, columns.value));

// interactive filter/search inputs
const filters = ref<any>({});

// a single selected row
const selectedKey = ref();

function sum(field: string): number {
  return field ? nodes.value.map(node => node.data[field] ?? 0).reduce((acc, cur) => acc + cur, 0) : 0;
}
</script>

<template>

  <TreeTable :value="nodes" tableStyle="min-width: 50rem" :filters="filters" removableSort sortMode="multiple"
    scrollable scrollHeight="80vh" v-model:selectionKeys="selectedKey" selectionMode="single">

    <template #header>
      <div class="header">

        <div>
          <MultiSelect :modelValue="selectedColumns" @update:modelValue="onToggle" :options="dataColumns"
            optionLabel="header" class="w-full sm:w-64" display="chip" />
        </div>

        <div>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters['global']" placeholder="Global Search" />
          </IconField>
        </div>

      </div>
    </template>

    <Column field="user" header="User" expander sortable style="min-width: 180px" />

    <Column field="repo" header="Repo" sortable style="width: 180px">
      <!-- PrimeVue 的 bug，不支持 #body="{data}" https://github.com/primefaces/primevue/issues/5855 -->
      <template #body="{ node: { data } }">
        <NuxtLink :to="`/${data.user}/${data.repo}`" class="nav-link">
          {{ data.repo }}
        </NuxtLink>
      </template>
    </Column>

    <Column field="package" header="Package" sortable style="width: 180px" />

    <Column field="total_count" header="报告数量" sortable style="min-width: 120px; word-break: keep-all;" />

    <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" sortable
      style="min-width: 120px; word-break: keep-all;" />

  </TreeTable>

</template>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  /* 允许子元素换行 */
  justify-content: space-between;
}

.nav-link {
  color: #336ad7;
  /* 统一的链接颜色 */
  text-decoration: none;
}

.nav-link.router-link-active {
  color: #336ad7;
  /* 重置激活链接的颜色 */
}
</style>
