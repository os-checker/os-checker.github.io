<template>
  <div style="margin: 0 8px">
    <div class="filter">
      <div style="display: flex; gap: 10px;">
        <MultiSelect v-model="selected.licenses" display="chip" :options="licenses" filter :maxSelectedLabels="4"
          placeholder="Select License" />
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

      <Column sortable field="license" header="License" :pt="ptColumnCenter" />

      <Column sortable field="homepage" header="Home" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.homepage" :to="data.homepage" target="_blank" class="nav-link">
            <!-- <Button icon="pi pi-external-link" link /> a bug when scrolling -->
            link
          </NuxtLink>
        </template>
      </Column>

      <Column sortable field="open_issues_count" header="Open Issues" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.issues" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/issues`">
            {{ data.open_issues_count ? data.open_issues_count : null }}
          </NuxtLink>
        </template>
      </Column>

      <Column sortable field="description" header="Description" style="max-width: 500px; min-width: 300px" />
      <Column sortable field="created_at" header="Created" :pt="ptColumnCenter" />
      <Column sortable field="pushed_at" header="Updated" :pt="ptColumnCenter" />
      <Column sortable field="active_days" header="Active Days" :pt="ptColumnRight" />
      <Column sortable field="contributions" header="Contri-butions" :pt="ptColumnRight" />
      <Column sortable field="contributors" header="Contri-butors" :pt="ptColumnRight" />

      <Column sortable field="size" header="Size" :pt="ptColumnRight">
        <template #body="{ data }">
          <span :style="{ color: (data.size < 1024) ? color.grey : '' }">
            {{ formatBytes(data.size) }}
          </span>
        </template>
      </Column>

      <Column sortable field="default_branch" header="Default Branch" :pt="ptColumnCenter" />
      <Column sortable field="fork" header="Is this Forked" :pt="ptColumnCenter" />
      <Column sortable field="archived" header="Is this Archived" :pt="ptColumnCenter" />

      <Column sortable field="stargazers" header="Star-gazers" :pt="ptColumnRight" />
      <Column sortable field="subscribers" header="Sub-scribers" :pt="ptColumnRight" />
      <Column sortable field="forks" header="Forks" :pt="ptColumnRight" />
      <Column sortable field="network" header="Net Work" :pt="ptColumnRight" />

      <Column sortable field="discussions" header="Discussions" :pt="ptColumnCenter">
        <template #body="{ data }">
          <NuxtLink v-if="data.discussions" target="_blank" class="nav-link"
            :to="`https://github.com/${data.user}/${data.repo}/discussions`">
            <Button icon="pi pi-external-link" link />
          </NuxtLink>
        </template>
      </Column>

      <Column sortable field="topics" header="Topics" style="min-width: 180px;">
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
import type { Output } from '~/shared/repo';

useHead({ title: 'Repository Information' });

const tableHeight = ref("800px");
onMounted(() => {
  const viewportHeight = window.innerHeight;
  tableHeight.value = `${viewportHeight * 0.8}px`;
  window.addEventListener('resize', () => {
    const viewportHeight = window.innerHeight;
    tableHeight.value = `${viewportHeight * 0.8}px`;
  });
});

const { color } = storeToRefs(useColorStore());

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

const selected = reactive<{
  licenses: string[],
  text: any,
}>({
  licenses: [],
  text: { global: { value: null, matchMode: FilterMatchMode.CONTAINS }, },
});

watch(selected, (sel) => {
  let new_data = repo.value;

  // empty licenses means all licenses
  if (sel.licenses.length !== 0) {
    new_data = new_data.filter(val => sel.licenses.findIndex(x => x === val.license) !== -1);
  }

  data.value = new_data;
});

</script>

<style lang="css" scoped>
.filter {
  display: flex;
  justify-content: space-between;
  margin: 6px 18px;
}
</style>
