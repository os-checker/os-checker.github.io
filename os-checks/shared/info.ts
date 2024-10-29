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
  author: string[]
  description: string[],
  categories: string[]
  os_categories: string[],
}

export type TestCases = {
  tests: Test[],
  pkg_tests_count: number,
  workspace_tests_count: number,
}

export type Test = {
  id: string,
  kind: string,
  binary_name: string,
  binary_path: string,
  testcases: string[]
}
