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
