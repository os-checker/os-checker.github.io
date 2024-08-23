<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';

highlightRust();

type Kinds = { [key: string]: string[] };
type RawReport = { file: string, count: number, kinds: Kinds };
type Datum = {
  user: string,
  repo: string,
  package: string,
  count: number,
  raw_reports: RawReport[]
}

type FileTree = {
  // 诊断类别数组，越往前的越优先展示
  kinds_order: string[],
  data: Datum[]
}

const tabs = ref<CheckerResult[]>([]);
const selectedTab = ref("");
const fileTree = ref<FileTree>({ kinds_order: [], data: [] });
githubFetch({ path: "ui/file-tree.json" })
  .then((data) => {
    const file_tree: FileTree = JSON.parse(data as string);

    // 首次打开页面加载数据后，从所有 packags 的原始输出填充到所有选项卡
    let kinds = {};
    for (const datum of file_tree.data) {
      for (const report of datum.raw_reports) {
        for (const kind of Object.keys(report.kinds)) {
          // 对原始输出中的所有特殊符号转义，以后就不需要转义了
          report.kinds[kind] = report.kinds[kind].map(domSanitize);
        }
        mergeObjectsWithArrayConcat(kinds, report.kinds);
      }
    }
    tabs.value = checkerResult(kinds, file_tree.kinds_order);
    selectedTab.value = tabs.value[0]?.kind ?? "";
    fileTree.value = file_tree;
  });

const nodes = ref<TreeNode[]>([]);
watch(fileTree, (data) => {
  nodes.value = [];

  let key = 0;
  for (const datum of data.data) {
    let node: TreeNode = {
      key: (key++).toString(), label: `[${datum.count}] ${datum.repo} #${datum.package}`, children: [],
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
      user: datum.user, repo: datum.repo, package: datum.package,
      total: datum.count, fmt: count_fmt, clippy_warn: count_clippy_warn, clippy_error: count_clippy_error
    };
    nodes.value.push(node);
  }
});

function mergeObjectsWithArrayConcat(result: Kinds, obj: Kinds) {
  for (const [key, value] of Object.entries(obj)) {
    if (result.hasOwnProperty(key)) {
      // 如果键已经存在，则合并数组
      result[key] = result[key].concat(value);
    } else {
      // 否则，添加新的键值对
      result[key] = value;
    }
  }
}

const selectedKey = ref({});
watch(selectedKey, (val) => {
  const key = Object.keys(val)[0];
  if (!key) { return; }
  const idx = parseInt(key);
  for (const node of nodes.value.slice().reverse()) {
    const nd = node.data;
    if (!(nd && nd.user && nd.repo && nd.package)) { return; }

    // 查找是否点击了 package
    if (node.key === key) {
      // 更新 tabs 展示的数据
      const found_pkg = fileTree.value.data.find(datum => {
        return datum.user === nd.user && datum.repo === nd.repo && datum.package === nd.package;
      });
      let kinds = {};
      for (const report of found_pkg?.raw_reports ?? []) {
        mergeObjectsWithArrayConcat(kinds, report.kinds);
      }
      tabs.value = checkerResult(kinds, fileTree.value.kinds_order);
      return;
    } else {
      // 由于 key 是升序的，现在只要找第一个小于目标 key 的 package，那么这个文件就在那里
      if (idx > parseInt(node.key)) {
        for (const file of node.children ?? []) {
          if (file.key === key) {
            const filename = file.data;
            if (!filename) { return []; }
            const package_ = fileTree.value.data.find(datum => {
              return datum.user === nd.user && datum.repo === nd.repo && datum.package === nd.package;
            });
            const found_file = package_?.raw_reports.find(item => item.file === filename);
            if (found_file) {
              tabs.value = checkerResult(found_file.kinds, fileTree.value.kinds_order);
              return;
            }
          }
        }
      }
    }
  }
});

type CheckerResult = {
  kind: string,
  raw: string[],
  lang: string,
  severity: Severity,
  disabled: boolean, // 对于空数组，禁用选项卡
};

enum Severity {
  Danger = "danger",
  Warn = "warn",
  Info = "info",
  Disabled = "secondary",
}

// Kinds 可能不包含全部诊断类别，因此这里填充空数组，并按照顺序排列
function checkerResult(kinds: Kinds, kinds_order: string[]): CheckerResult[] {
  let results = kinds_order.map<CheckerResult>(kind => {
    return { kind, raw: [], lang: "rust", severity: Severity.Disabled, disabled: true };
  });
  for (const [kind, raw] of Object.entries(kinds)) {
    let lang = "rust";
    let severity = Severity.Info;
    switch (kind) {
      case "Clippy(Error)": severity = Severity.Danger; break;
      case "Clippy(Warn)": severity = Severity.Warn; break;
      case "Unformatted": lang = "diff"; break;
      default: ;
    }
    const pos = results.findIndex(r => r.kind === kind);
    if (pos !== -1) {
      // JSON 提供的诊断信息一定不是空数组
      results[pos] = { kind, raw, lang, severity, disabled: false };
    }
  }
  selectedTab.value = results.find(r => !r.disabled)?.kind ?? "";
  return results;
}
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
