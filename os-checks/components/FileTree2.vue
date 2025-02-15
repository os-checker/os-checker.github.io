<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';
import type { FileTree } from '~/shared/file-tree';
import { updateSelectedKey, type Get } from '~/shared/file-tree/utils';

type Props = { get: Get, count: number | null };
const { get, count } = defineProps<Props>();

const filtered_fileTree = computed<FileTree>(() => get.fileTree);

const nodes = computed<TreeNode[]>(() => {
  let nodes = [];

  let key = 0;
  for (const datum of filtered_fileTree.value.data) {
    let node: TreeNode = {
      key: (key++).toString(), label: `[${datum.count}] ${datum.repo} #${datum.pkg}`, children: [],
    };
    let count_fmt = 0;
    let count_clippy_warn = 0;
    let count_clippy_error = 0;
    for (const report of datum.raw_reports) {
      node.children?.push({
        key: (key++).toString(),
        label: `[${report.count}] ${report.file}`,
        data: report.file
      });

    }
    node.data = {
      user: datum.user, repo: datum.repo, pkg: datum.pkg,
      total: datum.count, fmt: count_fmt, clippy_warn: count_clippy_warn, clippy_error: count_clippy_error
    };
    nodes.push(node);
  }
  return nodes;
});

const selectedKey = ref({});
watch(() => ({ key: selectedKey.value, n: nodes.value, ft: filtered_fileTree.value }),
  ({ key, n, ft }) => {
    const val = updateSelectedKey(key, n, ft);
    if (val !== undefined) {
      get.tabs = val.results;
      get.selectedTab = val.selectedTab;
    }
  });

// true means keeping file tree panel open (thus shows left arrow icon to indicate close)
const displayFileTree = ref(true);
const displayFileTreeIcon = computed<string>(() => displayFileTree.value ? "pi pi-angle-double-left" : "pi pi-angle-double-right");

// true means keeping filter panel open (thus shows up arrow icon to indicate close)
const displayFilters = defineModel<boolean>("filters", { default: true });
const displayFiltersIcon = computed<string>(() => displayFilters.value ? "pi pi-angle-double-up" : "pi pi-angle-double-down");

onMounted(() => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.code === "Space") displayFileTree.value = !displayFileTree.value;
    else if (event.code === "Escape") displayFilters.value = !displayFilters.value;
    else if (event.code === "ArrowLeft") displayFileTree.value = false;
    else if (event.code === "ArrowRight") displayFileTree.value = true;
    else if (event.code === "ArrowUp") displayFilters.value = false;
    else if (event.code === "ArrowDown") displayFilters.value = true;
  });
});

const { viewportHeight } = storeToRefs(useStyleStore());
const heightCodePanel = computed(() => {
  const height = viewportHeight.value;
  // add more space to scroll codeblock panel to the bottom if filters exist
  const adjust = displayFilters.value ? 100 : 0;
  return `${height * 0.85 - adjust}px`;
});
</script>

<template>
  <div class="fileViewPanel">

    <div class="fileViewNavi" v-if="displayFileTree">
      <div style="height: 3.2rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; justify-content: left; gap: 8px;">
          <div style="margin-left: 10px;">
            <Button style="height: 2.4rem;" :icon="displayFileTreeIcon" severity="secondary" variant="text"
              @click="() => displayFileTree = !displayFileTree" />
          </div>
          <div>
            <Button style="height: 2.4rem;" :icon="displayFiltersIcon" severity="secondary" variant="text"
              @click="() => displayFilters = !displayFilters" />
          </div>
        </div>
        <div v-if="count">
          <b style="margin-right: 10px;">Total Count:</b><Button style="height: 2.4rem;" severity="danger">
            {{ count }}
          </Button>
        </div>
      </div>

      <ScrollPanel class="fileViewMenu">
        <PackageFileMenu :nodes="nodes" :selectedKey="selectedKey" @update:selectedKey="selectedKey = $event" />
      </ScrollPanel>
    </div>

    <div class="fileViewResult">
      <Tabs :value="get.selectedTab" scrollable>
        <TabList>
          <Tab v-for="tab in get.tabs" :value="tab.kind" :disabled="tab.disabled">
            {{ tab.kind }}
            <span class="tabBadge">
              <Badge :value="tab.raw.length" :severity="tab.severity" />
            </span>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="tab in get.tabs" :value="tab.kind">
            <ScrollPanel :dt="{ bar: { background: '{primary.color}' } }" :style="{ height: heightCodePanel }">
              <CodeBlock :snippets="tab.raw" :lang="tab.lang" />
            </ScrollPanel>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

  </div>
</template>

<style scoped>
.tabBadge {
  vertical-align: super;
  --p-badge-padding: 0.2rem;
  --p-badge-font-size: normal;
  --p-badge-height: 1rem;
  --p-badge-min-width: 1.5rem;
  --p-badge-secondary-color: grey;
}

.fileViewPanel {
  display: flex;
}

.fileViewNavi {
  flex: 0 0 25%;
  padding-left: 0.25rem;
  /* padding-right: 0.5rem; */
  /* flex-grow, flex-shrink, flex-basis */
  /* 左边div不扩展也不收缩，基础宽度为10% */
}

.fileViewMenu {
  flex: 1;
  height: 92vh;
  /* 允许不含空格的单词在任何地方换行 */
  word-break: break-all;
  font-size: smaller;
}

.fileViewResult {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 0rem 0.5rem 0rem 1rem;
  /* 控制代码块容器的 padding: 上、右、下、左 */
  --p-tabs-tabpanel-padding: 0.35rem 0rem 0 0;
  /* 右边div占据剩余空间 */
  /* 可以省略flex-grow为1，因为默认值就是1 */

  /* 选中标签页的底部块的高度 */
  --p-tabs-active-bar-height: 3.2px;
}
</style>
