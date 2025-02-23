<template>

  <DataTable :value="testcasesFiltered" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single"
    v-model:selection="selectedTest" v-model:filters="selected.text" :multiSortMeta="selected.sorts"
    @update:multiSortMeta="sortsChanged" sortMode="multiple" removableSort paginator :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"
    :globalFilterFields="['user', 'repo', 'pkg', 'kind', 'bin', 'name']">

    <template #empty><b> No testcases found. </b></template>
    <template #header>
      <div style="display: flex; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <DropDownSimple tag="user" :options="options.val.user" v-model="selected.user" showClear />
          <DropDownSimple tag="repo" :options="options.val.repo" v-model="selected.repo" showClear />
          <DropDownSimple tag="pkg" :options="options.val.pkg" v-model="selected.pkg" showClear />
          <DropDownSimple tag="test_pass" :options="options.val.test_pass" v-model="selected.test_pass" showClear />
          <DropDownSimple tag="miri_pass" :options="options.val.miri_pass" v-model="selected.miri_pass" showClear />
          <DropDownSimple tag="miri_timeout" :options="options.val.miri_timeout" v-model="selected.miri_timeout"
            showClear />
        </div>

        <div>
          <IconField>
            <InputIcon> <i class="pi pi-search" /> </InputIcon>
            <InputText style="width: 200px" v-model="selected.text['global'].value" placeholder="Search" />
          </IconField>
        </div>

      </div>
    </template>

    <Column field="idx" header="Idx" :pt="ptColumnCenter" />
    <Column field="user" sortable header="User" style="min-width: 120px;" />
    <Column field="repo" sortable header="Repo" />
    <Column field="pkg" sortable header="Package" />
    <Column field="bin" sortable header="Test Bin" />
    <Column field="kind" sortable header="Kind" :pt="ptColumnCenter" />
    <Column field="name" sortable header="Test Name" />
    <Column field="test_pass" sortable header="Test Pass" :pt="ptColumnCenter" />
    <Column field="test_duration_ms" sortable header="Test (ms)" :pt="ptColumnRight" />
    <Column field="miri_pass" sortable header="Miri Pass" :pt="ptColumnCenter" />
    <Column field="miri_timeout" sortable header="Miri Timed Out" :pt="ptColumnCenter" />

  </DataTable>

  <Dialog v-model:visible="dialogShow" modal :style="{ width: '93%' }">
    <template #header>
      <span style="display: inline-flex; justify-content:center; gap: 40px; font-size: larger; font-weight: bold;">
        <div>
          <NuxtLink :to="`https://github.com/${selectedTest!.user}/${selectedTest!.repo}`" target="_blank">
            <Tag icon="pi pi-github" severity="info" style="font-weight: bold;">
              {{ `${selectedTest!.user} / ${selectedTest!.repo}` }}
            </Tag>
          </NuxtLink>
        </div>

        <div style="margin-top: 3.2px;">Test Name:
          <span style="color: var(--p-rose-500); margin-right: 5px">
            {{ selectedTest!.name }}
          </span>
        </div>
      </span>
    </template>

    <div style="padding: 3px;">
      <b style="margin-right: 5px">Pkg:</b>
      <Tag severity="warn" :value="selectedTest!.pkg" style="margin-right: 6px;" />
      <b style="margin-right: 5px">Test Binary:</b>
      <Tag severity="warn" :value="selectedTest!.bin" style="margin-right: 6px;" />
      <b style="margin-right: 5px">Test Name:</b>
      <Tag severity="warn" :value="selectedTest!.name" style="margin-right: 6px;" />
      <b style="margin-right: 5px">Test Pass:</b>
      {{ selectedTest!.test_pass }}
      <b style="margin-right: 5px">Miri Pass:</b>
      {{ selectedTest!.miri_pass }}
    </div>

    <Accordion value="0">
      <AccordionPanel value="0" v-if="selectedTest?.test_error">
        <AccordionHeader>Test Error</AccordionHeader>
        <AccordionContent>
          <CodeBlock :snippets="selectedTest?.test_error ? [selectedTest.test_error] : []" />
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1" v-if="selectedTest?.miri_output">
        <AccordionHeader>Miri Output</AccordionHeader>
        <AccordionContent>
          <CodeBlock :snippets="selectedTest?.miri_output ? [selectedTest.miri_output] : []" />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

  </Dialog>

</template>

<script setup lang="ts">
import type { DataTableSortMeta } from 'primevue/datatable';
import { FilterMatchMode } from '@primevue/core/api';
import type { PkgInfo } from '~/shared/info';
import { cloneDeep, uniq } from 'es-toolkit/compat';

useHead({ title: 'Test Cases' });

// styling
const { viewportHeight } = storeToRefs(useStyleStore());
const tableHeight = computed(() => `${Math.round(viewportHeight.value * 0.8)}px`);
const ptColumnCenter = ref({
  columnHeaderContent: { style: { "justify-content": "center" } },
  bodyCell: { style: { "text-align": "center" } }
});
const ptColumnRight = ref({
  columnHeaderContent: { style: { "justify-content": "right" } },
  bodyCell: { style: { "text-align": "right" } }
});
highlightRust();

const testcases = ref<TestResult[]>([]);
const testcasesFiltered = ref<TestResult[]>([]);
const selectedTest = ref<TestResult | null>(null);

// pop up details
const dialogShow = ref(false);
watch(selectedTest, sel => dialogShow.value = sel ? true : false);

githubFetch<PkgInfo[]>({
  path: "plugin/cargo/info/summaries.json"
}).then(val => {
  testcases.value = summariesToTestResult(val);
  testcasesFiltered.value = cloneDeep(testcases.value);
});

type TestResult = {
  idx: number,
  user: string,
  repo: string,
  pkg: string,
  bin: string,
  kind: string,
  name: string,
  test_pass: string,
  test_duration_ms: number | null,
  test_error: string | null,
  miri_pass: string,
  miri_output: string | null,
  miri_timeout: string,
};

function summariesToTestResult(pkg_info: PkgInfo[]): TestResult[] {
  let result: TestResult[] = [];
  let idx = 0;

  for (const info of pkg_info) {
    for (const [pkg, value] of Object.entries(info.pkgs)) {
      for (const test of value.testcases?.tests || []) {
        for (const testcase of test.testcases) {
          result.push({
            idx: idx++,
            user: info.user,
            repo: info.repo,
            pkg,
            bin: test.binary_name,
            kind: test.kind,
            name: testcase.name,
            test_pass: testcase.status === "ok" ? "✅" : (testcase.status === "failed" ? "❌" : ""),
            test_duration_ms: testcase.duration_ms,
            test_error: testcase.error,
            miri_pass: testcase.miri_pass ? "✅" : "❌",
            miri_output: testcase.miri_output,
            miri_timeout: testcase.miri_timeout ? "💥" : "",
          });
        }
      }
    }
  }

  return result;
}

function sortsChanged(meta?: DataTableSortMeta[] | null) {
  if (meta) {
    selected.sorts = meta;
  }
}

const selected = reactive<{
  user: string | null,
  repo: string | null,
  pkg: string | null,
  kind: string | null,
  test_pass: string | null,
  miri_pass: string | null,
  miri_timeout: string | null,
  text: any,
  sorts: DataTableSortMeta[],
}>({
  user: null,
  repo: null,
  pkg: null,
  kind: null,
  test_pass: null,
  miri_pass: null,
  miri_timeout: null,
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
  sorts: [],
});

type Options = {
  user: string[],
  repo: string[],
  pkg: string[],
  kind: string[],
  test_pass: string[],
  miri_pass: string[],
  miri_timeout: string[],
};
function defaultOptions(): Options {
  return {
    user: [],
    repo: [],
    pkg: [],
    kind: [],
    test_pass: [],
    miri_pass: [],
    miri_timeout: [],
  };
}
const options = reactive<{ val: Options }>({ val: defaultOptions() });

// init options
watch(testcases, tc => options.val = testcasesToOptions(tc));

// update table when filter selection changes
watch(
  selected,
  ({ user, repo, pkg, kind, test_pass, miri_pass, miri_timeout }) => {
    // for simplicity, the data of testcases are supposed to remain unchanged
    const chosen_testcases = testcases.value.filter(test => {
      let chosen = true;
      if (user) chosen &&= test.user === user;
      if (repo) chosen &&= test.repo === repo;
      if (pkg) chosen &&= test.pkg === pkg;
      if (kind) chosen &&= test.kind === repo;
      if (test_pass) chosen &&= test.test_pass === test_pass;
      if (miri_pass) chosen &&= test.miri_pass === miri_pass;
      if (miri_timeout || miri_timeout === "") chosen &&= test.miri_timeout === miri_timeout;
      return chosen;
    });
    testcasesFiltered.value = chosen_testcases.map((tc, idx) => {
      tc.idx = idx;
      return tc;
    });
    // options.val = testcasesToOptions(chosen_testcases);
  });

function testcasesToOptions(tc: TestResult[]): Options {
  let opts = defaultOptions();
  for (const test of tc) {
    opts.user.push(test.user);
    opts.repo.push(test.repo);
    opts.pkg.push(test.pkg);
    opts.kind.push(test.kind);
    opts.test_pass.push(test.test_pass);
    opts.miri_pass.push(test.miri_pass);
    opts.miri_timeout.push(test.miri_timeout);
  }

  opts.user = uniq(opts.user).sort();
  opts.repo = uniq(opts.repo).sort();
  opts.pkg = uniq(opts.pkg).sort();
  opts.kind = uniq(opts.kind).sort();
  opts.test_pass = uniq(opts.test_pass).sort();
  opts.miri_pass = uniq(opts.miri_pass).sort();
  opts.miri_timeout = uniq(opts.miri_timeout).sort();
  return opts;
}
</script>
