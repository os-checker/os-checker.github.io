<template>
  <div style="margin: 0 8px">
    <!-- <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single" -->
    <!--   v-model:selection="selectedPkg" v-model:filters="selected.text" -->
    <!--   :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories']" removableSort sortMode="multiple" -->
    <!--   paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"> -->
    <!---->
    <!-- </DataTable> -->
    <DataTable :value="repo" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single" removableSort
      sortMode="multiple" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]">

      <Column frozen sortable field="idx" header="Idx" />
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
            <Button icon="pi pi-external-link" link />
          </NuxtLink>
        </template>
      </Column>

      <Column sortable field="description" header="Description" style="max-width: 500px; min-width: 300px" />
      <Column sortable field="created_at" header="Created" :pt="ptColumnCenter" />
      <Column sortable field="pushed_at" header="Updated" :pt="ptColumnCenter" />
      <Column sortable field="active_days" header="Active Days" :pt="ptColumnRight" />
      <Column sortable field="size" header="Size" :pt="ptColumnRight" />
      <Column sortable field="contributions" header="Contri-butions" :pt="ptColumnRight" />
      <Column sortable field="contributors" header="Contri-butors" :pt="ptColumnRight" />

    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { Output } from '~/shared/repo';

const tableHeight = ref("800px");
onMounted(() => {
  const viewportHeight = window.innerHeight;
  tableHeight.value = `${viewportHeight * 0.8}px`;
  window.addEventListener('resize', () => {
    const viewportHeight = window.innerHeight;
    tableHeight.value = `${viewportHeight * 0.8}px`;
  });
});

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

  stargazers: number,
  subscribers: number,
  forks: number,
  network: number,

  default_branch: string,
  fork: boolean,
  archived: boolean,

  issues: string | null,
  discussions: string | null,
  wiki: string | null,
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
      created_at: info.created_at,
      pushed_at: info.pushed_at,
      active_days: val.active_days,
      size: info.size,
      contributions: val.contributions,
      contributors: val.contributors.length,
      open_issues_count: info.open_issues_count,
      stargazers: info.stargazers_count,
      subscribers: info.subscribers_count,
      forks: info.forks_count,
      network: info.network_count,
      default_branch: info.default_branch,
      fork: info.fork,
      archived: info.archived,
      issues: info.has_issues ? `https://github.com/${val.user}/${val.repo}/issues` : null,
      discussions: info.has_discussions ? `https://github.com/${val.user}/${val.repo}/discussions` : null,
      wiki: info.has_wiki ? `https://github.com/${val.user}/${val.repo}/wiki` : null,
      topics: info.topics,
    }
  })
});

</script>
