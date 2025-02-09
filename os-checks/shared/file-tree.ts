export type Kinds = { [key: string]: string[] };
export type RawReport = { file: string, count: number, kinds: Kinds };
export type Datum = {
  user: string,
  repo: string,
  pkg: string,
  count: number,
  raw_reports: RawReport[]
}

export type FileTree = {
  // 诊断类别数组，越往前的越优先展示
  kinds_order: string[],
  data: Datum[],
  repo: {
    user: string,
    repo: string,
  }
}

export type CheckerResult = {
  kind: string,
  raw: string[],
  lang: string,
  severity: Severity,
  disabled: boolean, // 对于空数组，禁用选项卡
};

export enum Severity {
  Danger = "danger",
  Warn = "warn",
  Info = "info",
  Disabled = "secondary",
}
