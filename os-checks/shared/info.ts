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
  os_categories: string[],
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
