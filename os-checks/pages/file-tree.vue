<template>
  <div>
    <div style="display: flex">
      <div style="max-width: 10%; display: grid; place-items: center; padding: 0px 20px;">
        <div>
          <b>Count</b><br>
          <Button style="margin-top: 5px;" severity="contrast" v-if="count">{{ count }}</Button>
        </div>
      </div>

      <div style="flex:1">
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
            <Select v-model="selectedTarget" filter showClear :options="targets" :optionLabel="label"
              placeholder="All" />
          </span>

          <span class="input">Features:</span>
          <span class="select">
            <Select v-model="selectedFeatures" filter showClear :options="features" :optionLabel="label"
              placeholder="" />
          </span>

        </div>
      </div>

    </div>

    <FileTree2 :get="got2" :pkg="selectedPkg" />
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'es-toolkit/compat';
import type { FetchError } from 'ofetch';
import { Severity, type FileTree } from '~/shared/file-tree';
import { Dropdown, gen_map } from '~/shared/file-tree/dropdown';
import { ALL_PKGS, ALL_CHECKERS, emptyOptions, ALL_KINDS } from '~/shared/file-tree/types';
import { checkerResult, getEmpty, mergeObjectsWithArrayConcat, type Get } from '~/shared/file-tree/utils';
import type { UserRepo } from '~/shared/target';
import type { Basic } from '~/shared/types';

useHead({ title: 'Issue File Tree' });
highlightRust();

const label = (a: string) => a;

const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref<string | null>(null);
const selectedChecker = ref<string | null>(null);
const selectedKind = ref<string | null>(null);
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
const count = ref<number | null>(null);
watch(() => ({ g: got.value, g2: got2.value, b: basic.value }), ({ g, g2, b }) => {
  if (!b) return;

  const dropdown = new Dropdown(g, gen_map(b));
  const dropdown_new = dropdown.filter(g2);

  pkgs.value = cloneDeep(dropdown_new.pkgs);
  kinds.value = cloneDeep(dropdown_new.kinds);
  checkers.value = cloneDeep(dropdown_new.checkers);
  count.value = g2.fileTree.data.map(d => d.count).reduce((acc, c) => acc + c, 0);
}, { deep: true });

// const pkgs = computed(() => basic.value?.pkgs.map(p => p.pkg) ?? []);
// const checkers = computed(() => basic.value?.checkers.map(p => p.checker) ?? []);
const targets = computed(() => basic.value?.targets.map(p => p.triple) ?? []);
const features = computed(() => basic.value?.features_sets.map(p => p.features) ?? []);

watch(got, g => {
  // reset pkg since it's less likely to see the same selected pkg in another repo
  selectedPkg.value = null;
  const kind = Dropdown.find_kind(selectedKind.value, g);
  console.log("kind:", kind);
  selectedKind.value = kind;
  // selectedChecker.value = null;
});
watch(
  () => ({ pkg: selectedPkg.value, kind: selectedKind.value, ck: selectedChecker.value, g: got.value }),
  ({ pkg, kind, ck, g }) => {
    const target = cloneDeep(g);

    Dropdown.update_by_pkg(pkg, target);

    if (ck && ck !== ALL_CHECKERS) {
      const ck_kinds = basic.value?.kinds.mapping[ck];
      if (ck_kinds) Dropdown.update_by_checker(ck_kinds, target);
    }

    Dropdown.update_by_kind(kind, target);

    console.log("react to select:", pkg, kind, ck, g);
    got2.value = target;
  }
);


// Download raw report JSON. 
// NOTE: this function should mutate got state in the template.
// If the fn is moved to a module file, the state of got will be
// broken. See https://github.com/os-checker/os-checker.github.io/issues/138
function get(path: string) {
  githubFetch<FileTree>({ path })
    .then((fileTree) => {
      // 首次打开页面加载数据后，从所有 packags 的原始输出填充到所有选项卡
      let kinds = {};
      for (const datum of fileTree.data) {
        for (const report of datum.raw_reports) {
          // for (const kind of Object.keys(report.kinds)) {
          // 对原始输出中的所有特殊符号转义，以后就不需要转义了
          //   report.kinds[kind] = report.kinds[kind].map(domSanitize);
          // }
          mergeObjectsWithArrayConcat(kinds, report.kinds);
        }
      }
      const tabs = checkerResult(kinds, fileTree.kinds_order).results;
      got.value = {
        tabs,
        selectedTab: tabs[0]?.kind ?? "",
        fileTree: fileTree,
      };
      got2.value = cloneDeep(got.value);
      // pkgs.value = compute_pkgs(got2.value);
    }).catch((_: FetchError) => {
      // 不存在该文件：意味着该目标架构下的所有仓库没有检查出错误
      // 注意，由于使用 parseResponse，这个错误码并不为 404，而是 undefined，
      // 且错误原因为 SyntaxError: Unexpected non-whitespace character after JSON at position 3。
      // 这里 ofetch 没有正确处理错误（貌似也没人报告？），所以暂且认为出现任何网络或解析错误都视为无错误。
      // console.log(err, err.data, err.statusCode);

      got.value = {
        tabs: [{
          kind: "All good! 🥳", raw: ["该目标架构下的所有仓库没有检查出错误 🥳🥳🥳"],
          lang: "rust", severity: Severity.Info, disabled: false
        }],
        selectedTab: "All good! 🥳",
        fileTree: getEmpty().fileTree
      };
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
