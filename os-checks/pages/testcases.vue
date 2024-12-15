<template>

  <DataTable :value="testcases" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single"
    v-model:selection="selectedTest" v-model:filters="selected.text" :multiSortMeta="selected.sorts"
    @update:multiSortMeta="sortsChanged" sortMode="multiple" removableSort paginator :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"
    :globalFilterFields="['user', 'repo', 'pkg', 'kind', 'bin', 'name']">

    <template #empty><b> No testcases found. </b></template>
    <template #header>
      <div style="display: flex; justify-content: space-between;">
        <div style="display: flex; gap: 10px;">
          <!-- <MultiSelect v-model="selected.categories" display="chip" :options="categories" filter :maxSelectedLabels="4" -->
          <!--   placeholder="Select Categories" /> -->
        </div>

        <div>
          <IconField>
            <InputIcon> <i class="pi pi-search" /> </InputIcon>
            <InputText style="width: 300px" v-model="selected.text['global'].value" placeholder="Search" />
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

</template>

<script setup lang="ts">
import type { DataTableSortMeta } from 'primevue/datatable';
import { FilterMatchMode } from '@primevue/core/api';
import type { PkgInfo } from '~/shared/info';

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

const testcases = ref<TestResult[]>([]);
const selectedTest = ref<TestResult | null>(null);

githubFetch<PkgInfo[]>({
  path: "plugin/cargo/info/summaries.json"
}).then(val => {
  testcases.value = summariesToTestResult(val);
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
  text: any,
  sorts: DataTableSortMeta[],
}>({
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
  sorts: [],
});

</script>
