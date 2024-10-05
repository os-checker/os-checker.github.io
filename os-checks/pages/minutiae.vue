<template>
  <div>
    <DataTable :value="resolved" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" sortMode="multiple" scrollable
      scrollHeight="400px">
      <Column v-for="col of resolvedColumns" :key="col.field" :field="col.field" :header="col.header" sortable />
    </DataTable>

    <DataTable :value="sources" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]" sortMode="multiple" scrollable
      scrollHeight="400px">
      <Column v-for="col of sourcesColumns" :key="col.field" :field="col.field" :header="col.header" sortable />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source } from '~/shared/types';

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

const sources = ref<Source[]>([]);

const sourcesColumns = [
  { field: "pkg", header: "Pkg" },
  { field: "target", header: "Target" },
  { field: "src", header: "Src" },
  { field: "path", header: "Path" },
  { field: "used", header: "Used" },
  { field: "specified", header: "Specified" },
]

githubFetch<Source[]>({ path: "ui/targets/AsyncModules/embassy-priority/sources.json" })
  .then(data => sources.value = data);
</script>
