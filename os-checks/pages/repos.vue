<template>
  <div style="margin: 0 8px">
    <div class="filter">
      <div style="display: flex; gap: 10px;">
        <MultiSelect v-model="selected.licenses" display="chip" :options="licenses" filter :maxSelectedLabels="4"
          placeholder="Select License" />

        <MultiSelect v-model="selected.topics" display="chip" :options="topics" filter :maxSelectedLabels="4"
          placeholder="Select Topics" />

        <MultiSelect v-model="selected.columns" display="chip" :options="columns" filter :maxSelectedLabels="4"
          placeholder="Select Columns" />
      </div>

      <div>
        <IconField>
          <InputIcon> <i class="pi pi-search" /> </InputIcon>
          <InputText style="width: 180px" v-model="selected.text['global'].value" placeholder="Search" />
        </IconField>
      </div>

    </div>

    <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single"
      v-model:selection="selectedRepo" removableSort sortMode="multiple" paginator :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]" v-model:filters="selected.text"
      :globalFilterFields="['user', 'repo', 'description', 'license', 'topics']">

      <Column frozen field="idx" header="Idx" />
      <Column frozen sortable field="user" header="User" style="min-width: 150px;" />

      <Column frozen sortable field="repo" header="Repo" style="min-width: 180px;">
        <template #body="{ data }">
          <NuxtLink :to="`https://github.com/${data.user}/${data.repo}`" target="_blank" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C['License']" sortable field="license" header="License" :pt="ptColumnCenter" />

      <Column v-if="C['Home']" sortable field="homepage" header="Home" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.homepage" :to="data.homepage" target="_blank" class="nav-link">
            <!-- <Button icon="pi pi-external-link" link /> a bug when scrolling -->
            link
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C['Open Issues']" sortable field="open_issues_count" header="Open Issues" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.issues" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/issues`">
            {{ data.open_issues_count ? data.open_issues_count : null }}
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C['Description']" sortable field="description" header="Description"
        style="max-width: 500px; min-width: 280px" />
      <Column v-if="C['Created']" sortable field="created_at" header="Created" :pt="ptColumnCenter" />
      <Column v-if="C['Updated']" sortable field="pushed_at" header="Updated" :pt="ptColumnCenter" />
      <Column v-if="C['Active Days']" sortable field="active_days" header="Active Days" :pt="ptColumnRight" />
      <Column v-if="C['Contri-butions']" sortable field="contributions" header="Contri-butions" :pt="ptColumnRight" />
      <Column v-if="C['Contri-butors']" sortable field="contributors" header="Contri-butors" :pt="ptColumnRight" />

      <Column v-if="C['Size']" sortable field="size" header="Size" :pt="ptColumnRight">
        <template #body="{ data }">
          <span :style="{ color: (data.size < 1024) ? color.grey : '' }">
            {{ formatBytes(data.size) }}
          </span>
        </template>
      </Column>

      <Column v-if="C['Default Branch']" sortable field="default_branch" header="Default Branch" :pt="ptColumnCenter" />
      <Column v-if="C['Is This Forked']" sortable field="fork" header="Is This Forked" :pt="ptColumnCenter" />
      <Column v-if="C['Is This Archived']" sortable field="archived" header="Is This Archived" :pt="ptColumnCenter" />

      <Column v-if="C['Star-gazers']" sortable field="stargazers" header="Star-gazers" :pt="ptColumnRight" />
      <Column v-if="C['Sub-scribers']" sortable field="subscribers" header="Sub-scribers" :pt="ptColumnRight" />
      <Column v-if="C['Forks']" sortable field="forks" header="Forks" :pt="ptColumnRight" />
      <Column v-if="C['Net Work']" sortable field="network" header="Net Work" :pt="ptColumnRight" />

      <Column v-if="C['Discussions']" sortable field="discussions" header="Discussions" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.discussions" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/discussions`">
            <Button icon="pi pi-external-link" link />
          </NuxtLink>
        </template>
      </Column>

      <Column v-if="C['Topics']" sortable field="topics" header="Topics" style="min-width: 180px;">
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
import type { Output } from '~/shared/repos';

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

type Repo = {
  idx: number,
  user: string,
  repo: string,

  license: string | null,
  homepage: string | null,
  description: string | null,
  created_at: string,
  pushed_at: string,

  active_days: number,
  size: number,
  contributions: number,
  contributors: number,
  open_issues_count: number,

  stargazers: number | null,
  subscribers: number | null,
  forks: number | null,
  network: number | null,

  default_branch: string,
  fork: string | null,
  archived: string | null,

  issues: boolean,
  discussions: boolean,
  // wiki: boolean,
  topics: string[],
}

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

function formatBytes(bytes: number, decimals = 0) {
  if (bytes === 0) { return '0 B'; }

  const k = 1024; // 1KB = 1024 bytes
  const dm = decimals < 0 ? 0 : decimals; // 小数位数
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const selectedRepo = ref();

const licenses = computed(() => [...new Set(repo.value.map(r => r.license))].sort());
const topics = computed(() => [...new Set(repo.value.map(r => r.topics).flat())].sort());

const columns = ref([
  "[Columns] Full", "[Columns] Default (Slimmed)", "License", "Home", "Open Issues", "Description", "Created", "Updated",
  "Active Days", "Contri-butions", "Contri-butors", "Size", "Default Branch",
  "Is This Forked", "Is This Archived", "Star-gazers", "Sub-scribers",
  "Forks", "Net Work", "Discussions", "Topics"
]);

const C = reactive<{ [key: string]: boolean }>({
  "License": false, "Home": false, "Open Issues": false, "Description": false, "Created": false, "Updated": false,
  "Active Days": false, "Contri-butions": false, "Contri-butors": false, "Size": false, "Default Branch": false,
  "Is This Forked": false, "Is This Archived": false, "Star-gazers": false, "Sub-scribers": false,
  "Forks": false, "Net Work": false, "Discussions": false, "Topics": false
});

const defaultColumns = new Set([
  "License", "Home", "Description", "Updated",
  "Active Days", "Contri-butions", "Contri-butors", "Size",
]);
function setDefaultColumns() {
  for (const col of Object.keys(C)) {
    C[col] = defaultColumns.has(col);
  }
}
setDefaultColumns();

const selected = reactive<{
  licenses: string[],
  topics: string[],
  columns: string[],
  text: any,
}>({
  licenses: [],
  topics: [],
  columns: [],
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
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

  if (sel.columns.length === 0) {
    setDefaultColumns();
    return;
  }

  if (sel.columns.findIndex(c => c === "[Columns] Full") !== -1) {
    // display all columns 
    for (const col of Object.keys(C)) {
      C[col] = true;
    }
    return;
  }

  const default_columns = (sel.columns.findIndex(c => c === "[Columns] Default (Slimmed)") !== -1) ?
    [...defaultColumns] : [];
  const set = new Set([...sel.columns, ...default_columns]);

  for (const col of Object.keys(C)) {
    C[col] = set.has(col);
  }

  data.value = new_data;
});

// route query
const route = useRoute();
function updateFilter(query: {
  licenses?: string,
  topics?: string,
  columns?: string,
  text?: string,
}) {
  if (query.licenses) { selected.licenses = decodeURIComponent(query.licenses).split(","); }
  if (query.topics) { selected.topics = decodeURIComponent(query.topics).split(","); }
  if (query.columns) { selected.columns = decodeURIComponent(query.columns).split(","); }

  if (query.text) {
    selected.text.global.value = decodeURIComponent(query.text);
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
