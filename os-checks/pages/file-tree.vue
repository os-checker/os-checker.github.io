<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';

highlightRust();

type Outputs = string[];
// FIXME: 这里需要找一种可拓展的方式来转换诊断类型，而不是固定的字段（确定后需要更改 database 的 file-tree.jq）
type RawReport = { file: string, count: number, "Unformatted"?: Outputs, "Clippy(Warn)"?: Outputs, "Clippy(Error)"?: Outputs };
type Datum = {
  user: string,
  repo: string,
  package: string,
  count: number,
  raw_reports: RawReport[]
}

const raw_reports = ref<Datum[]>([]);
githubFetch({ repo: "database", path: "ui/file-tree.json" })
  .then((data) => {
    const value: Datum[] = JSON.parse(data as string);
    raw_reports.value = value;
  });

const nodes = ref<TreeNode[]>([]);
const clippyWarn = ref<string[]>([]);
const clippyError = ref<string[]>([]);
const fmt = ref<string[]>([]);
watch(raw_reports, (data) => {
  nodes.value = [];
  clearResult();

  let key = 0;
  for (const datum of data) {
    // 排除检查良好的库（这一步最好在 os-checker 做？）
    if (datum.count === 0) { continue; }

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
      if (report["Unformatted"]) {
        fmt.value.push(...(report["Unformatted"].map(domSanitize)));
        count_fmt += report["Unformatted"].length;
      }
      if (report["Clippy(Warn)"]) {
        clippyWarn.value.push(...(report["Clippy(Warn)"].map(domSanitize)));
        count_clippy_warn += report["Clippy(Warn)"].length;
      }
      if (report["Clippy(Error)"]) {
        clippyError.value.push(...(report["Clippy(Error)"].map(domSanitize)));
        count_clippy_error += report["Clippy(Error)"].length;
      }
    }
    node.data = {
      user: datum.user, repo: datum.repo, package: datum.package,
      total: datum.count, fmt: count_fmt, clippy_warn: count_clippy_warn, clippy_error: count_clippy_error
    };
    nodes.value.push(node);
  }
});

/** 清除用于展示的检查结果 */
function clearResult() {
  fmt.value = [];
  clippyWarn.value = [];
  clippyError.value = [];
}

function updateTabs(data: Datum[]) {
  clearResult();
  for (const datum of data) {
    for (const report of datum.raw_reports) {
      if (report["Unformatted"]) {
        fmt.value.push(...(report["Unformatted"].map(domSanitize)));
      }
      if (report["Clippy(Warn)"]) {
        clippyWarn.value.push(...(report["Clippy(Warn)"].map(domSanitize)));
      }
      if (report["Clippy(Error)"]) {
        clippyError.value.push(...(report["Clippy(Error)"].map(domSanitize)));
      }
    }
  }
}

const selectedKey = ref({});
watch(selectedKey, val => {
  const key = Object.keys(val)[0];
  if (!key) { return; }
  const idx = parseInt(key);
  // console.log(idx);
  for (const node of nodes.value.slice().reverse()) {
    const nd = node.data;
    if (!(nd && nd.user && nd.repo && nd.package)) { return; }

    // 查找是否点击了 package
    if (node.key === key) {
      // 更新 tabs 展示的数据
      const package_ = raw_reports.value.find(datum => {
        return datum.user === nd.user && datum.repo === nd.repo && datum.package === nd.package;
      });
      // console.log(package_);
      if (package_) {
        updateTabs([package_]);
      }
      // node.children?.map(file => file.label);
      return;
    } else {
      // 由于 key 是升序的，现在只要找第一个小于目标 key 的 package，那么这个文件就在那里
      if (idx > parseInt(node.key)) {
        for (const file of node.children ?? []) {
          if (file.key === key) {
            const filename = file.data;
            if (!filename) { return; }
            const package_ = raw_reports.value.find(datum => {
              return datum.user === nd.user && datum.repo === nd.repo && datum.package === nd.package;
            });
            const found_file = package_?.raw_reports.find(item => item.file === filename);
            if (!found_file) { return; }
            if (found_file["Unformatted"]) {
              fmt.value = found_file["Unformatted"].map(domSanitize);
            } else {
              fmt.value = [];
            }
            if (found_file["Clippy(Warn)"]) {
              clippyWarn.value = found_file["Clippy(Warn)"] ?? [].map(domSanitize);
            } else {
              clippyWarn.value = [];
            }
            if (found_file["Clippy(Error)"]) {
              clippyError.value = found_file["Clippy(Error)"] ?? [].map(domSanitize);
            } else {
              clippyError.value = [];
            }
            return;
          }
        }
      }
    }
    // TODO: 查找是否点击某个文件
  }
});

type CheckerResult = {
  value: string,
  title: string,
  snippets: Ref<string[]>,
  lang: string,
  severity: Severity,
};

enum Severity {
  Danger = "danger",
  Warn = "warn",
  Info = "info",
}

const tabs = reactive<CheckerResult[]>([
  { value: "Clippy(Errors)", title: "Clippy(Errors)", snippets: clippyError, lang: "rust", severity: Severity.Danger },
  { value: "Clippy(Warns)", title: "Clippy(Warns)", snippets: clippyWarn, lang: "rust", severity: Severity.Warn },
  { value: "Unformatted", title: "Unformatted", snippets: fmt, lang: "diff", severity: Severity.Info }
]);
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
      <Tabs :value="tabs[0].value" scrollable>
        <TabList>
          <Tab v-for="tab in tabs" :value="tab.value">
            {{ tab.title }}
            <span class="tabBadge">
              <Badge :value="tab.snippets.length" :severity="tab.severity" />
            </span>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="tab in tabs" :value="tab.value">
            <ScrollPanel class="fileViewScroll" :dt="{
              bar: { background: '{primary.color}' },
            }">
              <CodeBlock :snippets="tab.snippets" :lang="tab.lang" />
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
