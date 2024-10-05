<template>
  <div>
    <MinutiaeTable :data="resolved" :dataColumns="resolvedColumns" />

    <MinutiaeTable :data="sources" :dataColumns="sourcesColumns" />
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source, resolvedColumns, sourcesColumns } from '~/shared/target';

const resolved = ref<Resolved[]>([]);

githubFetch<Resolved[]>({ path: "ui/targets/AsyncModules/embassy-priority/resolved.json" })
  .then(data => resolved.value = data);

const sources = ref<Source[]>([]);

githubFetch<Source[]>({ path: "ui/targets/AsyncModules/embassy-priority/sources.json" })
  .then(data => sources.value = data);
</script>
