import { type Col, Cols } from "./columns-select"

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

// *************** Control which columns are displayed ***************

const defaultColumns = [
  "license", "homepage", "description", "pushed_at",
  "active_days", "contributions", "contributors", "size",
];

const columns: { [key: string]: Col } = {
  license: { display: false, name: "License", option: "License" },
  homepage: { display: false, name: "Home", option: "Home Page" },
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
  topics: { display: false, name: "Topics", option: "Topics" },
};

export class RepoCols extends Cols {
  static init() {
    return new RepoCols(columns, defaultColumns);
  }
}
