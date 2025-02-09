import type { FetchError } from 'ofetch';
import type { TreeNode } from 'primevue/treenode';
import type { CheckerResult, FileTree, Kinds } from '~/shared/file-tree';
import { Severity } from '~/shared/file-tree';

export function mergeObjectsWithArrayConcat(result: Kinds, obj: Kinds) {
  for (const [key, value] of Object.entries(obj)) {
    if (result.hasOwnProperty(key)) {
      // 如果键已经存在，则合并数组
      result[key] = result[key].concat(value);
    } else {
      // 否则，添加新的键值对
      result[key] = value;
    }
  }
}

export type CheckerResult_SelectedTab = {
  results: CheckerResult[],
  selectedTab: string,
}
// Kinds 可能不包含全部诊断类别，因此这里填充空数组，并按照顺序排列
export function checkerResult(kinds: Kinds, kinds_order: string[]): CheckerResult_SelectedTab {
  let results = kinds_order.map<CheckerResult>(kind => {
    return { kind, raw: [], lang: "rust", severity: Severity.Disabled, disabled: true };
  });
  for (const [kind, raw] of Object.entries(kinds)) {
    let lang = "rust";
    let severity = Severity.Info;
    switch (kind) {
      case "Cargo": severity = Severity.Danger; break;
      case "Clippy(Error)": severity = Severity.Danger; break;
      case "Lockbud(Probably)": severity = Severity.Danger; break;
      case "Clippy(Warn)": severity = Severity.Warn; break;
      case "Unformatted": lang = "diff"; break;
      default: ;
    }
    const pos = results.findIndex(r => r.kind === kind);
    if (pos !== -1) {
      // JSON 提供的诊断信息一定不是空数组
      results[pos] = { kind, raw, lang, severity, disabled: false };
    }
  }
  results = results.filter(res => res.raw.length !== 0);
  // selectedTab.value = results.find(r => !r.disabled)?.kind ?? "";
  const selectedTab = results.find(r => !r.disabled)?.kind ?? "";
  return { results, selectedTab };
}

export type Get = { tabs: CheckerResult[], selectedTab: string, fileTree: FileTree };
export function getEmpty(): Get {
  return { tabs: [], selectedTab: "", fileTree: { kinds_order: [], data: [], repo: { user: "", repo: "" } } };
}
export function get(path: string): Get {
  let got = getEmpty();

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
      got.tabs = checkerResult(kinds, file_tree.kinds_order).results;
      got.selectedTab = got.tabs[0]?.kind ?? "";
      got.fileTree = file_tree;
    }).catch((_: FetchError) => {
      // 不存在该文件：意味着该目标架构下的所有仓库没有检查出错误
      // 注意，由于使用 parseResponse，这个错误码并不为 404，而是 undefined，
      // 且错误原因为 SyntaxError: Unexpected non-whitespace character after JSON at position 3。
      // 这里 ofetch 没有正确处理错误（貌似也没人报告？），所以暂且认为出现任何网络或解析错误都视为无错误。
      // console.log(err, err.data, err.statusCode);

      got.tabs = [{
        kind: "All good! 🥳", raw: ["该目标架构下的所有仓库没有检查出错误 🥳🥳🥳"],
        lang: "rust", severity: Severity.Info, disabled: false
      }];
      got.selectedTab = "All good! 🥳";
      got.fileTree = { kinds_order: [], data: [] };

      // tabs.value = [{
      //   kind: "Not Exists!", raw: ["该目标架构下，无原始报告数据。"],
      //   lang: "rust", severity: Severity.Danger, disabled: false
      // }];
      // selectedTab.value = "Not Exists!";
      // fileTree.value = { kinds_order: [], data: [] };
    });

  // console.log("got")
  return got;
}

export function updateSelectedKey(val: {}, nodes: TreeNode[], fileTree: FileTree): undefined | CheckerResult_SelectedTab {
  const key = Object.keys(val)[0];
  if (!key) { return; }
  const idx = parseInt(key);
  // console.log(idx, node);
  for (const node of nodes.slice().reverse()) {
    const nd = node.data;
    if (!(nd && nd.user && nd.repo && nd.pkg)) { return; }

    // 查找是否点击了 package
    if (node.key === key) {
      // 更新 tabs 展示的数据
      const found_pkg = fileTree.data.find(datum => {
        return datum.user === nd.user && datum.repo === nd.repo && datum.pkg === nd.pkg;
      });
      let kinds = {};
      for (const report of found_pkg?.raw_reports ?? []) {
        mergeObjectsWithArrayConcat(kinds, report.kinds);
      }
      const tabs = checkerResult(kinds, fileTree.kinds_order);
      return tabs;
    } else {
      // 由于 key 是升序的，现在只要找第一个小于目标 key 的 package，那么这个文件就在那里
      if (idx > parseInt(node.key)) {
        for (const file of node.children ?? []) {
          if (file.key === key) {
            const filename = file.data;
            if (!filename) { return { results: [], selectedTab: "" }; }
            const package_ = fileTree.data.find(datum => {
              return datum.user === nd.user && datum.repo === nd.repo && datum.pkg === nd.pkg;
            });
            const found_file = package_?.raw_reports.find(item => item.file === filename);
            if (found_file) {
              const tabs = checkerResult(found_file.kinds, fileTree.kinds_order);
              return tabs;
            }
          }
        }
      }
    }
  }
}

