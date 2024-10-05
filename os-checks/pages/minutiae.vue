<template>
  <div>
    <DataTable :value="resolved" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" sortMode="multiple" scrollable
      scrollHeight="700px">
      <Column v-for="col of resolvedColumns" :key="col.field" :field="col.field" :header="col.header" sortable />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { type Resolved } from '~/shared/types';

const resolved = ref<Resolved[]>([]);

const resolvedColumns = [
  { field: "pkg", header: "Pkg" },
  { field: "toolchain", header: "Toolchain" },
  { field: "checker", header: "Checker" },
  { field: "target", header: "Target" },
  { field: "cmd", header: "Cmd" },
]

githubFetch<Resolved[]>({ path: "ui/targets/AsyncModules/embassy-priority/resolved.json" })
  .then(data => resolved.value = data);
</script>
