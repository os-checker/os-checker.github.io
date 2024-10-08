export type Resolved = {
  idx: number,
  pkg: string,
  toolchain: string,
  checker: string,
  target: string,
  cmd: string,
  count: number,
  ms: number,
};

export const resolvedColumns = [
  { field: "idx", header: "Idx" },
  { field: "pkg", header: "Pkg" },
  { field: "target", header: "Target" },
  { field: "toolchain", header: "Toolchain" },
  { field: "checker", header: "Checker" },
  { field: "cmd", header: "Cmd" },
  { field: "count", header: "Count" },
  { field: "ms", header: "ms" },
]

export type Source = {
  pkg: string,
  target: string,
  src: string,
  path: string,
  used: boolean,
  specified: boolean,
};

export type Source2 = {
  idx: number,
  pkg: string,
  target: string,
  src: string,
  path: string,
  used: string,
  specified: string,
};

export const sourcesColumns = [
  { field: "idx", header: "Idx" },
  { field: "pkg", header: "Pkg" },
  { field: "target", header: "Target" },
  { field: "src", header: "Heuristic Source" },
  { field: "path", header: "Heuristic Path (Repo Root Prefix Stripped)" },
  { field: "used", header: "Used" },
  { field: "specified", header: "Specified" },
]

export type UserRepo = {
  [key: string]: string[]
}

export enum TableKind {
  Resolved = "Resolved Cmds",
  Sources = "Target Sources"
}

export const tableKinds: TableKind[] = [TableKind.Resolved, TableKind.Sources];
