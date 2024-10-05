<template>
  <div class="minutiae">
    <div style="padding: 2px 8px 6px 8px">
      <!-- <span class="input">Kind:</span> -->
      <!-- <span class="select"> -->
      <!--   <SelectButton v-model="selectedKind" :options="tableKinds" :allowEmpty="false" /> -->
      <!-- </span> -->

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

      <span class="input">Checker:</span>
      <span class="select">
        <Select v-model="selectedChecker" filter showClear :options="checkers" :optionLabel="label" placeholder="All" />
      </span>
    </div>
    <div style="padding: 2px 8px 8px 8px">
      <span class="input">Toolchain:</span>
      <span class="select">
        <Select v-model="selectedToolchain" filter showClear :options="toolchains" :optionLabel="label"
          placeholder="All" />
      </span>

      <span class="sources">Target (Sources):</span>
      <span class="select">
        <Select v-model="selectedTargetSource" filter showClear :options="targets_src" :optionLabel="label"
          placeholder="All" />
      </span>

      <span class="sources">Sources:</span>
      <span class="select">
        <Select v-model="selectedSource" filter showClear :options="sources_" :optionLabel="label" placeholder="All" />
      </span>

      <span class="sources">Used:</span>
      <span class="select">
        <Select v-model="selectedUsed" filter showClear :options="used_src" :optionLabel="label" placeholder="All" />
      </span>

      <span class="sources">Specified:</span>
      <span class="select">
        <Select v-model="selectedSpecified" filter showClear :options="specified_src" :optionLabel="label"
          placeholder="All" />
      </span>
    </div>

    <MinutiaeTable :data="resolvedFiltered" :dataColumns="resolvedColumns" />

    <div style="height: 10px;" />

    <MinutiaeTable :data="sourcesFiltered" :dataColumns="sourcesColumns" />
  </div>
</template>

<script lang="ts" setup>
import { type Resolved, type Source, type Source2, type UserRepo, resolvedColumns, sourcesColumns } from '~/shared/target';

const label = (a: string) => a;
// const selectedKind = ref<TableKind>(TableKind.Resolved);
const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");
const selectedTarget = ref("");
const selectedToolchain = ref("");
const selectedChecker = ref("");
const selectedTargetSource = ref("");
const selectedSource = ref("");
const selectedUsed = ref("");
const selectedSpecified = ref("");

const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);

const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");

const resolved = ref<Resolved[]>([]);
const sources = ref<Source2[]>([]);
watchEffect(() => {
  const user = selectedUser.value;
  const repo = selectedRepo.value;
  if (user && repo) {
    const path = `ui/targets/${user}/${repo}/`;
    githubFetch<Resolved[]>({ path: path + "resolved.json" })
      .then(data => {
        data.forEach((_, idx) => data[idx].idx = idx + 1);
        resolved.value = data;
      });

    githubFetch<Source[]>({ path: path + "sources.json" })
      .then(data => {
        sources.value = data.map((ele, idx) => {
          const u_s = { used: ele.used ? "✅" : "❌", specified: ele.specified ? "✅" : "❌" };
          return { idx: idx + 1, ...ele, ...u_s };
        });
      });
  }
});

const resolvedFiltered = computed(() => {
  const pkg = selectedPkg.value;
  const target = selectedTarget.value;
  const target_src = selectedTargetSource.value;
  const toolchain = selectedToolchain.value;
  const checker = selectedChecker.value;
  let filtered = resolved.value;

  if (pkg) { filtered = filtered.filter(val => val.pkg === pkg); }
  if (target) { filtered = filtered.filter(val => val.target === target); }
  if (target_src) { filtered = filtered.filter(val => val.target === target_src); }
  if (toolchain) { filtered = filtered.filter(val => val.toolchain === toolchain); }
  if (checker) { filtered = filtered.filter(val => val.checker === checker); }

  filtered.forEach((_, idx) => filtered[idx].idx = idx + 1);
  return filtered;
});

const sourcesFiltered = computed(() => {
  const pkg = selectedPkg.value;
  const target = selectedTarget.value;
  const target_src = selectedTargetSource.value;
  const src = selectedSource.value;
  const used = selectedUsed.value;
  const specified = selectedSpecified.value;
  let filtered = sources.value;

  if (pkg) { filtered = filtered.filter(val => val.pkg === pkg); }
  if (target) { filtered = filtered.filter(val => val.target === target); }
  if (target_src) { filtered = filtered.filter(val => val.target === target_src); }
  if (src) { filtered = filtered.filter(val => val.src === src); }
  if (used) { filtered = filtered.filter(val => val.used === used); }
  if (specified) { filtered = filtered.filter(val => val.specified === specified); }

  filtered.forEach((_, idx) => filtered[idx].idx = idx + 1);
  return filtered;
});

// 使用 Set 去重，并对数组进行排序
function uniqueArr(v: any[], selected: any) {
  const arr = [...new Set(v)].sort();
  selected.value = (arr.length === 1) ? arr[0] : "";
  return arr;
}

const pkgs = computed(() => uniqueArr(resolved.value.map(val => val.pkg), selectedPkg));
const targets = computed(() => uniqueArr(resolved.value.map(val => val.target), selectedTarget));
const toolchains = computed(() => uniqueArr(resolved.value.map(val => val.toolchain), selectedToolchain));
const checkers = computed(() => uniqueArr(resolved.value.map(val => val.checker), selectedChecker));

const targets_src = computed(() => uniqueArr(sources.value.map(val => val.target), selectedTargetSource));
const sources_ = computed(() => uniqueArr(sources.value.map(val => val.src), selectedSource));
const used_src = computed(() => uniqueArr(sources.value.map(val => val.used), selectedUsed));
const specified_src = computed(() => uniqueArr(sources.value.map(val => val.specified), selectedSpecified));

</script>

<style scoped>
.input {
  font-size: 18px;
  font-weight: bold;
  color: var(--p-button-primary-background);
  padding-right: 10px;
}

.sources {
  font-size: 18px;
  font-weight: bold;
  color: var(--p-orange-400);
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
