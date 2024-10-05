export type Resolved = {
  pkg: string,
  toolchain: string,
  checker: string,
  target: string,
  cmd: string,
};

export const resolvedColumns = [
  { field: "pkg", header: "Pkg" },
  { field: "toolchain", header: "Toolchain" },
  { field: "checker", header: "Checker" },
  { field: "target", header: "Target" },
  { field: "cmd", header: "Cmd" },
]

export type Source = {
  pkg: string,
  target: string,
  src: string,
  path: string,
  used: boolean,
  specified: boolean,
};

export const sourcesColumns = [
  { field: "pkg", header: "Pkg" },
  { field: "target", header: "Target" },
  { field: "src", header: "Heruistic Approach" },
  { field: "path", header: "Heruistic Path (Repo Root Prefix Stripped)" },
  { field: "used", header: "Used" },
  { field: "specified", header: "Specified" },
]

