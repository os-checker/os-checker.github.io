<template>
  <div style="margin: 0 8px">
    <div class="filter">
      <div style="display: flex; gap: 10px;">
        <MultiSelect v-model="selected.licenses" display="chip" :options="licenses" filter :maxSelectedLabels="4"
          placeholder="Select License" />

        <MultiSelect v-model="selected.topics" display="chip" :options="topics" filter :maxSelectedLabels="4"
          placeholder="Select Topics" />

        <MultiSelect v-model="selected.columns" display="chip" :options="columns" :optionLabel="o => Cols.option(o)"
          filter :maxSelectedLabels="4" placeholder="Select Columns" />
      </div>

      <div>
        <IconField>
          <InputIcon> <i class="pi pi-search" /> </InputIcon>
          <InputText style="width: 180px" v-model="selected.text['global'].value" placeholder="Search" />
        </IconField>
      </div>

    </div>

    <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single"
      v-model:selection="selectedRepo" removableSort sortMode="multiple" :multiSortMeta="selected.sorts"
      @update:multiSortMeta="sortsChanged" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"
      v-model:filters="selected.text" :globalFilterFields="['user', 'repo', 'description', 'license', 'topics']">

      <Column frozen field="idx" header="Idx" />
      <Column frozen sortable field="user" header="User" style="min-width: 150px;" />

      <Column frozen sortable field="repo" header="Repo" style="min-width: 180px;">
        <template #body="{ data }">
          <NuxtLink :to="`https://github.com/${data.user}/${data.repo}`" target="_blank" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('license')" sortable field="license" :header="C.name('license')" :pt="ptColumnCenter" />

      <Column v-if="C.display('homepage')" sortable field="homepage" :header="C.name('homepage')" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.homepage" :to="data.homepage" target="_blank" class="nav-link">
            <!-- <Button icon="pi pi-external-link" link /> a bug when scrolling -->
            link
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('open_issues_count')" sortable field="open_issues_count"
        :header="C.name('open_issues_count')" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.issues" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/issues`">
            {{ data.open_issues_count ? data.open_issues_count : null }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('description')" sortable field="description" :header="C.name('description')"
        style="max-width: 500px; min-width: 280px" />
      <Column v-if="C.display('created_at')" sortable field="created_at" :header="C.name('created_at')"
        :pt="ptColumnCenter" />
      <Column v-if="C.display('pushed_at')" sortable field="pushed_at" :header="C.name('pushed_at')"
        :pt="ptColumnCenter" />
      <Column v-if="C.display('active_days')" sortable field="active_days" :header="C.name('active_days')"
        :pt="ptColumnRight" />
      <Column v-if="C.display('contributions')" sortable field="contributions" :header="C.name('contributions')"
        :pt="ptColumnRight" />
      <Column v-if="C.display('contributors')" sortable field="contributors" :header="C.name('contributors')"
        :pt="ptColumnRight" />

      <Column v-if="C.display('size')" sortable field="size" :header="C.name('size')" :pt="ptColumnRight">
        <template #body="{ data }">
          <span :style="{ color: (data.size < 1024) ? color.grey : '' }">
            {{ formatBytes(data.size) }}
          </span>
        </template>
      </Column>

      <Column v-if="C.display('default_branch')" sortable field="default_branch" :header="C.name('default_branch')"
        :pt="ptColumnCenter" />
      <Column v-if="C.display('fork')" sortable field="fork" :header="C.name('fork')" :pt="ptColumnCenter" />
      <Column v-if="C.display('archived')" sortable field="archived" :header="C.name('archived')"
        :pt="ptColumnCenter" />

      <Column v-if="C.display('stargazers')" sortable field="stargazers" :header="C.name('stargazers')"
        :pt="ptColumnRight" />
      <Column v-if="C.display('subscribers')" sortable field="subscribers" :header="C.name('subscribers')"
        :pt="ptColumnRight" />
      <Column v-if="C.display('forks')" sortable field="forks" :header="C.name('forks')" :pt="ptColumnRight" />
      <Column v-if="C.display('network')" sortable field="network" :header="C.name('network')" :pt="ptColumnRight" />

      <Column v-if="C.display('discussions')" sortable field="discussions" :header="C.name('discussions')"
        :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.discussions" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/discussions`">
            <Button icon="pi pi-external-link" link />
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C.display('topics')" sortable field="topics" :header="C.name('topics')" style="min-width: 180px;">
        <template #body="{ data: { topics } }">
          <div v-for="val of topics">
            <Tag severity="info" :value="val" style="margin-bottom: 5px;" />
          </div>
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import type { DataTableSortMeta } from 'primevue/datatable';
import { formatBytes, Cols } from '~/shared/repos';
import type { Output, Repo } from '~/shared/repos';

useHead({ title: 'Repositories Information' });

const { color, viewportHeight } = storeToRefs(useStyleStore());
const tableHeight = computed(() => `${Math.round(viewportHeight.value * 0.8)}px`);

// styling
const ptColumnCenter = ref({
  columnHeaderContent: { style: { "justify-content": "center" } },
  bodyCell: { style: { "text-align": "center" } }
});
const ptColumnRight = ref({
  columnHeaderContent: { style: { "justify-content": "right" } },
  bodyCell: { style: { "text-align": "right" } }
});

const summaries = ref<Output[]>([]);

githubFetch<Output[]>({
  path: "plugin/github-api/info/summaries.json"
}).then(val => {
  summaries.value = val;
});

const repo = computed<Repo[]>(() => {
  return summaries.value.map((val, idx) => {
    const info = val.info;
    return {
      idx: idx + 1,
      user: val.user,
      repo: val.repo,
      license: info.license?.spdx_id ?? null,
      homepage: info.homepage,
      description: info.description,
      created_at: fmtDateTime(info.created_at),
      pushed_at: fmtDateTime(info.pushed_at),
      active_days: val.active_days,
      size: info.size,
      contributions: val.contributions,
      contributors: val.contributors.length,
      open_issues_count: info.open_issues_count,
      stargazers: info.stargazers_count ? info.stargazers_count : null,
      subscribers: info.subscribers_count ? info.subscribers_count : null,
      forks: info.forks_count ? info.forks_count : null,
      network: info.network_count ? info.network_count : null,
      default_branch: info.default_branch,
      fork: info.fork ? "✅" : null,
      archived: info.archived ? "✅" : null,
      issues: info.has_issues,
      discussions: info.has_discussions,
      // wiki: info.has_wiki, // not sure if the value is reliable
      topics: info.topics,
    }
  })
});

const data = ref<Repo[]>([]);
watch(repo, (val) => data.value = val);

const selectedRepo = ref();

const licenses = computed(() => [...new Set(repo.value.map(r => r.license))].sort());
const topics = computed(() => [...new Set(repo.value.map(r => r.topics).flat())].sort());

const C = reactive(new Cols());
C.setDefaultColumns();
const columns = Cols.options();

const selected = reactive<{
  licenses: string[],
  topics: string[],
  columns: string[],
  text: any,
  sorts: DataTableSortMeta[],
}>({
  licenses: [],
  topics: [],
  columns: [],
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
  sorts: [],
});

watch(selected, (sel) => {
  let new_data = repo.value;

  // empty licenses means all licenses
  if (sel.licenses.length !== 0) {
    new_data = new_data.filter(val => sel.licenses.findIndex(x => x === val.license) !== -1);
  }

  if (sel.topics.length !== 0) {
    const set = new Set(sel.topics);
    new_data = new_data.filter(val => val.topics.findIndex(t => set.has(t)) !== -1);
  }

  C.setDisplay(sel.columns);

  data.value = new_data;
});

// DataTableSortMeta = {field, order}
// order: 1 ascending, -1 descending
// e.g. { field: "license", order: 1 }
function sortsChanged(meta?: DataTableSortMeta[] | null) {
  if (meta) {
    selected.sorts = meta;
  }
}

// route query
const route = useRoute();
function updateFilter(query: {
  licenses?: string,
  topics?: string,
  columns?: string,
  text?: string,
  sorts?: string,
}) {
  if (query.licenses) { selected.licenses = decodeURIComponent(query.licenses).split(","); }
  if (query.topics) { selected.topics = decodeURIComponent(query.topics).split(","); }
  if (query.columns) { selected.columns = decodeURIComponent(query.columns).split(","); }

  if (query.text) {
    selected.text.global.value = decodeURIComponent(query.text);
  }

  if (query.sorts) {
    const args = decodeURIComponent(query.sorts).split(",");
    //@ts-ignore
    selected.sorts = args.map(arg => {
      let [field, order] = arg.split("=");
      return { field, order: parseInt(order) };
    });
  }
}
updateFilter(route.query);

const router = useRouter();
watch(selected, (sel) => {
  let query: any = {};
  if (sel.licenses.length !== 0) {
    query.licenses = encodeURIComponent(sel.licenses.join(","));
  }
  if (sel.topics.length !== 0) {
    query.topics = encodeURIComponent(sel.topics.join(","));
  }
  if (sel.columns.length !== 0) {
    query.columns = encodeURIComponent(sel.columns.join(","));
  }
  if (sel.text.global.value) {
    query.text = encodeURIComponent(sel.text.global.value);
  }
  if (sel.sorts.length !== 0) {
    const args = sel.sorts.map(({ field, order }) => order ? `${field}=${order}` : null);
    query.sorts = encodeURIComponent(args.filter(x => x).join(","));
  }

  router.push({ path: route.path, query });
});

</script>

<style lang="css" scoped>
.filter {
  display: flex;
  justify-content: space-between;
  margin: 6px 18px;
}
</style>
