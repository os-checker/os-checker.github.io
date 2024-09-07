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
  data: Datum[]
}

