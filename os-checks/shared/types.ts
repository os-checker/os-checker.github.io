export type Target = {
  triple: string,
  count: number,
};
export type Targets = Target[];
export type Column = { field: string, header: string };
export type Columns = Column[];
export type Basic = {
  targets: Targets,
  kinds: {
    // order: string[],
    // mapping: { [key: string]: string[] },
    columns: Columns
  }
};
export type TargetOption = { target: string };

export type PassCountRepo = {
  pass: number,
  total: number,
};
export type PassCountRepos = { [key: string]: PassCountRepo };

export type Resolved = {
  pkg: string,
  toolchain: string,
  checker: string,
  target: string,
  cmd: string,
};

export type Source = {
  pkg: string,
  target: string,
  src: string,
  path: string,
  used: boolean,
  specified: boolean,
};
