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
import type { TestResult, Selection, Options } from '~/shared/testcases';
import { defaultOptions, applySelection, testcasesToOptions, summariesToTestResult } from '~/shared/testcases';

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
  const tc = summariesToTestResult(val);
  testcases.value = tc;
  testcasesFiltered.value = applySelection(tc, selected);
});

function sortsChanged(meta?: DataTableSortMeta[] | null) {
  if (meta) {
    selected.sorts = meta;
  }
}
const selected = reactive<Selection>({
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

const options = reactive<{ val: Options }>({ val: defaultOptions() });

// init options
watch(testcases, tc => options.val = testcasesToOptions(tc));

// update table when filter selection changes
watch(selected, sel => testcasesFiltered.value = applySelection(testcases.value, sel));

// ******************* route query *******************
const route = useRoute();
function updateFilter(query: {
  user?: string,
  repo?: string,
  pkg?: string,
  kind?: string,
  test_pass?: string,
  miri_pass?: string,
  miri_timeout?: string,
  text?: string,
  sorts?: string,
}) {
  const { user, repo, pkg, kind, test_pass, miri_pass, miri_timeout, text, sorts } = query;

  // only support single value for each param
  // FIXME: empty string will not handled
  if (user) selected.user = decodeURIComponent(user);
  if (repo) selected.repo = decodeURIComponent(repo);
  if (pkg) selected.pkg = decodeURIComponent(pkg);
  if (kind) selected.kind = decodeURIComponent(kind);
  if (test_pass) selected.test_pass = decodeURIComponent(test_pass);
  if (miri_pass) selected.miri_pass = decodeURIComponent(miri_pass);
  if (miri_timeout) selected.miri_timeout = decodeURIComponent(miri_timeout);
  if (text) selected.text.global.value = decodeURIComponent(text);

  if (sorts) {
    const args = decodeURIComponent(sorts).split(",");
    //@ts-ignore
    selected.sorts = args.map(arg => {
      let [field, order] = arg.split("=");
      return { field, order: parseInt(order) };
    });
  }
}
updateFilter(route.query);

const router = useRouter();
watch(selected, sel => {
  const { user, repo, pkg, kind, test_pass, miri_pass, miri_timeout, text, sorts } = sel;

  let query: any = {};

  if (user) query.user = encodeURIComponent(user);
  if (repo) query.repo = encodeURIComponent(repo);
  if (pkg) query.pkg = encodeURIComponent(pkg);
  if (kind) query.kind = encodeURIComponent(kind);
  if (test_pass) query.test_pass = encodeURIComponent(test_pass);
  if (miri_pass) query.miri_pass = encodeURIComponent(miri_pass);
  if (miri_timeout) query.miri_timeout = encodeURIComponent(miri_timeout);
  if (text.global.value) query.text = encodeURIComponent(text.global.value);

  if (sorts.length !== 0) {
    const args = sorts.map(({ field, order }) => order ? `${field}=${order}` : null);
    query.sorts = encodeURIComponent(args.filter(x => x).join(","));
  }

  router.push({ path: route.path, query });
});
</script>
