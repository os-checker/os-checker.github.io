<script setup lang="ts">
import type { FetchError } from 'ofetch';
import type { TreeNode } from 'primevue/treenode';
import type { Columns, PassCountRepo } from '~/shared/types';

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])

const dataColumns = ref<Columns>([]);

// pick data columns
const selectedColumns = ref(dataColumns.value);
const onToggle = (val: any) => selectedColumns.value = dataColumns.value.filter(col => val.includes(col));

const basic = useBasicStore();
basic.init_with_and_subscribe_to_current_and_columns((target, columns) => {
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
          const idx = node.data.idx;
          node = node.children[0];
          node.data.idx = idx; // 恢复仓库序号
          value[i] = node;
          continue;
        }
      }
      nodes.value = value
    }).catch((err: FetchError) => {
      if (err.statusCode === 404) {
        nodes.value = [{ key: "0", data: { user: "ALL", repo: "ALL", pkg: "ALL", total_count: 0 } }];
      }
    });
});

// interactive filter/search inputs
const filters = ref<any>({});

// a single selected row
const selectedKey = ref();

// 无诊断的仓库数量（或者总仓库数量）
const passCountRepo = ref<PassCountRepo>({ pass: 0, total: 0 });
githubFetch<PassCountRepo>({
  path: "ui/pass_count_repo.json"
}).then(data => passCountRepo.value = data);
// 计算通过率
const progressRatio = computed(() => {
  const count = passCountRepo.value;
  if (count.total !== 0) {
    return Math.round(count.pass / count.total * 100.0);
  } else {
    return 0;
  }
});
// 根据 target 更新 pass 数（因为总仓库数量是不变的？？ 或许我们需要基于 target 的总仓库数量？？）
watch(nodes, (n) => passCountRepo.value.pass = passCountRepo.value.total - (n.at(-1)?.data?.idx ?? 0));
</script>

<template>
  <div class="home-table">

    <div v-if="progressRatio !== 0">
      <ProgressBar :value="progressRatio"> Pass / Total Repos: {{ passCountRepo.pass }} / {{ passCountRepo.total }}
        ({{ progressRatio }}%)
      </ProgressBar>
    </div>

    <TreeTable :value="nodes" tableStyle="min-width: 50rem" :filters="filters" removableSort sortMode="multiple"
      scrollable scrollHeight="82vh" v-model:selectionKeys="selectedKey" selectionMode="single">

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

      <Column field="idx" header="序号" expander style="min-width: 100px" />

      <Column field="user" header="User" sortable style="min-width: 180px" />

      <Column field="repo" header="Repo" sortable style="width: 300px">
        <!-- PrimeVue 的 bug，不支持 #body="{data}" https://github.com/primefaces/primevue/issues/5855 -->
        <template #body="{ node: { data } }">
          <NuxtLink :to="`/${data.user}/${data.repo}`" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column field="pkg" header="Package" sortable style="width: 200px" />

      <Column field="total_count" header="报告数量" sortable style="min-width: 120px; word-break: keep-all;" />

      <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" sortable
        style="min-width: 120px; word-break: keep-all;" />

    </TreeTable>
  </div>
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

.home-table {
  margin: 2px 10px;
  height: 50%;
}
</style>
