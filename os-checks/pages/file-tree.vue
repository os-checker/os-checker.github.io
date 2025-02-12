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
          <Select v-model="selectedPkg" filter showClear :options="pkgs.names">
            <template #option="{ option }">
              <Tag severity="danger" class="drop-down-options">{{ pkgs.counts[option] }}</Tag>
              {{ option }}
            </template>

            <template #value="{ value }">
              {{ value || ALL_PKGS }}
              <Tag severity="danger" style="margin-left: 5px">{{ pkgs.counts[value || ALL_PKGS] }}</Tag>
            </template>
          </Select>
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
          <Select v-model="selectedFeatures" filter showClear :options="features" :optionLabel="label" placeholder="" />
        </span>

        <DropDownWithCount v-model="selectedPkg" :all="ALL_PKGS" :counts="pkgs"></DropDownWithCount>
      </div>
    </div>

    <FileTree2 :get="got" :pkg="selectedPkg" />
  </div>
</template>

<script lang="ts" setup>
import type { FetchError } from 'ofetch';
import { Severity, type FileTree } from '~/shared/file-tree';
import { ALL_PKGS, type DropDownOptions } from '~/shared/file-tree/types';
import { checkerResult, getEmpty, mergeObjectsWithArrayConcat, type Get } from '~/shared/file-tree/utils';
import type { UserRepo } from '~/shared/target';
import type { Basic } from '~/shared/types';

useHead({ title: 'Issue File Tree' });
highlightRust();

const label = (a: string) => a;

const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");
const selectedChecker = ref("");
const selectedTarget = ref("");
const selectedFeatures = ref("");

const got = ref<Get>(getEmpty());
const basic = ref<Basic | null>(null);

// Get user/repo list for filters.
const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);

// Init filters.
const users = computed(() => Object.keys(user_repo.value).sort());
watch(users, (val) => selectedUser.value = val[0] ?? "");
const repos = computed(() => user_repo.value[selectedUser.value]);
watch(repos, (val) => selectedRepo.value = val[0] ?? "");

// Update got state.
watch(() => ({ user: selectedUser.value, repo: selectedRepo.value, target: selectedTarget.value }),
  ({ user, repo, target }) => {
    if (user && repo) {
      const target_ = target || "All-Targets";
      get(`ui/repos/${user}/${repo}/${target_}.json`);
      getBasic(`ui/repos/${user}/${repo}/basic.json`);
    }
  }
);

// const pkgs = computed(() => basic.value?.pkgs.map(p => p.pkg) ?? []);
const checkers = computed(() => basic.value?.checkers.map(p => p.checker) ?? []);
const targets = computed(() => basic.value?.targets.map(p => p.triple) ?? []);
const features = computed(() => basic.value?.features_sets.map(p => p.features) ?? []);
const pkgs = computed<DropDownOptions>(() => {
  let counts: { [key: string]: number } = {};
  for (const data of got.value.fileTree.data) {
    const pkg = data.pkg;
    const len = data.raw_reports.reduce((acc, reports) => acc + reports.count, 0);
    // usually if can't be true due to impossible duplicated pkg name
    if (counts[pkg]) counts[pkg] += len;
    else counts[pkg] = len;
  }
  counts[ALL_PKGS] = Object.values(counts).reduce((acc, c) => acc + c, 0);
  // descending sort by count and then name
  const names = Object.entries(counts)
    .sort((a, b) => {
      const cmp_count = b[1] - a[1];
      if (cmp_count === 0) return a[0].localeCompare(b[0]);
      return cmp_count
    })
    .map(ele => ele[0]);
  return { counts, names };
});

watch(pkgs, val => {
  console.log("pkgs:", val);
});
// const checkers = computed(() => basic.value?.checkers.map(p => p.checker) ?? []);
// const targets = computed(() => basic.value?.targets.map(p => p.triple) ?? []);
// const features = computed(() => basic.value?.features_sets.map(p => p.features) ?? []);

// update filetree
// watch(selectedPkg, pkg => {
//   const data = got.value.fileTree.data.filter(node => pkg === "" || pkg === "All-Pkgs" || node.pkg == pkg);
//   got_filtered.value.fileTree.data = data;
// });

// Download raw report JSON. 
// NOTE: this function should mutate got state in the template.
// If the fn is moved to a module file, the state of got will be
// broken. See https://github.com/os-checker/os-checker.github.io/issues/138
function get(path: string) {
  githubFetch<FileTree>({ path })
    .then((file_tree) => {
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
}

function getBasic(path: string) {
  githubFetch<Basic>({ path })
    .then(val => basic.value = val)
    .catch(err => console.log(err))
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

.drop-down-options {
  margin-right: 8px;
  width: 40px;
  justify-content: right;
}
</style>
