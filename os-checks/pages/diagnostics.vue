<script setup lang="ts">
import type { FetchError } from 'ofetch';
import type { TreeNode } from 'primevue/treenode';
import type { Columns, PassCountRepo, PassCountRepos } from '~/shared/types';
import { rightCell } from '~/shared/styling';

useHead({ title: 'Diagnostics' });

const { viewportHeight } = storeToRefs(useStyleStore());
const tableHeight = computed(() => `${Math.round(viewportHeight.value * 0.75)}px`);

// fetch JSON data from content dir
const nodes = ref<TreeNode[]>([])

const dataColumns = ref<Columns>([]);

// 无诊断的仓库数量和具有 target 的总仓库
const selectedPassCountRepo = ref<PassCountRepo>({ pass: 0, total: 0 });
const passCountRepos = ref<PassCountRepos>({ "": { pass: 0, total: 0 } });
githubFetch<PassCountRepos>({
  path: "ui/pass_count_repo/_targets_.json"
}).then(data => passCountRepos.value = data);

// pick data columns
const selectedColumns = ref(dataColumns.value);
// Label to display after exceeding max selected labels.
const selectedItemsLabel = computed(() => `${selectedColumns.value.length} checkers are selected; click to customize columns displayed`);
const onToggle = (val: any) => selectedColumns.value = dataColumns.value.filter(col => val.includes(col));

const basic = useBasicStore();
basic.init_with_and_subscribe_to_current_and_columns((target, columns) => {
  // 更新进度条
  const selected_pass_count_repo = passCountRepos.value[target]
  if (selected_pass_count_repo) {
    selectedPassCountRepo.value = selected_pass_count_repo;
  }

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

// 计算通过率
const progressRatio = computed(() => {
  const count = selectedPassCountRepo.value;
  if (count.total !== 0) {
    return Math.round(count.pass / count.total * 100.0);
  } else {
    return 0;
  }
});
</script>

<template>
  <div class="home-table">

    <div style="display: flex; justify-content: center; align-content: center">
      <div style="padding-right: 10px">
        <span class="pass-repo"> Pass </span>/ Total Repos:
        <span class="pass-repo"> {{ selectedPassCountRepo.pass }}
        </span>
        / {{ selectedPassCountRepo.total }}
        <span v-if="progressRatio < 5">
          <Tag severity="danger" rounded>({{ progressRatio }}%)</Tag>
        </span>
      </div>
      <ProgressBar :value="progressRatio" style="flex-grow: 1; height: auto;" />
    </div>

    <TreeTable :value="nodes" tableStyle="min-width: 50rem" :filters="filters" removableSort sortMode="multiple"
      scrollable :scrollHeight="tableHeight" v-model:selectionKeys="selectedKey" selectionMode="single" paginator
      :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]">

      <template #header>
        <div class="header">

          <div>
            <MultiSelect :modelValue="selectedColumns" @update:modelValue="onToggle" :options="dataColumns"
              :maxSelectedLabels="8" :selectedItemsLabel="selectedItemsLabel" optionLabel="header"
              class="w-full sm:w-64" display="chip" />
          </div>

          <div>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global']" placeholder="Global Search" />
            </IconField>
          </div>

        </div>
      </template>

      <Column field="idx" header="Idx" expander frozen style="min-width: 80px" />

      <Column field="user" header="User" sortable frozen style="min-width: 160px" />

      <Column field="repo" header="Repo" sortable frozen style="min-width: 200px">
        <!-- PrimeVue 的 bug，不支持 #body="{data}" https://github.com/primefaces/primevue/issues/5855 -->
        <template #body="{ node: { data } }">
          <NuxtLink :to="`/${data.user}/${data.repo}`" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column field="pkg" header="Package" frozen sortable style="min-width: 180px" />

      <Column field="total_count" header="Total" sortable style="min-width: 120px;" :pt="rightCell" />

      <Column v-for="col in selectedColumns" :field="col.field" :header="col.header" sortable :pt="rightCell"
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

.home-table {
  margin: 2px 10px;
  height: 50%;
}

.pass-repo {
  color: var(--p-button-primary-background);
  font-weight: bold;
}
</style>
