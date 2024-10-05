<template>
  <div class="minutiae">
    <div style="padding: 2px 8px 2px 8px">
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

      <span class="input">Target:</span>
      <span class="select">
        <Select v-model="selectedTarget" filter showClear :options="targets" :optionLabel="label" placeholder="All" />
      </span>
    </div>
    <div style="padding: 2px 8px 12px 8px">
      <span class="input">Toolchain:</span>
      <span class="select">
        <Select v-model="selectedToolchain" filter showClear :options="toolchains" :optionLabel="label"
          placeholder="All" />
      </span>
    </div>

    <MinutiaeTable :data="resolvedFiltered" :dataColumns="resolvedColumns" />

    <div style="height: 20px;" />

    <MinutiaeTable :data="sourcesFiltered" :dataColumns="sourcesColumns" />
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source, type UserRepo, TableKind, tableKinds, resolvedColumns, sourcesColumns } from '~/shared/target';

const label = (a: string) => a;
const selectedKind = ref<TableKind>(TableKind.Resolved);
const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");
const selectedTarget = ref("");
const selectedToolchain = ref("");

const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);

const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");

const resolved = ref<Resolved[]>([]);
const sources = ref<Source[]>([]);
watchEffect(() => {
  const user = selectedUser.value;
  const repo = selectedRepo.value;
  if (user && repo) {
    const path = `ui/targets/${user}/${repo}/`;
    githubFetch<Resolved[]>({ path: path + "resolved.json" })
      .then(data => {
        data.forEach((_, idx) => data[idx].idx = idx + 1);
        resolved.value = data;

        // If there's only one option, default to that;
        // otherwise clear old values.
        const only_one = data.length === 1;
        selectedPkg.value = only_one ? data[0].pkg : "";
        selectedTarget.value = only_one ? data[0].target : "";
        selectedToolchain.value = only_one ? data[0].toolchain : "";
      });

    githubFetch<Source[]>({ path: path + "sources.json" })
      .then(data => {
        data.forEach((_, idx) => data[idx].idx = idx + 1);
        sources.value = data;
      });
  }
});

const resolvedFiltered = computed(() => {
  const pkg = selectedPkg.value;
  const target = selectedTarget.value;
  const all = resolved.value;

  if (!pkg && !target) {
    return all;
  }

  let filtered = all;

  if (pkg) {
    filtered = filtered.filter(val => val.pkg === pkg);
  }

  if (target) {
    filtered = filtered.filter(val => val.target === target);
  }

  filtered.forEach((_, idx) => filtered[idx].idx = idx + 1);
  return filtered;
});

const sourcesFiltered = computed(() => {
  const pkg = selectedPkg.value;
  const target = selectedTarget.value;
  const all = sources.value;

  if (!pkg && !target) {
    return all;
  }

  let filtered = all;

  if (pkg) {
    filtered = filtered.filter(val => val.pkg === pkg);
  }

  if (target) {
    filtered = filtered.filter(val => val.target === target);
  }

  filtered.forEach((_, idx) => filtered[idx].idx = idx + 1);
  return filtered;
});

// 使用 Set 去重，并对数组进行排序
const uniqueArr = (arr: any[]) => [...new Set(arr)].sort();

const pkgs = computed(() => uniqueArr(resolved.value.map(val => val.pkg)));
const targets = computed(() => uniqueArr(resolved.value.map(val => val.target)));
const toolchains = computed(() => uniqueArr(resolved.value.map(val => val.toolchain)));

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
  margin: 0px 4px;
}
</style>
