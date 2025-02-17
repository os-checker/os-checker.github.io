<template>
  <div>
    <div style="display: flex" v-if="displayFilters">
      <!-- <div style="max-width: 10%; display: grid; place-items: center; padding: 0px 20px;"> -->
      <!--   <div> -->
      <!--     <b>Count</b><br> -->
      <!--     <Button style="margin-top: 5px;" severity="danger" v-if="count">{{ count }}</Button> -->
      <!--   </div> -->
      <!-- </div> -->

      <div style="flex:1">
        <div style="padding: 6px 8px 6px 8px">
          <span class="input">User:</span>
          <span class="select">
            <Select v-model="selected.user" filter :options="users" :optionLabel="label" />
          </span>

          <span class="input">Repo:</span>
          <span class="select">
            <Select v-model="selected.repo" filter :options="repos" :optionLabel="label" />
          </span>

          <DropDownWithCount v-model="selected.target" tag="Target" :all="ALL_TARGETS" :counts="targets" />

        </div>

        <div style="padding: 2px 8px 10px 8px">

          <DropDownWithCount v-model="selected.pkg" tag="Pkg" :all="ALL_PKGS" :counts="pkgs" />
          <DropDownWithCount v-model="selected.features" tag="Features" :all="ALL_FEATURES_SETS" :counts="features" />

          <DropDownWithCount v-model="selected.checker" tag="Checker" :all="ALL_CHECKERS" :counts="checkers" />
          <DropDownWithCount v-model="selected.kind" tag="Kind" :all="ALL_KINDS" :counts="kinds" />

        </div>
      </div>

    </div>

    <FileTree2 :get="got2" :count="count" v-model:filters="displayFilters" v-model:lockURL="lockURL" />
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'es-toolkit/compat';
import type { FetchError } from 'ofetch';
import { Severity, type FileTree } from '~/shared/file-tree';
import { Dropdown, gen_map, gen_targets } from '~/shared/file-tree/dropdown';
import { ALL_PKGS, ALL_CHECKERS, ALL_TARGETS, ALL_KINDS, emptyOptions, type DropDownOptions, ALL_FEATURES_SETS } from '~/shared/file-tree/types';
import { checkerResult, getEmpty, mergeObjectsWithArrayConcat, type Get } from '~/shared/file-tree/utils';
import type { UserRepo } from '~/shared/target';
import type { Basic } from '~/shared/types';

useHead({ title: 'Issue File Tree' });
highlightRust();

const label = (a: string) => a;

const selected = reactive<{
  user: string,
  repo: string,
  target: string,
  pkg: string | null,
  features: string | null,
  checker: string | null,
  kind: string | null,
}>({
  user: "",
  repo: "",
  target: ALL_TARGETS,
  pkg: null,
  features: null,
  checker: null,
  kind: null,
});
// watch(selected, val => console.log(val));

const displayFilters = ref(true);

const got = ref<Get>(getEmpty());
const got2 = ref<Get>(getEmpty());
const basic = ref<Basic | null>(null);

// Get user/repo list for filters.
const user_repo = ref<UserRepo>({});
githubFetch<UserRepo>({ path: "ui/user_repo.json" })
  .then(data => user_repo.value = data);

// Init filters.
const users = computed(() => Object.keys(user_repo.value).sort());
const repos = computed(() => user_repo.value[selected.user]);

const lockURL = ref(false);
type Params = {
  user?: string,
  repo?: string,
  target?: string,
  pkg?: string,
  features?: string,
  checker?: string,
  kind?: string,
  lock?: string,
};
// given query
const query_params = reactive<Params>({});

watch(user_repo, val => {
  const { user, repo, target } = query_params;
  if (user && repo) {
    selected.user = user;
    selected.repo = repo;
    if (target && target !== ALL_TARGETS) selected.target = target;
  } else {
    const user = Object.keys(val).sort()[0] ?? "";
    selected.user = user;
    selected.repo = val[user][0] ?? "";
  }
});

// Update got state.
watch(() => ({ user: selected.user, repo: selected.repo, target: selected.target }),
  ({ user, repo, target }) => {
    if (user && repo) {
      const target_ = target || ALL_TARGETS;
      get(`ui/repos/${user}/${repo}/${target_}.json`);
      getBasic(`ui/repos/${user}/${repo}/basic.json`);
    }
  }
);

const targets = computed<DropDownOptions>(() => {
  const t = basic.value?.targets;
  return t ? gen_targets(t) : emptyOptions();
});

const pkgs = ref(emptyOptions());
const kinds = ref(emptyOptions());
const checkers = ref(emptyOptions());
const features = ref(emptyOptions());
const count = ref<number | null>(null);
watch(() => ({ g: got.value, g2: got2.value, b: basic.value }), ({ g, g2, b }) => {
  if (!b) return;

  const dropdown = new Dropdown(g, gen_map(b));
  const dropdown_new = dropdown.filter(g2);

  pkgs.value = cloneDeep(dropdown_new.pkgs);
  kinds.value = cloneDeep(dropdown_new.kinds);
  checkers.value = cloneDeep(dropdown_new.checkers);
  features.value = cloneDeep(dropdown_new.features);
  count.value = g2.fileTree.data.map(d => d.count).reduce((acc, c) => acc + c, 0);
}, { deep: true });


function get_ck_kinds(ck: string | null): string[] | null {
  if (ck && ck !== ALL_CHECKERS) {
    const ck_kinds = basic.value?.kinds.mapping[ck];
    if (ck_kinds) return ck_kinds;
  }
  return null;
}

function switch_got(g: Get) {
  if (lock_filters()) return;

  // reset pkg and features since it's less likely to see the same selected pkg in another repo
  selected.pkg = null;
  selected.features = null;

  // reset kind if the diagnositc is empty
  selected.kind = Dropdown.find_kind(selected.kind, g);

  // reset checker if the diagnositc is empty
  const ck_kinds = get_ck_kinds(selected.checker);
  let reset_checker = true;
  if (ck_kinds) {
    for (const kind of ck_kinds) {
      if (Dropdown.find_kind(kind, g)) {
        reset_checker = false;
        break
      }
    }
  }
  if (reset_checker) selected.checker = null;
}

function lock_filters(): boolean {
  const init = query_params.lock === "true";
  // should be called only once in startup
  if (init) {
    lockURL.value = true;
    const { pkg, features, checker, kind } = query_params;
    if (pkg) selected.pkg = pkg;
    if (features) selected.features = features;
    if (checker) selected.checker = checker;
    if (kind) selected.kind = kind;
    query_params.lock = undefined;
  }
  return init;
}

// watch selection changes
watch(
  () => ({
    pkg: selected.pkg, feat: selected.features,
    kind: selected.kind, ck: selected.checker, g: got.value
  }),
  ({ pkg, feat, kind, ck, g }, old) => {
    if (old.g !== g) return switch_got(g);
    lockURL.value = false;

    const val = cloneDeep(g);

    Dropdown.update_by_features(feat, val);
    Dropdown.update_by_pkg(pkg, val);

    const ck_kinds = get_ck_kinds(ck);
    if (ck_kinds) Dropdown.update_by_checker(ck_kinds, val);

    Dropdown.update_by_kind(kind, val);

    got2.value = val;
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
      // selected.tab.value = "Not Exists!";
      // fileTree.value = { kinds_order: [], data: [] };
    });
}

function getBasic(path: string) {
  githubFetch<Basic>({ path })
    .then(val => basic.value = val)
    .catch(err => console.log(err))
}

// route query
const route = useRoute();
function updateFilter(query: Params) {
  const { user, repo, target, pkg, features, checker, kind, lock } = query;

  if (user) { query_params.user = decodeURIComponent(user); }
  if (repo) { query_params.repo = decodeURIComponent(repo); }
  if (target) { query_params.target = decodeURIComponent(target); }
  if (pkg) { query_params.pkg = decodeURIComponent(pkg); }
  if (features !== undefined) { query_params.features = decodeURIComponent(features); }
  if (checker) { query_params.checker = decodeURIComponent(checker); }
  if (kind) { query_params.kind = decodeURIComponent(kind); }
  if (lock === "true") {
    query_params.lock = decodeURIComponent(lock);
    lockURL.value = false;
  }
}
updateFilter(route.query);

const router = useRouter();
// emit query
const router_params = ref<Params | null>(null);
watch(router_params, query => router.push({ path: route.path, query: query || {} }));

watch(lockURL, lock => {
  if (!lock) {
    router_params.value = {};
    return;
  }

  const { user, repo, target, pkg, features, checker, kind } = selected;

  let query: any = {};

  if (user) query.user = encodeURIComponent(user);
  if (repo) query.repo = encodeURIComponent(repo);
  if (target && target !== ALL_TARGETS) query.target = encodeURIComponent(target);
  if (pkg) query.pkg = encodeURIComponent(pkg);
  if (features !== null) query.features = encodeURIComponent(features);
  if (checker) query.checker = encodeURIComponent(checker);
  if (kind) query.kind = encodeURIComponent(kind);

  query.lock = encodeURIComponent("true");

  router_params.value = query;
});
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
</style>
