<template>
  <div>
    <div>
      <div style="padding: 6px 8px 6px 8px">
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

        <span class="input">Checker:</span>
        <span class="select">
          <Select v-model="selectedChecker" filter showClear :options="checkers" :optionLabel="label"
            placeholder="All" />
        </span>
      </div>

      <div style="padding: 2px 8px 10px 8px">
        <span class="input">Target:</span>
        <span class="select">
          <Select v-model="selectedTarget" filter showClear :options="targets" :optionLabel="label" placeholder="All" />
        </span>

        <span class="input">Features:</span>
        <span class="select">
          <Select v-model="selectedFeatures" filter showClear :options="features" :optionLabel="label"
            placeholder="All" />
        </span>
      </div>
    </div>

    <Print :get="got"></Print>
    <FileTree2 :get="got" />
  </div>
</template>

<script lang="ts" setup>
import { get, getEmpty, type Get } from '~/shared/file-tree/utils';
import type { UserRepo } from '~/shared/target';

useHead({ title: 'Issue File Tree' });
highlightRust();

const label = (a: string) => a;

const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");
const selectedChecker = ref("");
const selectedTarget = ref("");
const selectedFeatures = ref("");

// const users = ref([]);
// const repos = ref([]);
const pkgs = ref([]);
const checkers = ref([]);
const targets = ref([]);
const features = ref([]);

// const path = ref(`ui/repos/Azure-stars/elf_parser_rs/All-Targets.json`);
const got = ref<Get>(getEmpty());
// got.value = get(path);
// const got = ref(get(path));


const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);
console.log(user_repo);
const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");
watchEffect(() => {
  const user_ = selectedUser.value;
  const repo_ = selectedRepo.value;
  if (user_ && repo_) {
    const new_got = get(`ui/repos/${user_}/${repo_}/All-Targets.json`);
    got.value = new_got;
    // got.fileTree = new_got.fileTree;
    // got.tabs = new_got.tabs;
    // got.selectedTab = new_got.selectedTab;
    console.log(user_, repo_, got.value, new_got);
  }
});
</script>

<style scoped>
.input {
  font-size: 14.5px;
  font-weight: bold;
  padding-right: 10px;
  color: var(--p-button-primary-background);
}

.select {
  padding-right: 10px;
}

.resolved-table {
  --p-datatable-header-cell-color: var(--p-button-primary-background);
}

.sources {
  color: var(--p-orange-400);
}

.sources-table {
  --p-datatable-header-cell-color: var(--p-orange-400);
}
</style>
