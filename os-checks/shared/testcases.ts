import type { DataTableSortMeta } from 'primevue/datatable';
import { uniq } from 'es-toolkit/compat';
import type { PkgInfo } from './info';

export type TestResult = {
  idx: number,
  user: string,
  repo: string,
  pkg: string,
  bin: string,
  kind: string,
  name: string,
  test_pass: string,
  test_duration_ms: number | null,
  test_error: string | null,
  miri_pass: string,
  miri_output: string | null,
  miri_timeout: string,
};

export type Selection = {
  user: string | null,
  repo: string | null,
  pkg: string | null,
  kind: string | null,
  test_pass: string | null,
  miri_pass: string | null,
  miri_timeout: string | null,
  text: any,
  sorts: DataTableSortMeta[],
};

/** Called when testcases are fetched or selection is updated */
export function applySelection(
  testcases: TestResult[],
  { user, repo, pkg, kind, test_pass, miri_pass, miri_timeout }: Selection
): TestResult[] {
  // for simplicity, the data of testcases are supposed to remain unchanged
  const chosen_testcases = testcases.filter(test => {
    let chosen = true;
    if (user) chosen &&= test.user === user;
    if (repo) chosen &&= test.repo === repo;
    if (pkg) chosen &&= test.pkg === pkg;
    if (kind) chosen &&= test.kind === repo;
    if (test_pass) chosen &&= test.test_pass === test_pass;
    if (miri_pass) chosen &&= test.miri_pass === miri_pass;
    if (miri_timeout || miri_timeout === "") chosen &&= test.miri_timeout === miri_timeout;
    return chosen;
  });
  return chosen_testcases.map((tc, idx) => {
    tc.idx = idx;
    return tc;
  });
}

export type Options = {
  user: string[],
  repo: string[],
  pkg: string[],
  kind: string[],
  test_pass: string[],
  miri_pass: string[],
  miri_timeout: string[],
};

export function defaultOptions(): Options {
  return {
    user: [],
    repo: [],
    pkg: [],
    kind: [],
    test_pass: [],
    miri_pass: [],
    miri_timeout: [],
  };
}

export function testcasesToOptions(tc: TestResult[]): Options {
  let opts = defaultOptions();
  for (const test of tc) {
    opts.user.push(test.user);
    opts.repo.push(test.repo);
    opts.pkg.push(test.pkg);
    opts.kind.push(test.kind);
    opts.test_pass.push(test.test_pass);
    opts.miri_pass.push(test.miri_pass);
    opts.miri_timeout.push(test.miri_timeout);
  }

  opts.user = uniq(opts.user).sort();
  opts.repo = uniq(opts.repo).sort();
  opts.pkg = uniq(opts.pkg).sort();
  opts.kind = uniq(opts.kind).sort();
  opts.test_pass = uniq(opts.test_pass).sort();
  opts.miri_pass = uniq(opts.miri_pass).sort();
  opts.miri_timeout = uniq(opts.miri_timeout).sort();
  return opts;
}

export function summariesToTestResult(pkg_info: PkgInfo[]): TestResult[] {
  let result: TestResult[] = [];
  let idx = 0;

  for (const info of pkg_info) {
    for (const [pkg, value] of Object.entries(info.pkgs ?? {})) {
      for (const test of value.testcases?.tests || []) {
        for (const testcase of test.testcases) {
          result.push({
            idx: idx++,
            user: info.user,
            repo: info.repo,
            pkg,
            bin: test.binary_name,
            kind: test.kind,
            name: testcase.name,
            test_pass: testcase.status === "ok" ? "✅" : (testcase.status === "failed" ? "❌" : ""),
            test_duration_ms: testcase.duration_ms,
            test_error: testcase.error,
            miri_pass: testcase.miri_pass ? "✅" : "❌",
            miri_output: testcase.miri_output,
            miri_timeout: testcase.miri_timeout ? "💥" : "",
          });
        }
      }
    }
  }

  return result;
}
