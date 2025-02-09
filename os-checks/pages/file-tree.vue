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

    <!-- <Button severity="info">{{ fileTree.data.length }}</Button> -->
    <!---->
    <!-- <Print :get="got" :tmp="tmp" :file-tree="fileTree" :tabs="got.tabs" :selected-tab="got.selectedTab" /> -->
    <FileTree2 :get="got" />
  </div>
</template>

<script lang="ts" setup>
import type { FetchError } from 'ofetch';
import Button from 'primevue/button';
import { Severity, type FileTree } from '~/shared/file-tree';
import { checkerResult, getEmpty, mergeObjectsWithArrayConcat, type Get } from '~/shared/file-tree/utils';
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
const tmp = ref("");
// got.value = get(path);
// const got = ref(get(path));

const fileTree = ref<FileTree>(getEmpty().fileTree);

const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);
console.log(user_repo);
const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");
watch(() => ({ user_: selectedUser.value, repo_: selectedRepo.value }),
  ({ user_, repo_ }) => {
    if (user_ && repo_) {
      get(`ui/repos/${user_}/${repo_}/All-Targets.json`);
      // const new_got = get(`ui/repos/${user_}/${repo_}/All-Targets.json`);
      // got.value = new_got;
      tmp.value = `${user_}/${repo_}`;
      // got.fileTree = new_got.fileTree;
      // got.tabs = new_got.tabs;
      // got.selectedTab = new_got.selectedTab;

      // fileTree.value = new_got.fileTree;
      fileTree.value = got.value.fileTree;
      console.log(user_, repo_, got.value);
    }
  }
);

function get(path: string) {
  // basic.init_with_and_subscribe_to_current((target: string) => {
  githubFetch<FileTree>({ path })
    .then((file_tree) => {
      // const file_tree: FileTree = JSON.parse(data as string);

      // 首次打开页面加载数据后，从所有 packags 的原始输出填充到所有选项卡
      let kinds = {};
      for (const datum of file_tree.data) {
        for (const report of datum.raw_reports) {
          // for (const kind of Object.keys(report.kinds)) {
          // 对原始输出中的所有特殊符号转义，以后就不需要转义了
          //   report.kinds[kind] = report.kinds[kind].map(domSanitize);
          // }
          mergeObjectsWithArrayConcat(kinds, report.kinds);
        }
      }
      got.value.tabs = checkerResult(kinds, file_tree.kinds_order).results;
      got.value.selectedTab = got.value.tabs[0]?.kind ?? "";
      got.value.fileTree = file_tree;
    }).catch((_: FetchError) => {
      // 不存在该文件：意味着该目标架构下的所有仓库没有检查出错误
      // 注意，由于使用 parseResponse，这个错误码并不为 404，而是 undefined，
      // 且错误原因为 SyntaxError: Unexpected non-whitespace character after JSON at position 3。
      // 这里 ofetch 没有正确处理错误（貌似也没人报告？），所以暂且认为出现任何网络或解析错误都视为无错误。
      // console.log(err, err.data, err.statusCode);

      got.value.tabs = [{
        kind: "All good! 🥳", raw: ["该目标架构下的所有仓库没有检查出错误 🥳🥳🥳"],
        lang: "rust", severity: Severity.Info, disabled: false
      }];
      got.value.selectedTab = "All good! 🥳";
      got.value.fileTree = getEmpty().fileTree;

      // tabs.value = [{
      //   kind: "Not Exists!", raw: ["该目标架构下，无原始报告数据。"],
      //   lang: "rust", severity: Severity.Danger, disabled: false
      // }];
      // selectedTab.value = "Not Exists!";
      // fileTree.value = { kinds_order: [], data: [] };
    });

  console.log("utils got", got);
}
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
