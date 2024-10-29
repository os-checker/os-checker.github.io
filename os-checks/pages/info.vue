<template>
  <!-- <TargetTable :data="summaryTable" :dataColumns="summaryColumns" :rowSelect="() => { }" /> -->
  <DataTable :value="summaryTable" tableStyle="min-width: 50rem; margin: 10px 10px;" scrollable scrollHeight="800px"
    showGridlines>
    <!-- <template #header> -->
    <!--     <div style="text-align:left"> -->
    <!--         <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle" -->
    <!--             display="chip" placeholder="Select Columns" /> -->
    <!--     </div> -->
    <!-- </template> -->
    <Column frozen field="idx" header="Idx" />
    <Column frozen field="user" header="User" style="min-width: 150px;" />
    <Column frozen field="repo" header="Repo" style="min-width: 180px;" />
    <Column frozen field="pkg" header="Package" style="min-width: 200px;" />

    <Column field="version" header="Version" style="text-align: center;" />
    <Column field="dependencies" header="Depen-dencies" style="text-align: center;" />
    <Column field="testcases" header="TestCases" style="text-align: center;" />
    <Column field="tests" header="Tests" style="text-align: center;" />
    <Column field="examples" header="Examples" style="text-align: center;" />
    <Column field="benches" header="Benches" style="text-align: center;" />
    <!-- <Column v-for="(col, index) of summaryColumns" :field="col.field" :header="col.header" -->
    <!--   :key="col.field + '_' + index" style="text-align: center;"> -->
    <!-- </Column> -->

    <Column field="categories" header="Categories" style="min-width: 210px;">
      <template #body="{ data: { categories } }">
        <div v-for="tag of categories">
          <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
        </div>
      </template>
    </Column>

    <Column field="os_categories" header="OS Categories">
      <template #body="{ data: { os_categories } }">
        <div v-for="tag of os_categories">
          <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
        </div>
      </template>
    </Column>

    <Column frozen field="description" header="Description" style="min-width: 400px;" />

    <Column field="author" header="Author" style="min-width: 400px;">
      <template #body="{ data: { author } }">
        <div v-for="tag of author">
          <Tag severity="info" :value="tag" style="margin-bottom: 5px;"></Tag>
        </div>
      </template>
    </Column>


  </DataTable>
</template>

<script setup lang="ts">
import type { PkgInfo } from '~/shared/info';

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
  let idx = 0;
  return summaries.value.map(val => {
    return Object.entries(val.pkgs).map(([name, pkg]) => {
      idx += 1;
      return {
        idx,
        user: val.user,
        repo: val.repo,
        pkg: name,
        version: pkg.version,
        dependencies: pkg.dependencies,
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
});


</script>
