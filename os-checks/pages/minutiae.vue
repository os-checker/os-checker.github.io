<template>
  <div class="minutiae">
    <div style="padding: 10pt">
      <span class="input">Kind:</span>
      <span class="select">
        <SelectButton v-model="selectedKind" :options="tableKinds" :allowEmpty="false" />
      </span>

      <span class="input">User:</span>
      <span class="select">
        <Select v-model="selectedUser" filter :options="users" :optionLabel="label" />
      </span>

      <span class="input">Repo:</span>
      <span class="select">
        <Select v-model="selectedRepo" filter :options="repos" :optionLabel="label" />
      </span>

      <span class="input">Pkg:</span>
      <span class="select">
        <Select v-model="selectedPkg" filter showClear :options="pkgs" :optionLabel="label" placeholder="All" />
      </span>
    </div>

    <MinutiaeTable :data="resolvedFiltered" :dataColumns="resolvedColumns" />

    <MinutiaeTable :data="sources" :dataColumns="sourcesColumns" />
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source, type UserRepo, TableKind, tableKinds, resolvedColumns, sourcesColumns } from '~/shared/target';

const label = (a: string) => a;
const selectedKind = ref<TableKind>(TableKind.Resolved);
const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");

const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);

const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");

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

watchEffect(() => {
  const user = selectedUser.value;
  const repo = selectedRepo.value;
  if (user && repo) {
    const path = `ui/targets/${user}/${repo}/resolved.json`;
    githubFetch<Resolved[]>({ path })
      .then(data => {
        data.forEach((_, idx) => data[idx].idx = idx + 1);
        resolved.value = data
      });

    // Clear other selected values, otherwise no results shown.
    selectedPkg.value = "";
  }
})

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

.select {
  padding-right: 10px;
}

.minutiae {
  --p-togglebutton-checked-color: var(--p-button-primary-background);
}
</style>
