<template>
  <div style="margin: 0 8px">
    <!-- <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single" -->
    <!--   v-model:selection="selectedPkg" v-model:filters="selected.text" -->
    <!--   :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories']" removableSort sortMode="multiple" -->
    <!--   paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"> -->
    <!---->
    <!-- </DataTable> -->
    <DataTable :value="repo" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single" paginator
      :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]">

      <Column frozen sortable field="idx" header="Idx" />
      <Column frozen sortable field="user" header="User" style="min-width: 150px;" />

      <Column frozen sortable field="repo" header="Repo" style="min-width: 180px;">
        <template #body="{ data }">
          <NuxtLink :to="`https://github.com/${data.user}/${data.repo}`" target="_blank" class="nav-link">
            {{ data.repo }}
          </NuxtLink>
        </template>
      </Column>

      <Column sortable field="license" header="License" :pt="ptColumn" />

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
const ptColumn = ref({
  columnHeaderContent: { style: { "justify-content": "center" } },
  bodyCell: { style: { "text-align": "center" } }
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
