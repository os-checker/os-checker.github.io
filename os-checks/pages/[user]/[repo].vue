<script setup lang="ts">
import DOMPurify from 'dompurify';

highlightRust();

type RawReports = [number, { fmt: Clippy, clippy_warn: Clippy, clippy_error: Clippy }];

const raw_reports = ref<RawReports[]>([]);
githubFetch({ branch: "raw-reports", path: "os-checks/public/test_raw_reports.json" })
  .then(({ data }) => raw_reports.value = JSON.parse(data.value as string));

type Clippy = { [key: string]: string[] };
const clippyWarn = ref<string[]>([]);
const clippyError = ref<string[]>([]);
const fmt = ref<string[]>([]);
watch(raw_reports, (reports) => {
  if (!reports) { return; }
  fmt.value = [];
  clippyWarn.value = [];
  clippyError.value = [];

  // 对 <>&"' 之类的符号进行转义，否则 highlightjs 出现 One of your code blocks
  // includes unescaped HTML. This is a potentially serious security risk.
  const f = (s: string) => DOMPurify.sanitize(s);

  for (const report of reports) {
    const fmts = report[1]?.fmt;
    for (const file in fmts) {
      fmt.value.push(...(fmts[file].map(f)));
    }

    const warns = report[1]?.clippy_warn;
    for (const file in warns) {
      clippyWarn.value.push(...(warns[file].map(f)));
    }

    const errors = report[1]?.clippy_error;
    for (const file in errors) {
      clippyError.value.push(...(errors[file].map(f)));
    }
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
  <!---->
  <!-- <ScrollPanel style="width: 100%; height: 200px" :dt="{ -->
  <!--   bar: { -->
  <!--     background: '{primary.color}' -->
  <!--   } -->
  <!-- }"> -->
  <!---->
  <!--   <CodeBlock :snippets="clippyWarn" /> -->
  <!---->
  <!-- </ScrollPanel> -->
  <!---->
  <!-- <ScrollPanel style="width: 100%; height: 200px" :dt="{ -->
  <!--   bar: { -->
  <!--     background: '{primary.color}' -->
  <!--   } -->
  <!-- }"> -->
  <!---->
  <!--   <CodeBlock :snippets="clippyError" /> -->
  <!---->
  <!-- </ScrollPanel> -->
  <!---->
  <!-- <ScrollPanel style="width: 100%; height: 200px" :dt="{ -->
  <!--   bar: { -->
  <!--     background: '{primary.color}' -->
  <!--   } -->
  <!-- }"> -->
  <!---->
  <!--   <CodeBlock :snippets="fmt" lang="diff" /> -->
  <!---->
  <!-- </ScrollPanel> -->

  <!-- <nav> -->
  <!--   <NuxtLink to="/">Go Home</NuxtLink> -->
  <!-- </nav> -->
  <!-- <p>{{ $route.params.user }} / {{ $route.params.repo }}</p> -->
  <!-- <div>fullPath = {{ $route.fullPath }}</div> -->
  <div class="fileViewPanel">

    <div class="fileViewNavi">
      <NavigationBreadcrumb />
    </div>

    <div class="fileViewResult">
      <Tabs :value="tabs[0].value" scrollable>
        <TabList style="height: 10vh;">
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
  flex: 0 0 10%;
  /* flex-grow, flex-shrink, flex-basis */
  /* 左边div不扩展也不收缩，基础宽度为10% */
}

.fileViewResult {
  flex: 1;
  overflow-x: auto;
  /* 右边div占据剩余空间 */
  /* 可以省略flex-grow为1，因为默认值就是1 */
}

.fileViewScroll {
  width: 100%;
  height: 86vh;
}
</style>
