export type DropDownOptions = { counts: Counts, names: string[] };
export type Counts = { [key: string]: number };

export const ALL_PKGS = "All-Pkgs";
export const ALL_CHECKERS = "All-Checkers";
export const ALL_KINDS = "All-Kinds";

export function emptyOptions(): DropDownOptions {
  return { counts: {}, names: [] };
}

/// * extract keys from Counts but descending sort by the number */
export function counts_to_options(counts: Counts, all: string): DropDownOptions {
  // insert ALL key
  counts[all] = Object.values(counts).reduce((acc, c) => acc + c, 0);
  // descending sort by count and then name
  const names = Object.entries(counts)
    .sort((a, b) => {
      const cmp_count = b[1] - a[1];
      if (cmp_count === 0) return a[0].localeCompare(b[0]);
      return cmp_count
    })
    .map(ele => ele[0]);
  return { counts, names };
}
