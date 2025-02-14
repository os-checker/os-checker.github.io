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

        <DropDownWithCount v-model="selectedPkg" tag="Pkg" :all="ALL_PKGS" :counts="pkgs" />
        <DropDownWithCount v-model="selectedChecker" tag="Checker" :all="ALL_CHECKERS" :counts="checkers" />
        <DropDownWithCount v-model="selectedKind" tag="Kind" :all="ALL_KINDS" :counts="kinds" />

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
      </div>
    </div>

    <FileTree2 :get="got2" :pkg="selectedPkg" />
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'es-toolkit/compat';
import type { FetchError } from 'ofetch';
import { Severity, type FileTree, type Kinds } from '~/shared/file-tree';
import { Dropdown, gen_map } from '~/shared/file-tree/dropdown';
import { ALL_PKGS, ALL_CHECKERS, type DropDownOptions, type Counts, counts_to_options, emptyOptions, ALL_KINDS } from '~/shared/file-tree/types';
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
const selectedKind = ref("");
const selectedTarget = ref("");
const selectedFeatures = ref("");

const got = ref<Get>(getEmpty());
const got2 = ref<Get>(getEmpty());
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

const pkgs = ref(emptyOptions());
const kinds = ref(emptyOptions());
const checkers = ref(emptyOptions());
watch(() => ({ g: got.value, g2: got2.value, b: basic.value }), ({ g, g2, b }) => {
  if (!b) return;

  const dropdown = new Dropdown(g, gen_map(b));
  const dropdown_new = dropdown.filter(g2);

  pkgs.value = cloneDeep(dropdown_new.pkgs);
  kinds.value = cloneDeep(dropdown_new.kinds);
  checkers.value = cloneDeep(dropdown_new.checkers);
}, { deep: true });

// const pkgs = computed(() => basic.value?.pkgs.map(p => p.pkg) ?? []);
// const checkers = computed(() => basic.value?.checkers.map(p => p.checker) ?? []);
const targets = computed(() => basic.value?.targets.map(p => p.triple) ?? []);
const features = computed(() => basic.value?.features_sets.map(p => p.features) ?? []);

watch(selectedPkg, pkg => {
  if (pkg === null || pkg === ALL_PKGS) got2.value = cloneDeep(got.value);
  else Dropdown.update_by_pkg(pkg, got.value, got2.value);
});
watch(selectedKind, kind => {
  if (kind === null || kind === ALL_KINDS) got2.value = cloneDeep(got.value);
  else Dropdown.update_by_kind(kind, got.value, got2.value);
});
watch(selectedChecker, checker => {
  if (checker === null || checker === ALL_CHECKERS) got2.value = cloneDeep(got.value);
  else {
    const ck_kinds = basic.value?.kinds.mapping[checker];
    if (!ck_kinds) return;
    Dropdown.update_by_checker(ck_kinds, got.value, got2.value);
  }
});

// const kinds = computed<DropDownOptions>(() => {
//   let counts: Counts = {};
//   for (const ft of got2.value.fileTree.data) {
//     for (const report of ft.raw_reports) {
//       for (const [kind, arr] of Object.entries(report.kinds)) {
//         let len = arr.length;
//         if (counts[kind]) counts[kind] += len;
//         else counts[kind] = len;
//       }
//     }
//   }
//   return counts_to_options(counts, ALL_KINDS);
// });

// const kind_checker_map = computed(() => {
//   const data = basic.value;
//   if (!data) return {};
//
//   // {"checker": ["kind1", "kind2"]} => {"kind1": "checker", "kind2": "checker"}
//   let kind_checker_map: { [key: string]: string } = {};
//   for (const [ck, kinds] of Object.entries(data.kinds.mapping)) {
//     for (const kind of kinds) {
//       kind_checker_map[kind] = ck;
//     }
//   }
//   return kind_checker_map;
// })

// const checkers = computed<DropDownOptions>(() => {
//   let counts: Counts = {};
//   for (const [kind, count] of Object.entries(kinds.value.counts)) {
//     const ck = kind_checker_map.value[kind];
//     if (!ck) continue;
//     if (counts[ck]) counts[ck] += count;
//     else counts[ck] = count;
//   }
//   return counts_to_options(counts, ALL_CHECKERS);
// });
//
// function filter_kinds(kinds: string[]): Get {
//   const kinds_set = new Set(kinds);
//   // deep copy due to got shouldn't be mutated
//   const g = cloneDeep(got.value);
//   for (const data of g.fileTree.data) {
//     const reports = data.raw_reports;
//     for (const r of reports) {
//       let kinds_new: Kinds = {};
//       let len = 0;
//       for (const [kind, arr] of Object.entries(r.kinds)) {
//         if (kinds_set.has(kind)) {
//           kinds_new[kind] = arr;
//           len += arr.length;
//         }
//       }
//       // filter ck kinds only
//       r.kinds = kinds_new;
//       r.count = len;
//     }
//     // remove count==0 items and sort
//     data.raw_reports = reports.filter(r => r.count !== 0).sort((a, b) => (b.count - a.count));
//     data.count = data.raw_reports.reduce((acc, r) => acc + r.count, 0);
//   }
//   g.fileTree.data = g.fileTree.data.filter(d => d.count !== 0);
//   return g;
// }

// watch(
//   () => ({ pkg: selectedPkg.value, ck: selectedChecker.value, kind: selectedKind.value }),
//   ({ pkg, ck, kind }) => {
//     let got2_new = null;
//     let pkgs_new = null;
//     if (ck === null || ck === ALL_CHECKERS) {
//       // reset
//       const g = cloneDeep(got.value);
//       got2_new = g;
//       pkgs_new = compute_pkgs(g);
//     } else {
//       const ck_kinds = basic.value?.kinds.mapping[ck];
//       if (ck_kinds) {
//         const g = filter_kinds(ck_kinds);
//         got2_new = g;
//         pkgs_new = compute_pkgs(g);
//       }
//     }
//
//     if (kind === null || kind === ALL_KINDS) {
//       // reset
//       const g = cloneDeep(got.value);
//       got2_new = g;
//       pkgs_new = compute_pkgs(g);
//     } else {
//       const g = filter_kinds([kind]);
//       got2_new = g;
//       pkgs_new = compute_pkgs(g);
//     }
//
//     if (got2_new) got2.value = got2_new;
//     if (pkgs_new) pkgs.value = pkgs_new;
//   }
// );

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
      got2.value = cloneDeep(got.value);
      // pkgs.value = compute_pkgs(got2.value);
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
      got2.value = cloneDeep(got.value);

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

<!-- FIXME: remove these -->
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
