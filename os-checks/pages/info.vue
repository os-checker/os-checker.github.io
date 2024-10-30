<template>
  <div>
    <DataTable :value="data" tableStyle="min-width: 50rem; margin: 0 5px 0 0;" scrollable scrollHeight="800px"
      showGridlines selectionMode="single" v-model:selection="selectedPkg" v-model:filters="filters"
      :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories', 'os_categories']" removableSort
      sortMode="multiple" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]">

      <template #header>
        <div style="display: flex; justify-content: space-between;">
          <div style="display: flex; gap: 20px;">
            <MultiSelect v-model="selectedCategories" display="chip" :options="categories" filter :maxSelectedLabels="4"
              placeholder="Select Categories" />

            <MultiSelect v-model="selectedOSCategories" display="chip" :options="os_categories" filter
              :maxSelectedLabels="4" placeholder="Select OS Categories" />

            <MultiSelect v-model="selectedAuthors" display="chip" :options="authors" filter :maxSelectedLabels="4"
              placeholder="Select Authors" />

            <MultiSelect v-model="selectedKinds" display="chip" :options="kinds" filter :maxSelectedLabels="4"
              placeholder="Select Crate Kind" />
          </div>

          <div style="width: 30%">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText style="width: 100%" v-model="filters['global'].value"
                placeholder="Search in all text columns" />
            </IconField>
          </div>

        </div>
      </template>

      <Column frozen sortable field="idx" header="Idx" />
      <Column frozen sortable field="user" header="User" style="min-width: 150px;" />

      <Column frozen sortable field="repo" header="Repo" style="min-width: 180px;">
        <template #body="{ data }">
          <NuxtLink :to="`https://github.com/${data.user}/${data.repo}`" target="_blank" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column frozen sortable field="pkg" header="Package" style="min-width: 200px;" />

      <Column sortable field="version" header="Version" style="text-align: center;" />
      <Column sortable field="lib" header="Lib" style="text-align: center;" />
      <Column sortable field="bin" header="Bin" style="text-align: center;" />
      <Column sortable field="dependencies" header="Depen-dencies" style="text-align: center;" />

      <Column sortable field="testcases" header="Test Cases" style="text-align: center;" />

      <Column sortable field="tests" header="Tests" style="text-align: center;" />
      <Column sortable field="examples" header="Examples" style="text-align: center;" />
      <Column sortable field="benches" header="Benches" style="text-align: center;" />

      <Column sortable field="categories" header="Categories" style="min-width: 210px;">
        <template #body="{ data: { categories } }">
          <div v-for="tag of categories">
            <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
          </div>
        </template>
      </Column>

      <Column sortable field="os_categories" header="OS Categories">
        <template #body="{ data: { os_categories } }">
          <div v-for="tag of os_categories">
            <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
          </div>
        </template>
      </Column>

      <Column field="description" header="Description" style="min-width: 400px;" />

      <Column sortable field="author" header="Author" style="min-width: 400px;">
        <template #body="{ data: { author } }">
          <div v-for="tag of author">
            <Tag severity="info" :value="tag" style="margin-bottom: 5px;"></Tag>
          </div>
        </template>
      </Column>

    </DataTable>

    <Dialog v-model:visible="dialogShow" modal :style="{ width: '70%' }">
      <template #header>
        <span style="display: inline-flex; justify-content: center; gap: 40px; font-size: larger; font-weight: bold;">
          <div>
            <NuxtLink :to="dialogHeader?.repo_url" target="_blank">
              <Tag icon="pi pi-github" severity="info" style="font-weight: bold;">
                {{ dialogHeader?.repo }}
              </Tag>
            </NuxtLink>
          </div>

          <div>Test Cases of package
            <span style="color: var(--p-emerald-500); margin-right: 5px;">{{ dialogHeader?.pkg_name }}</span>
          </div>
        </span>
      </template>

      <div>
        <div class="dialog-header">
          Description: <b style="color: var(--p-emerald-500)">{{ dialogHeader?.pkg.description }}</b>
        </div>
        <div class="dialog-header">
          Categories:
          <Tag v-for="tag of dialogHeader?.pkg.categories" severity="warn" :value="tag" style="margin-right: 6px;" />
        </div>
        <div class="dialog-header">
          OS Categories:
          <Tag v-for="tag of dialogHeader?.pkg.os_categories" severity="warn" :value="tag" style="margin-right: 6px;" />
        </div>
        <div class="dialog-header">
          Authors:
          <Tag v-for="tag of dialogHeader?.pkg.authors" severity="info" :value="tag" style="margin-right: 6px;"></Tag>
        </div>

        <InfoTestCases :tests="testCases" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Pkg, PkgInfo, Test } from '~/shared/info';
import { unique_field, unique_field_bool } from '~/shared/info';
import { FilterMatchMode } from '@primevue/core/api';

// interactive filter/search inputs
const filters = ref<any>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const summaries = ref<PkgInfo[]>([]);

githubFetch<PkgInfo[]>({
  path: "plugin/cargo/info/summaries.json"
}).then(val => {
  summaries.value = val;
});

const summaryTable = computed<SummaryTable[]>(() => {
  const value = summaries.value.map(val => {
    return Object.entries(val.pkgs).map(([name, pkg]) => {
      return {
        idx: 0,
        user: val.user,
        repo: val.repo,
        pkg: name,
        version: pkg.version,
        lib: pkg.lib ? "✅" : null,
        bin: pkg.bin ? "✅" : null,
        dependencies: pkg.dependencies || null,
        testcases: pkg.testcases ? pkg.testcases.pkg_tests_count : null,
        tests: pkg.tests || null,
        examples: pkg.examples || null,
        benches: pkg.benches || null,
        author: pkg.authors.length === 0 ? null : pkg.authors,
        description: pkg.description,
        categories: pkg.categories.length === 0 ? null : pkg.categories,
        os_categories: pkg.os_categories.length === 0 ? null : pkg.os_categories,
      }
    })
  }).flat();

  return value.sort((a, b) => {
    const a_test = a.testcases ?? 0;
    const b_test = b.testcases ?? 0;
    if (a_test < b_test) {
      return 1;
    } else if (a_test > b_test) {
      return -1;
    } else if (a.user < b.user) {
      return -1;
    } else if (a.user > b.user) {
      return 1;
    } else if (a.repo < b.repo) {
      return -1;
    } else if (a.repo > b.repo) {
      return 1;
    } else if (a.pkg < b.pkg) {
      return -1;
    } else if (a.pkg > b.pkg) {
      return 1;
    }
    return 0;
  }).map((val, idx) => {
    val.idx = idx + 1;
    return val;
  });
});

type SummaryTable = {
  idx: number; user: string; repo: string; pkg: string; version: string;
  lib: string | null; bin: string | null; dependencies: number | null; testcases: number | null;
  tests: number | null; examples: number | null; benches: number | null;
  author: string[] | null; description: string; categories: string[] | null; os_categories: string[] | null;
};
const data = ref<SummaryTable[]>([]);
watch(summaryTable, (val) => data.value = val);

const categories = computed(() => unique_field(summaries.value, pkg => pkg.categories));
const os_categories = computed(() => unique_field(summaries.value, pkg => pkg.os_categories));
const authors = computed(() => unique_field(summaries.value, pkg => pkg.authors));
const kinds = computed(() => {
  const val = summaries.value;
  const is_lib = unique_field_bool(val, pkg => pkg.lib);
  const is_bin = unique_field_bool(val, pkg => pkg.bin);
  const is_testcases = unique_field_bool(val, pkg => pkg.testcases?.pkg_tests_count ? true : false);
  const is_tests = unique_field_bool(val, pkg => pkg.tests > 0);
  const is_examples = unique_field_bool(val, pkg => pkg.examples > 0);
  const is_benches = unique_field_bool(val, pkg => pkg.benches > 0);

  let arr = [];
  if (is_lib) { arr.push("Lib"); }
  if (is_bin) { arr.push("Bin"); }
  if (is_testcases) { arr.push("TestCases"); }
  if (is_tests) { arr.push("Tests"); }
  if (is_examples) { arr.push("Examples"); }
  if (is_benches) { arr.push("Benches"); }
  return arr;
});
const selectedCategories = ref<string[]>([]);
const selectedOSCategories = ref<string[]>([]);
const selectedKinds = ref<string[]>([]);
const selectedAuthors = ref<string[]>([]);
watchEffect(() => {
  const cat = selectedCategories.value;
  const os_cat = selectedOSCategories.value;
  const au = selectedAuthors.value;
  const ks = selectedKinds.value;

  const is_empty_cat = cat.length === 0;
  const is_empty_os_cat = os_cat.length === 0;
  const is_empty_au = au.length === 0;
  const is_empty_k = ks.length === 0;

  // reset
  if (is_empty_cat && is_empty_os_cat && is_empty_au && is_empty_k) {
    data.value = summaryTable.value;
    return;
  }

  data.value = summaryTable.value.filter(val => {
    const find_cat = cat.find(c => val.categories?.find(vc => vc === c));
    const find_os_cat = os_cat.find(o => val.os_categories?.find(vo => vo === o));
    const find_au = au.find(a => val.author?.find(va => va === a));
    let find_k = true;
    for (const k of ks) {
      switch (k) {
        case "Lib": { find_k &&= val.lib === '✅'; continue; };
        case "Bin": { find_k &&= val.bin === '✅'; continue; };
        case "TestCases": { find_k &&= val.testcases ? true : false; continue; };
        case "Tests": { find_k &&= val.tests ? true : false; continue; };
        case "Examples": { find_k &&= val.examples ? true : false; continue; };
        case "Benches": { find_k &&= val.benches ? true : false; continue; };
        default: ;
      }
    }

    return (is_empty_cat ? true : find_cat) && (is_empty_os_cat ? true : find_os_cat)
      && (is_empty_au ? true : find_au) && (is_empty_k ? true : find_k);
  }).map((x, idx) => {
    x.idx = idx + 1;
    return x;
  });
});

const dialogShow = ref(false);
const dialogHeader = ref<{ repo: string, repo_url: string, pkg_name: string, pkg: Pkg } | null>();
const testCases = ref<Test[]>([]);

type SelectedRow = { user: string, repo: string, pkg: string, testcases: number };
const selectedPkg = ref<SelectedRow | null>(null);
watch(selectedPkg, val => {

  if (!val?.testcases) { return; }

  // for now, pop up a dialog to display testcases only if any 
  dialogShow.value = true;

  const pkg = summaries.value
    .find(summary => summary.user === val.user && summary.repo === val.repo)
    ?.pkgs[val.pkg];

  if (!pkg?.testcases) { return; }

  const repo = `${val.user}/${val.repo}`;
  const repo_url = `https://github.com/${repo}`;
  dialogHeader.value = { repo, repo_url, pkg_name: val.pkg, pkg };

  testCases.value = pkg.testcases.tests;
});


</script>

<style lang="css">
.dialog-header {
  margin-bottom: 10px;
}
</style>
