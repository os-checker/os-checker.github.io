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
  fmt.value = ["-a\n+b"];
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
};

const tabs = ref<CheckerResult[]>([
  { value: "Clippy(Errors)", title: "Clippy(Errors)", snippets: clippyError, lang: "rust" },
  { value: "Clippy(Warns)", title: "Clippy(Warns)", snippets: clippyWarn, lang: "rust" },
  { value: "Unformatted", title: "Unformatted", snippets: fmt, lang: "diff" }
const tabs = reactive<CheckerResult[]>([
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

  <Tabs value="Clippy(Errors)">
    <TabList>
      <Tab v-for="tab in tabs" :value="tab.value">{{ tab.title }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel v-for="tab in tabs" :value="tab.value">
        <ScrollPanel style="width: 100%; height: 500px" :dt="{
          bar: {
            background: '{primary.color}'
          }
        }">
          <CodeBlock :snippets="tab.snippets" :lang="tab.lang" />
        </ScrollPanel>
      </TabPanel>
    </TabPanels>
  </Tabs>


</template>
