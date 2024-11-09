<template>
  <div>
    <!-- <DataTable :value="data" scrollable :scrollHeight="tableHeight" showGridlines selectionMode="single" -->
    <!--   v-model:selection="selectedPkg" v-model:filters="selected.text" -->
    <!--   :globalFilterFields="['user', 'repo', 'pkg', 'description', 'categories']" removableSort sortMode="multiple" -->
    <!--   paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"> -->
    <!---->
    <!-- </DataTable> -->
    {{ summaries }}
  </div>
</template>

<script setup lang="ts">
import type { Info } from '~/shared/repo';

const summaries = ref<Info[]>([]);

githubFetch<Info[]>({
  path: "plugin/github-api/info/summaries.json"
}).then(val => {
  summaries.value = val;
});

</script>
