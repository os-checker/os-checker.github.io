<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import DOMPurify from 'dompurify';

highlightRust();

type Outputs = string[];
type RawReport = { file: string, count: number, fmt: Outputs, clippy_warn: Outputs, clippy_error: Outputs };
type Datum = {
  user: string,
  repo: string,
  package: string,
  raw_reports: RawReport[]
}

const raw_reports = ref<Datum[]>([]);
githubFetch({ branch: "raw-reports", path: "os-checks/public/test_raw_reports.json" })
  .then(({ data }) => raw_reports.value = JSON.parse(data.value as string));

const items = ref<MenuItem[]>([]);
const clippyWarn = ref<string[]>([]);
const clippyError = ref<string[]>([]);
const fmt = ref<string[]>([]);
watch(raw_reports, (data) => {
  items.value = [];
  fmt.value = [];
  clippyWarn.value = [];
  clippyError.value = [];

  // 对 <>&"' 之类的符号进行转义，否则 highlightjs 出现 One of your code blocks
  // includes unescaped HTML. This is a potentially serious security risk.
  const f = (s: string) => DOMPurify.sanitize(s);

  for (const datum of data) {
    const count = datum.raw_reports.map(r => r.count).reduce((acc, val) => acc + val, 0);
    let item: MenuItem | null = null;
    // 排除检查良好的库（这一步最好在 os-checker 做？）
    if (count !== 0) {
      item = { label: `[${count}] ${datum.repo} #${datum.package}`, items: [] };
    }
    for (const report of datum.raw_reports) {
      item?.items?.push({ label: report.file, icon: "pi pi-file" });
      fmt.value.push(...(report.fmt.map(f)));
      clippyWarn.value.push(...(report.clippy_warn.map(f)));
      clippyError.value.push(...(report.clippy_error.map(f)));
    }
    item && items.value.push(item);
  }
  console.log(`${JSON.stringify(items)}`);
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
      <NavigationBreadcrumb />
      <ScrollPanel class="fileViewMenu">
        <PackageFileMenu style="padding-right: 0.8rem;" :items="items" />
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
  --p-badge-padding: 0;
  --p-badge-font-size: smaller;
  --p-badge-height: 0.8rem;
  --p-badge-min-width: 1.3rem;
}

.fileViewPanel {
  display: flex;
}

.fileViewNavi {
  flex: 0 0 20%;
  padding-left: 0.25rem;
  padding-right: 0.5rem;
  /* flex-grow, flex-shrink, flex-basis */
  /* 左边div不扩展也不收缩，基础宽度为10% */
}

.fileViewMenu {
  flex: 1;
  height: 90vh;
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
  height: 90vh;
}
</style>
