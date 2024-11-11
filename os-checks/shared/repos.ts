export type Info = {
  /// repo name
  name: string,
  /// user/repo
  full_name: string,
  owner: Owner,
  description: string | null,
  created_at: string,
  pushed_at: string,
  /// updated_at can be influenced by many other stuff, internally or externally (like someone
  /// stars the repo), so this field is less important than pushed_at
  ///
  /// https://stackoverflow.com/questions/15918588/github-api-v3-what-is-the-difference-between-pushed-at-and-updated-at
  ///
  /// Seems this related to events.
  updated_at: string,
  homepage: string | null,
  default_branch: string,
  /// in bytes
  size: number,

  /// watchers, watchers_count, and stargazers_count
  /// correspond to the number of users that have starred a repository
  ///
  /// see: https://docs.github.com/en/rest/activity/starring?apiVersion=2022-11-28
  stargazers_count: number,
  subscribers_count: number,
  forks_count: number,
  network_count: number,
  open_issues_count: number,

  fork: boolean,
  archived: boolean,
  has_issues: boolean,
  has_projects: boolean,
  has_downloads: boolean,
  has_wiki: boolean,
  has_pages: boolean,
  has_discussions: boolean,

  topics: string[],
  language: string | null,
  license: License | null,
}

export type Owner = {
  /// user name
  login: string,
  /// Organization, User, Bot or something
  type: string,
}

export type License = {
  spdx_id: string,
}

export type Contributor = {
  login: string,
  type: string,
  contributions: number,
}

export type Output = {
  user: string,
  repo: string,
  info: Info,
  active_days: number,
  contributions: number,
  contributors: Contributor[],
}

export function formatBytes(bytes: number, decimals = 0) {
  if (bytes === 0) { return '0 B'; }

  const k = 1024; // 1KB = 1024 bytes
  const dm = decimals < 0 ? 0 : decimals; // 小数位数
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export type Repo = {
  idx: number,
  user: string,
  repo: string,

  license: string | null,
  homepage: string | null,
  description: string | null,
  created_at: string,
  pushed_at: string,

  active_days: number,
  size: number,
  contributions: number,
  contributors: number,
  open_issues_count: number,

  stargazers: number | null,
  subscribers: number | null,
  forks: number | null,
  network: number | null,

  default_branch: string,
  fork: string | null,
  archived: string | null,

  issues: boolean,
  discussions: boolean,
  // wiki: boolean,
  topics: string[],
}

export type Col = { display: boolean, name: string, option: string };
/// reactive Columns
export const columns: { [key: string]: Col } = {
  // idx: {display: true, name: "Idx", option: "Idx"},
  // user: {display: true, name: "User", option: "User"},
  // repo: {display: true, name: "Repo", option: "Repo"},
  license: { display: false, name: "License", option: "License" },
  homepage: { display: false, name: "Homepage", option: "Homepage" },
  description: { display: false, name: "Description", option: "Description" },
  created_at: { display: false, name: "Created_at", option: "Created" },
  pushed_at: { display: false, name: "Updated", option: "Updated" },

  active_days: { display: false, name: "Active Days", option: "Active Days" },
  size: { display: false, name: "Size", option: "Size" },
  contributions: { display: false, name: "Contri-butions", option: "Contributions" },
  contributors: { display: false, name: "Contri-butors", option: "Contributors" },
  open_issues_count: { display: false, name: "Open Issues", option: "Open Issues" },

  stargazers: { display: false, name: "Star-gazers", option: "Stargazers" },
  subscribers: { display: false, name: "Sub-scribers", option: "Subscribers" },
  forks: { display: false, name: "Forks", option: "Forks" },
  network: { display: false, name: "Net Work", option: "Net Work" },

  default_branch: { display: false, name: "Default Branch", option: "Default Branch" },
  fork: { display: false, name: "Is This Forked", option: "Is This Forked" },
  archived: { display: false, name: "Is This Archived", option: "Is This Archived" },

  discussions: { display: false, name: "Discussions", option: "Discussions" },
  // wiki: {display: false, name: "Wiki", option: "Wiki"},
  topics: { display: false, name: "Topics", option: "Topics" },
};

export class Cols {
  cols;

  static full = "[Columns] Full";
  static slimmed = "[Columns] Default (Slimmed)";

  static defaultColumns = [
    "license", "homepage", "description", "pushed_at",
    "active_days", "contributions", "contributors", "size",
  ];

  constructor() {
    this.cols = columns;
  }

  display(col: string) {
    return this.cols[col].display;
  }

  name(col: string) {
    return this.cols[col].name;
  }

  static options() {
    return [Cols.full, Cols.slimmed, ...Object.keys(columns)];
  }

  static option(opt: string): string {
    if (opt === Cols.full) {
      return Cols.full;
    } else if (opt === Cols.slimmed) {
      return Cols.slimmed;
    }
    return columns[opt].option;
  }

  setDefaultColumns() {
    const default_columns = new Set(Cols.defaultColumns);
    for (const col of Object.keys(this.cols)) {
      this.cols[col].display = default_columns.has(col);
    }
  }

  setDisplay(cols: string[]) {
    if (cols.length === 0) {
      console.log("setDisplay 0");
      this.setDefaultColumns();
      return;
    }

    if (cols.findIndex(c => c === Cols.full) !== -1) {
      // display all columns 
      for (const col of Object.keys(this.cols)) {
        this.cols[col].display = true;
      }
      return;
    }

    const default_columns = (cols.findIndex(c => c === Cols.slimmed) !== -1) ?
      Cols.defaultColumns : [];
    const set = new Set([...cols, ...default_columns]);

    for (const col of Object.keys(this.cols)) {
      this.cols[col].display = set.has(col);
    }
  }
}
