export type Targets = string[];
export type Column = { field: string, header: string };
export type TargetTriples = {
  targets: Targets,
  kinds: {
    order: string[],
    mapping: { [key: string]: string[] },
    columns: Column[]
  }
};
export type TargetOption = { target: string };
