<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';
import type { FileTree } from '~/shared/file-tree';
import { ALL_PKGS } from '~/shared/file-tree/types';
import { updateSelectedKey, type Get } from '~/shared/file-tree/utils';

type Props = { get: Get, pkg?: string };
const { get, pkg } = defineProps<Props>();

const filtered_fileTree = computed<FileTree>(() => {
  const ft = get.fileTree;
  if (!pkg || pkg === ALL_PKGS) return ft;
  const data = ft.data.filter(node => node.pkg === pkg);
  return { ...ft, ...{ data } }
});

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
