<template>
  <div style="margin: 0 8px">
    <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single"
      v-model:selection="selectedPkg" v-model:filters="selected.text" :multiSortMeta="selected.sorts"
      @update:multiSortMeta="sortsChanged" sortMode="multiple" removableSort paginator :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"
      :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories', 'keywords', 'authors']">

      <template #header>
        <div style="display: flex; justify-content: space-between;">
          <div style="display: flex; gap: 10px;">
            <MultiSelect v-model="selected.categories" display="chip" :options="categories" filter
              :maxSelectedLabels="4" placeholder="Select Categories" />

            <MultiSelect v-model="selected.keywords" display="chip" :options="keywords" filter :maxSelectedLabels="4"
              placeholder="Select Keywords" />

            <MultiSelect v-model="selected.authors" display="chip" :options="authors" filter :maxSelectedLabels="4"
              placeholder="Select Authors" />

            <MultiSelect v-model="selected.kinds" display="chip" :options="kinds" filter :maxSelectedLabels="4"
              placeholder="Select Crate Kinds" />

            <MultiSelect v-model="selected.columns" display="chip" :options="columns" :optionLabel="o => C.option(o)"
              filter :maxSelectedLabels="4" placeholder="Select Columns" />
          </div>

          <div>
            <IconField>
              <InputIcon> <i class="pi pi-search" /> </InputIcon>
              <InputText style="width: 120px" v-model="selected.text['global'].value" placeholder="Search" />
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

      <Column v-if="C.display('last_commit_time')" sortable field="last_commit_time"
        :header="C.name('last_commit_time')" style="text-align: center;" />

      <Column v-if="C.display('version')" sortable field="version" :header="C.name('version')"
        style="text-align: center;" />

      <Column v-if="C.display('release_count')" sortable field="release_count" :header="C.name('release_count')"
        style="text-align: center;">
        <template #body="{ data }">
          <NuxtLink :to="`https://crates.io/crates/${data.pkg}`" target="_blank" class="nav-link">
            {{ data.release_count }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('last_release_time')" sortable field="last_release_time"
        :header="C.name('last_release_time')" style="text-align: center; min-width: 120px;" />

      <Column v-if="C.display('last_release_size')" sortable field="last_release_size"
        :header="C.name('last_release_size')" style="text-align: center" />

      <Column v-if="C.display('diag_total_count')" sortable field="diag_total_count"
        :header="C.name('diag_total_count')" style="text-align: center;">
        <template #body="{ data }">
          <NuxtLink :to="`/${data.user}/${data.repo}`" target="_blank" class="nav-link">
            {{ data.diag_total_count }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('testcases')" sortable field="testcases" :header="C.name('testcases')"
        style="text-align: center; font-weight: bold">
        <template #body="{ data }">
          <span :style="{ color: data.testcases_color }">
            {{ data.testcases }}
          </span>
        </template>
      </Column>

      <Column v-if="C.display('lib')" sortable field="lib" :header="C.name('lib')" style="text-align: center;" />
      <Column v-if="C.display('bin')" sortable field="bin" :header="C.name('bin')" style="text-align: center;" />
      <Column v-if="C.display('dependencies')" sortable field="dependencies" :header="C.name('dependencies')"
        style="text-align: center;" />

      <Column v-if="C.display('tests')" sortable field="tests" :header="C.name('tests')" style="text-align: center;" />
      <Column v-if="C.display('examples')" sortable field="examples" :header="C.name('examples')"
        style="text-align: center;" />
      <Column v-if="C.display('benches')" sortable field="benches" :header="C.name('benches')"
        style="text-align: center;" />

      <Column v-if="C.display('documentation')" field="documentation" :header="C.name('documentation')"
        style="text-align: center;">
        <template #body="{ data }">
          <NuxtLink v-if="data.documentation" :to="data.documentation" target="_blank" class="nav-link">
            link
            <!-- <Button icon="pi pi-external-link" link /> -->
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('latest_doc')" field="latest_doc" :header="C.name('latest_doc')"
        style="text-align: center;">
        <template #body="{ data }">
          <NuxtLink v-if="data.latest_doc" :to="data.latest_doc" target="_blank" class="nav-link">
            link
            <!-- <Button icon="pi pi-external-link" link /> -->
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('homepage')" field="homepage" :header="C.name('homepage')" style="text-align: center;">
        <template #body="{ data }">
          <NuxtLink v-if="data.homepage" :to="data.homepage" target="_blank" class="nav-link">
            link
            <!-- <Button icon="pi pi-external-link" link /> -->
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('categories')" sortable field="categories" :header="C.name('categories')"
        style="min-width: 200px;">
        <template #body="{ data: { categories } }">
          <div v-for="tag of categories">
            <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
          </div>
        </template>
      </Column>

      <Column v-if="C.display('keywords')" sortable field="keywords" :header="C.name('keywords')"
        style="min-width: 150px;">
        <template #body="{ data: { keywords } }">
          <div v-for="tag of keywords">
            <Tag severity="warn" :value="tag" style="margin-bottom: 5px;"></Tag>
          </div>
        </template>
      </Column>

      <Column v-if="C.display('description')" field="description" :header="C.name('description')"
        style="min-width: 280px;" />

      <Column v-if="C.display('authors')" sortable field="authors" :header="C.name('authors')"
        style="min-width: 300px;">
        <template #body="{ data: { authors } }">
          <div v-for="tag of authors">
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
        <div v-if="dialogHeader?.pkg.description">
          <b style="margin-right: 5px">Description:</b>
          <b style="color: var(--p-emerald-500)">{{ dialogHeader?.pkg.description }}</b>
        </div>
        <div v-if="dialogHeader?.pkg.documentation || dialogHeader?.latest_doc || dialogHeader?.pkg.homepage"
          style="display: flex; gap: 10px; margin-right: 5px; font-weight: bold">
          <div v-if="dialogHeader?.pkg.documentation">
            Doc:
            <NuxtLink :to="dialogHeader?.pkg.documentation" target="_blank" class="nav-link">
              <Button icon="pi pi-external-link" link />
            </NuxtLink>
          </div>
          <div v-if="dialogHeader?.latest_doc">
            Latest Doc:
            <NuxtLink :to="dialogHeader?.latest_doc" target="_blank" class="nav-link">
              <Button icon="pi pi-external-link" link />
            </NuxtLink>
          </div>
          <div v-if="dialogHeader?.pkg.homepage">
            Home Page:
            <NuxtLink :to="dialogHeader?.pkg.homepage" target="_blank" class="nav-link">
              <Button icon="pi pi-external-link" link />
            </NuxtLink>
          </div>
        </div>
        <div v-if="dialogHeader?.pkg.categories.length !== 0" class="dialog-header">
          <b style="margin-right: 5px">Categories:</b>
          <Tag v-for="tag of dialogHeader?.pkg.categories" severity="warn" :value="tag" style="margin-right: 6px;" />
        </div>
        <div v-if="dialogHeader?.pkg.keywords.length !== 0" class="dialog-header">
          <b style="margin-right: 5px">KeyWords:</b>
          <Tag v-for="tag of dialogHeader?.pkg.keywords" severity="warn" :value="tag" style="margin-right: 6px;" />
        </div>
        <div v-if="dialogHeader?.pkg.authors.length !== 0" class="dialog-header">
          <b style="margin-right: 5px">Authors:</b>
          <Tag v-for="tag of dialogHeader?.pkg.authors" severity="info" :value="tag" style="margin-right: 6px;"></Tag>
        </div>
        <div v-if="dialogHeader?.testcase_count !== 0" class="dialog-header">
          <b style="margin-right: 5px">Test Cases:</b>
          Duration: {{ dialogHeader?.testcase_ms }}ms,
          Total: {{ dialogHeader?.testcase_count }},

          <span v-if="dialogHeader?.testcase_failed === 0" :style="{ color: color.green, 'font-weight': 'bold' }">
            All passed!
          </span>
          <span v-else :style="{ color: color.red, 'font-weight': 'bold' }">
            Failed
            ({{ Math.round(100 * (dialogHeader?.testcase_failed ?? 0) / (dialogHeader?.testcase_count ?? 0)) }}%)
            : {{ dialogHeader?.testcase_failed }}
          </span>
        </div>

        <InfoTestCases :tests="testCases" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Pkg, PkgInfo, Test } from '~/shared/info';
import { unique_field, unique_field_bool, InfoCols } from '~/shared/info';
import { formatBytes } from '~/shared/columns-select';
import { FilterMatchMode } from '@primevue/core/api';
import type { DataTableSortMeta } from 'primevue/datatable';

const { color, viewportHeight } = storeToRefs(useStyleStore());
const tableHeight = computed(() => `${Math.round(viewportHeight.value * 0.8)}px`);

const summaries = ref<PkgInfo[]>([]);

githubFetch<PkgInfo[]>({
  path: "plugin/cargo/info/summaries.json"
}).then(val => {
  summaries.value = val;
});

// 需要构建期间设置了 DOCS_URL 环境变量，它指向 rustdoc 仓库的部署地址，来构造 docs.json 地址。
function defaultDocs(): string {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.public.docs_url || "https://os-checker.github.io/docs";
  return url.replace(/\/$/, "") + "/docs.json";
}
const docs_json_url = defaultDocs();
const docs = ref();
$fetch(docs_json_url).then(val => docs.value = val);

const summaryTable = computed<SummaryTable[]>(() => {
  const value = summaries.value.map(val => {
    return Object.entries(val.pkgs ?? {}).map(([name, pkg]) => {
      let testcases_color = null;
      if (pkg.testcases?.pkg_tests_count) {
        if (pkg.testcases?.failed === 0) {
          testcases_color = color.value.green;
        } else {
          testcases_color = color.value.red;
        }
      }
      return {
        idx: 0,
        user: val.user,
        repo: val.repo,
        pkg: name,
        last_commit_time: fmtDateTime(pkg.last_commit_time),
        version: pkg.version,
        release_count: pkg.release_count,
        last_release_time: fmtDateTime(pkg.last_release_time),
        last_release_size: pkg.last_release_size ? formatBytes(pkg.last_release_size) : null,
        diag_total_count: pkg.diag_total_count,
        testcases: pkg.testcases?.pkg_tests_count ?? null,
        testcases_color,
        lib: pkg.lib ? "✅" : null,
        bin: pkg.bin ? "✅" : null,
        dependencies: pkg.dependencies || null,
        tests: pkg.tests || null,
        examples: pkg.examples || null,
        benches: pkg.benches || null,
        documentation: pkg.documentation,
        latest_doc: docs.value?.[val.user]?.[val.repo]?.[name] ?? null,
        readme: pkg.readme,
        homepage: pkg.homepage,
        categories: pkg.categories.length === 0 ? null : pkg.categories,
        keywords: pkg.keywords.length === 0 ? null : pkg.keywords,
        description: pkg.description,
        authors: pkg.authors.length === 0 ? null : pkg.authors,
      }
    })
  }).flat();

  return value.sort((a, b) => {
    const a_time = a.last_commit_time;
    const b_time = b.last_commit_time;
    if (a_time < b_time) {
      return 1;
    } else if (a_time > b_time) {
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
  lib: string | null; bin: string | null; dependencies: number | null; testcases: number | null; testcases_color: string | null;
  tests: number | null; examples: number | null; benches: number | null; keywords: string[] | null;
  authors: string[] | null; description: string; categories: string[] | null;
  documentation: string | null; readme: string | null; homepage: string | null; latest_doc: string | null;
  diag_total_count: number | null; last_commit_time: string; release_count: number | null;
  last_release_size: string | null; last_release_time: string;
};
const data = ref<SummaryTable[]>([]);
watch(summaryTable, (val) => data.value = val);

const categories = computed(() => unique_field(summaries.value, pkg => pkg.categories));
const keywords = computed(() => unique_field(summaries.value, pkg => pkg.keywords));
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

const C = reactive(InfoCols.init());
C.setDefaultColumns();
const columns = C.options();

const selected = reactive<{
  categories: string[],
  keywords: string[],
  authors: string[],
  kinds: string[],
  text: any,
  columns: string[],
  sorts: DataTableSortMeta[],
}>({
  categories: [], keywords: [], authors: [], kinds: [],
  // interactive filter/search inputs
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
  // columns to be displayed
  columns: [],
  sorts: [],
});

watch(() => selected.columns, (cols) => {
  C.setDisplay(cols);
});

watchEffect(() => {
  const cat = selected.categories;
  const keywords = selected.keywords;
  const au = selected.authors;
  const ks = selected.kinds;

  const is_empty_cat = cat.length === 0;
  const is_empty_keywords = keywords.length === 0;
  const is_empty_au = au.length === 0;
  const is_empty_k = ks.length === 0;

  // reset
  if (is_empty_cat && is_empty_keywords && is_empty_au && is_empty_k) {
    data.value = summaryTable.value;
    return;
  }

  data.value = summaryTable.value.filter(val => {
    const find_cat = cat.find(c => val.categories?.find(vc => vc === c));
    const find_keywords = keywords.find(k => val.keywords?.find(kw => kw === k));
    const find_au = au.find(a => val.authors?.find(va => va === a));
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

    return (is_empty_cat ? true : find_cat)
      && (is_empty_keywords ? true : find_keywords)
      && (is_empty_au ? true : find_au) && (is_empty_k ? true : find_k);
  }).map((x, idx) => {
    x.idx = idx + 1;
    return x;
  });
});

function sortsChanged(meta?: DataTableSortMeta[] | null) {
  if (meta) {
    selected.sorts = meta;
  }
}

const dialogShow = ref(false);
const dialogHeader = ref<{
  repo: string, repo_url: string, pkg_name: string, pkg: Pkg, latest_doc: string | null,
  testcase_count: number, testcase_failed: number, testcase_ms: number,
} | null>();
const testCases = ref<Test[]>([]);

type SelectedRow = { user: string, repo: string, pkg: string, latest_doc: string | null };
const selectedPkg = ref<SelectedRow | null>(null);
watch(selectedPkg, val => {
  // for now, pop up a dialog to display testcases only if any 
  dialogShow.value = true;

  if (!val) { return; }

  const pkg = summaries.value
    .find(summary => summary.user === val.user && summary.repo === val.repo)
    ?.pkgs?.[val.pkg];

  if (!pkg) { return; }

  const repo = `${val.user}/${val.repo}`;
  const repo_url = `https://github.com/${repo}`;

  dialogHeader.value = {
    repo, repo_url, pkg_name: val.pkg, pkg, latest_doc: val.latest_doc,
    testcase_count: pkg.testcases?.pkg_tests_count ?? 0,
    testcase_failed: pkg.testcases?.failed ?? 0,
    testcase_ms: pkg.testcases?.duration_ms ?? 0,
  };

  testCases.value = pkg.testcases?.tests ?? [];
});

const route = useRoute();
function updateFilter(query: {
  categories?: string,
  keywords?: string,
  authors?: string,
  kinds?: string,
  text?: string,
  columns?: string,
  sorts?: string,
}) {
  const { categories, keywords, authors, kinds, text, columns, sorts } = query;

  if (categories) { selected.categories = decodeURIComponent(categories).split(","); }
  if (keywords) { selected.keywords = decodeURIComponent(keywords).split(","); }
  if (authors) { selected.authors = decodeURIComponent(authors).split(","); }

  if (kinds) {
    const filter = new Set([
      "Lib", "Bin", "TestCases", "Tests", "Examples", "Benches"
    ]);
    selected.kinds = decodeURIComponent(kinds).split(",").filter(k => filter.has(k));
  }

  if (text) { selected.text.global.value = decodeURIComponent(text); }
  if (columns) { selected.columns = decodeURIComponent(columns).split(","); }

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
watchEffect(() => {
  const { categories, keywords, authors, kinds, text, columns, sorts } = selected;

  let query: any = {};

  if (categories.length !== 0) { query.categories = encodeURIComponent(categories.join(",")); }
  if (keywords.length !== 0) { query.keywords = encodeURIComponent(keywords.join(",")); }

  if (authors.length !== 0) {
    // FIXME: what if author string contains `,`
    query.authors = encodeURIComponent(authors.join(","));
  }

  if (kinds.length !== 0) { query.kinds = encodeURIComponent(kinds.join(",")); }
  if (text.global.value) { query.text = encodeURIComponent(text.global.value); }
  if (columns.length !== 0) { query.columns = encodeURIComponent(columns.join(",")); }

  if (sorts.length !== 0) {
    const args = sorts.map(({ field, order }) => order ? `${field}=${order}` : null);
    query.sorts = encodeURIComponent(args.filter(x => x).join(","));
  }

  router.push({ path: route.path, query });
});

useHead({ title: 'Packages Information' });
</script>

<style lang="css">
.dialog-header {
  margin-bottom: 10px;
}
</style>
