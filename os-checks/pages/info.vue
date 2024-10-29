<template>
  <div>
    <DataTable :value="summaryTable" tableStyle="min-width: 50rem;" scrollable scrollHeight="800px" showGridlines
      selectionMode="single" v-model:selection="selectedPkg" v-model:filters="filters"
      :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories', 'os_categories']" removableSort
      sortMode="multiple" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]">

      <template #header>
        <div style="display: flex; justify-content: center; ">
          <div style="width: 50%">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText style="width: 100%" v-model="filters['global'].value" placeholder="Global Search" />
            </IconField>
          </div>
        </div>
      </template>

      <Column frozen sortable field="idx" header="Idx" />
      <Column frozen sortable field="user" header="User" style="min-width: 150px;" />
      <Column frozen sortable field="repo" header="Repo" style="min-width: 180px;" />
      <Column frozen sortable field="pkg" header="Package" style="min-width: 200px;" />

      <Column sortable field="version" header="Version" style="text-align: center;" />
      <Column sortable field="dependencies" header="Depen-dencies" style="text-align: center;" />

      <Column sortable field="testcases" header="TestCases" style="text-align: center;" />

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
          <Tag v-for="tag of dialogHeader?.pkg.author" severity="info" :value="tag" style="margin-bottom: 5px;"></Tag>
        </div>

        <InfoTestCases :tests="testCases" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Pkg, PkgInfo, Test } from '~/shared/info';
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

const summaryColumns = [
  // { field: "idx", header: "Idx" },
  // { field: "user", header: "User" },
  // { field: "repo", header: "Repo" },
  // { field: "pkg", header: "Package" },
  { field: "version", header: "Version" },
  { field: "dependencies", header: "Depen-dencies" },
  { field: "testcases", header: "TestCases" },
  { field: "tests", header: "Tests" },
  { field: "examples", header: "Examples" },
  { field: "benches", header: "Benches" },
  // { field: "author", header: "Author" },
  // { field: "description", header: "Description" },
  // { field: "categories", header: "Categories" },
  // { field: "os_categories", header: "OS Categories" },
];

const summaryTable = computed(() => {
  const value = summaries.value.map(val => {
    return Object.entries(val.pkgs).map(([name, pkg]) => {
      return {
        idx: 0,
        user: val.user,
        repo: val.repo,
        pkg: name,
        version: pkg.version,
        dependencies: pkg.dependencies || null,
        testcases: pkg.testcases ? pkg.testcases.pkg_tests_count : null,
        tests: pkg.tests || null,
        examples: pkg.examples || null,
        benches: pkg.benches || null,
        author: pkg.author.length === 0 ? null : pkg.author,
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
