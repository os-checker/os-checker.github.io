export type Targets = string[];
export type Column = { field: string, header: string };
export type Columns = Column[];
export type Basic = {
  targets: Targets,
  kinds: {
    order: string[],
    mapping: { [key: string]: string[] },
    columns: Columns
  }
};
export type TargetOption = { target: string };
