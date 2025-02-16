import { ALL_CHECKERS, ALL_FEATURES_SETS, ALL_KINDS, ALL_PKGS, counts_to_options, emptyOptions, type Counts, type DropDownOptions } from "./types";
import type { Get } from "./utils";
import type { Kinds } from "../file-tree";
import type { Basic, Targets } from "../types";

export class Dropdown {
  pkgs: DropDownOptions;
  kinds: DropDownOptions;
  map: KindCheckerMap;
  checkers: DropDownOptions;
  features: DropDownOptions;
  // has non-empty features
  has_features: boolean;

  /** called when a new fileTree is created */
  constructor(g: Get, map: KindCheckerMap) {
    this.pkgs = gen_pkgs(g);
    this.kinds = gen_kinds(g);
    this.map = map; // map is supposed to never change
    this.checkers = gen_checkers(this.kinds, map);
    const { has, opt } = gen_features(g);
    console.log(has, opt);
    this.has_features = has;
    this.features = opt;
  }

  /** called when a fitler is changed */
  filter(g: Get): Dropdown {
    let options = new Dropdown(g, this.map);
    // replace All* with full counts
    options.pkgs.counts[ALL_PKGS] = this.pkgs.counts[ALL_PKGS];
    options.kinds.counts[ALL_KINDS] = this.kinds.counts[ALL_KINDS];
    options.checkers.counts[ALL_CHECKERS] = this.checkers.counts[ALL_CHECKERS];

    if (this.has_features)
      options.features.counts[ALL_FEATURES_SETS] = this.features.counts[ALL_FEATURES_SETS];

    return options;
  }

  static empty(): Dropdown {
    const options = emptyOptions();
    const obj = Object.create(Dropdown.prototype);
    obj.pkgs = options; obj.kinds = options; obj.checkers = options; obj.map = {};
    return obj;
  }

  static update_by_pkg(pkg: string | null, g: Get) {
    if (pkg && pkg !== ALL_PKGS) update_by_pkg(pkg, g);
  }

  static update_by_kind(kind: string | null, g: Get) {
    if (kind && kind !== ALL_KINDS) update_by_kind(kind, g);
  }

  static update_by_checker(kinds: string[], g: Get) {
    update_by_checker(kinds, g);
  }

  static find_kind(kind: string | null, g: Get): string | null {
    if (!kind) return null;
    for (const data of g.fileTree.data) {
      for (const reports of data.raw_reports) {
        const ele = reports.kinds[kind];
        if (ele && ele.length) return kind;
      }
    }
    return null;
  }
}

// generate filter options

function gen_pkgs(g: Get): DropDownOptions {
  let counts: Counts = {};
  for (const data of g.fileTree.data) {
    const pkg = data.pkg;
    const len = data.raw_reports.reduce((acc, reports) => acc + reports.count, 0);
    // usually if can't be true due to impossible duplicated pkg name
    if (counts[pkg]) counts[pkg] += len;
    else counts[pkg] = len;
  }
  return counts_to_options(counts, ALL_PKGS);
}

function gen_kinds(g: Get): DropDownOptions {
  let counts: Counts = {};
  for (const ft of g.fileTree.data) {
    for (const report of ft.raw_reports) {
      for (const [kind, arr] of Object.entries(report.kinds)) {
        let len = arr.length;
        if (counts[kind]) counts[kind] += len;
        else counts[kind] = len;
      }
    }
  }
  return counts_to_options(counts, ALL_KINDS);
}

type KindCheckerMap = { [key: string]: string };
export function gen_map(data: Basic) {
  // {"checker": ["kind1", "kind2"]} => {"kind1": "checker", "kind2": "checker"}
  let kind_checker_map: KindCheckerMap = {};
  for (const [ck, kinds] of Object.entries(data.kinds.mapping)) {
    for (const kind of kinds) {
      kind_checker_map[kind] = ck;
    }
  }
  return kind_checker_map;
}

function gen_checkers(kinds: DropDownOptions, map: KindCheckerMap): DropDownOptions {
  let counts: Counts = {};
  for (const [kind, count] of Object.entries(kinds.counts)) {
    const ck = map[kind];
    if (!ck) continue;
    if (counts[ck]) counts[ck] += count;
    else counts[ck] = count;
  }
  return counts_to_options(counts, ALL_CHECKERS);
}

export function gen_targets(targets: Targets): DropDownOptions {
  let counts: Counts = {};
  for (const { triple, count } of targets) {
    counts[triple] = count;
  }
  return counts_to_options(counts);
}

function gen_features(g: Get): { opt: DropDownOptions, has: boolean } {
  let counts: Counts = {};
  for (const data of g.fileTree.data) {
    for (const reports of data.raw_reports) {
      const feat = reports.features;
      const len = reports.count;
      if (counts[feat]) counts[feat] += len;
      else counts[feat] = len;
    }
  }
  // if no feat or only empty feat, treat it as no option
  const len = Object.entries(counts).length;
  const has_features = !(len === 0 || (len === 1 && counts[""]));
  // ALL_FEATURES_SETS must only apply to has non-empty features
  return {
    opt: has_features ? counts_to_options(counts, ALL_FEATURES_SETS) : emptyOptions(),
    has: has_features
  };
}

// filters update Get: got2 is updated in place; got is deep cloned

export function update_by_pkg(pkg: string, g: Get) {
  g.fileTree.data = g.fileTree.data.filter(val => val.pkg === pkg);
}

export function update_by_kind(kind: string, g: Get) {
  update_by_checker([kind], g);
}

/** for update_by_kind, pass [kind]; for update_by_checker, pass kinds */
export function update_by_checker(kinds: string[], g: Get) {
  const kinds_set = new Set(kinds);

  // deep copy due to got shouldn't be mutated
  for (const data of g.fileTree.data) {
    const reports = data.raw_reports;
    for (const r of reports) {
      let kinds_new: Kinds = {};
      let len = 0;
      for (const [kind, arr] of Object.entries(r.kinds)) {
        if (kinds_set.has(kind)) {
          kinds_new[kind] = arr;
          len += arr.length;
        }
      }
      // filter ck kinds only
      r.kinds = kinds_new;
      r.count = len;
    }
    // remove count==0 items and sort
    data.raw_reports = reports.filter(r => r.count !== 0).sort((a, b) => (b.count - a.count));
    data.count = data.raw_reports.reduce((acc, r) => acc + r.count, 0);
  }
  g.fileTree.data = g.fileTree.data.filter(d => d.count !== 0);
}

