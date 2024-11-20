import { type Col, Cols } from "./columns-select"

export type PkgInfo = {
  user: string,
  repo: string,
  pkgs: { [key: string]: Pkg }
}

export type Pkg = {
  version: string,
  dependencies: number,
  lib: boolean,
  bin: boolean,
  testcases: TestCases | null,
  tests: number,
  examples: number,
  benches: number,
  authors: string[],
  description: string,
  documentation: string | null,
  readme: string | null,
  homepage: string | null,
  keywords: string[],
  categories: string[]
  diag_total_count: number | null,
  last_commit_time: string,
  release_count: number | null,
  last_release_size: number | null,
  last_release_time: string | null,
}

export type TestCases = {
  tests: Test[],
  failed: number,
  duration_ms: number,
  pkg_tests_count: number,
  workspace_tests_count: number,
}

export type Test = {
  id: string,
  kind: string,
  binary_name: string,
  // binary_path: string,
  testcases: TestCase[],
  failed: number,
  duration_ms: number,
}

export type TestCase = {
  name: string,
  status: string | null,
  duration_ms: number | null,
}

export function unique_field(summaries: PkgInfo[], cb: (_: Pkg) => string[]): string[] {
  const arr = summaries.map(s => Object.values(s.pkgs).map(pkg => cb(pkg).flat()).flat()).flat();
  return [...new Set(arr)].sort();
}

export function unique_field_bool(summaries: PkgInfo[], cb: (_: Pkg) => boolean): boolean {
  const arr = summaries.filter(s => Object.values(s.pkgs).filter(cb).length > 0)
  return arr.length > 0;
}

// *************** Control which columns are displayed ***************

const defaultColumns = [
  "last_commit_time", "version", "release_count", "diag_total_count", "testcases",
  "documentation", "description"
];

const columns: { [key: string]: Col } = {
  last_commit_time: { display: false, name: "Last Commit", option: "Last Commit Time" },
  version: { display: false, name: "Version", option: "Version" },
  release_count: { display: false, name: "crates.io Releases", option: "crates.io Releases" },
  last_release_time: { display: false, name: "Last Release", option: "Last Release Time" },
  last_release_size: { display: false, name: "Release Size", option: "Last Release Size" },
  diag_total_count: { display: false, name: "Diag-nostics", option: "Diagnostics" },
  testcases: { display: false, name: "Test Cases", option: "Test Cases" },

  lib: { display: false, name: "Lib", option: "Lib" },
  bin: { display: false, name: "Bin", option: "Bin" },
  dependencies: { display: false, name: "Dependencies", option: "Dependencies" },
  tests: { display: false, name: "Tests", option: "Tests" },
  examples: { display: false, name: "Examples", option: "Examples" },
  benches: { display: false, name: "Benches", option: "Benches" },

  documentation: { display: false, name: "Doc", option: "Doc" },
  latest_doc: { display: false, name: "Latest Doc", option: "Latest Doc" },
  homepage: { display: false, name: "Home Page", option: "Home Page" },
  categories: { display: false, name: "Categories", option: "Categories" },

  keywords: { display: false, name: "Keywords", option: "Keywords" },
  description: { display: false, name: "Description", option: "Description" },
  authors: { display: false, name: "Authors", option: "Authors" },
};

export class InfoCols extends Cols {
  static init() {
    return new InfoCols(columns, defaultColumns);
  }
}
