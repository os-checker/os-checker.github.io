export type Target = {
  triple: string,
  count: number,
};
export type Targets = Target[];
export type Column = { field: string, header: string };
export type Columns = Column[];
export type Basic = {
  pkgs: { pkg: string, count: number }[],
  checkers: { checker: string, count: number }[],
  targets: Targets,
  features_sets: { features: string, count: number }[],
  kinds: {
    order: string[],
    mapping: { [key: string]: string[] },
    // columns: Columns
  }
};
export type TargetOption = { target: string };

export type PassCountRepo = {
  pass: number,
  total: number,
};
export type PassCountRepos = { [key: string]: PassCountRepo };

