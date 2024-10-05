<template>
  <div>
    <div style="padding: 10pt">
      <span class="input">Pkg:</span>
      <Select v-model="selectedPkg" filter showClear :options="pkgs" :optionLabel="(a) => a" />
    </div>

    <MinutiaeTable :data="resolvedFiltered" :dataColumns="resolvedColumns" />

    <MinutiaeTable :data="sources" :dataColumns="sourcesColumns" />
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source, resolvedColumns, sourcesColumns } from '~/shared/target';

const selectedPkg = ref();

const resolved = ref<Resolved[]>([]);
const pkgs = computed(() => {
  const arr = resolved.value.map(val => val.pkg);
  // 使用 Set 去重
  const uniqueArr = [...new Set(arr)];
  // 对数组进行排序
  return uniqueArr.sort();
});
const resolvedFiltered = computed(() => {
  const pkg = selectedPkg.value;
  const all = resolved.value;
  if (pkg) {
    if (all.length === 1) { selectedPkg.value = all[0].pkg; }
    const filtered = all.filter(val => val.pkg === pkg);
    filtered.forEach((_, idx) => filtered[idx].idx = idx + 1);
    return filtered;
  } else {
    return all;
  }
});

githubFetch<Resolved[]>({ path: "ui/targets/AsyncModules/embassy-priority/resolved.json" })
  .then(data => {
    data.forEach((_, idx) => data[idx].idx = idx + 1);
    resolved.value = data
  });

const sources = ref<Source[]>([]);

githubFetch<Source[]>({ path: "ui/targets/AsyncModules/embassy-priority/sources.json" })
  .then(data => sources.value = data);
</script>

<style scoped>
.input {
  font-size: 18px;
  font-weight: bold;
  color: var(--p-button-primary-background);
  padding-right: 10px;
}
</style>
