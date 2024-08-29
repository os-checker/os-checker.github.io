<script setup lang="ts">
import type { FetchError } from 'ofetch';
import type { TreeNode } from 'primevue/treenode';
import type { Columns } from '~/modules/types';

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

    <Column field="user" header="User" expander sortable style="width: 150px">
      <template #filter>
        <InputText v-model="filters.user" type="text" :placeholder="`Filter by user`" style="width: 150px" />
      </template>
    </Column>

    <Column field="repo" header="Repo" sortable style="width: 180px">
      <template #filter>
        <InputText v-model="filters.repo" type="text" :placeholder="`Filter by repo`" style="width: 180px" />
      </template>

      <!-- PrimeVue 的 bug，不支持 #body="{data}" https://github.com/primefaces/primevue/issues/5855 -->
      <!-- TODO: 自定义样式或者内容 -->
      <!-- <template #body="{ node: { data } }"> -->
      <!--   <Button :label="data.repo" text /> -->
      <!-- </template> -->
    </Column>

    <Column field="package" header="Package" sortable style="width: 180px">
      <template #filter>
        <InputText v-model="filters.package" type="text" :placeholder="`Filter by package`" style="width: 180px" />
      </template>
    </Column>

    <Column field="total_count" header="报告数量" sortable style="min-width: 120px" />

    <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" sortable style="min-width: 120px" />

  </TreeTable>

</template>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  /* 允许子元素换行 */
  justify-content: space-between;
}
</style>
