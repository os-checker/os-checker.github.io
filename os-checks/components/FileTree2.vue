<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';
import { updateSelectedKey, type Get } from '~/shared/file-tree/utils';

type Props = { get: Get };
const { get } = defineProps<Props>();
const { fileTree } = get;
const selectedTab = ref(get.selectedTab);
let tabs = ref(get.tabs);

highlightRust();

const nodes = computed<TreeNode[]>(() => {
  let nodes: TreeNode[] = [];

  let key = 0;
  for (const datum of fileTree.data) {
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
  console.log("nodes")
  return nodes;
});

const selectedKey = ref({});
watch(selectedKey, (key) => {
  const val = updateSelectedKey(key, nodes.value, fileTree);
  if (val !== undefined) {
    tabs.value = val.results;
    selectedTab.value = val.selectedTab;
  };
});
</script>

<template>
  <div class="fileViewPanel">

    <div class="fileViewNavi">
      <ScrollPanel class="fileViewMenu">
        <PackageFileMenu style="padding-right: 0.8rem;" :nodes="nodes" :selectedKey="selectedKey"
          @update:selectedKey="selectedKey = $event" />
      </ScrollPanel>
    </div>

    <div class="fileViewResult">
      <Tabs :value="selectedTab" scrollable>
        <TabList>
          <Tab v-for="tab in tabs" :value="tab.kind" :disabled="tab.disabled">
            {{ tab.kind }}
            <span class="tabBadge">
              <Badge :value="tab.raw.length" :severity="tab.severity" />
            </span>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="tab in tabs" :value="tab.kind">
            <ScrollPanel class="fileViewScroll" :dt="{
              bar: { background: '{primary.color}' },
            }">
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
  padding-right: 0.5rem;
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
  overflow-y: hidden;
  /* 控制代码块容器的 padding: 上、左、下、右 */
  --p-tabs-tabpanel-padding: 0.35rem 0.3rem 0 0;
  /* 右边div占据剩余空间 */
  /* 可以省略flex-grow为1，因为默认值就是1 */
}

.fileViewScroll {
  width: 100%;
  height: 86vh;
}
</style>
