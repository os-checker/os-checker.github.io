/** 
* display: should a column be shown
* name: columns name which may contain `-` to soft wrap the words
* option: option name which is shown in selection columns
*/
export type Col = { display: boolean, name: string, option: string };

export class Cols {
  columns: { [key: string]: Col };
  defaultColumns: string[];
  cols: { [key: string]: Col };

  // static columns: { [key: string]: Col } = {};
  // static defaultColumns: string[] = [];
  static full = "[Columns] Full";
  static slimmed = "[Columns] Default (Slimmed)";

  constructor(columns: { [key: string]: Col }, defaultColumns: string[]) {
    this.columns = columns;
    this.defaultColumns = defaultColumns;
    this.cols = columns;
  }

  display(col: string) {
    return this.cols[col]?.display ?? false;
  }

  name(col: string) {
    return this.cols[col]?.name ?? "";
  }

  options() {
    return [Cols.full, Cols.slimmed, ...Object.keys(this.columns)];
  }

  option(opt: string): string {
    if (opt === Cols.full) {
      return Cols.full;
    } else if (opt === Cols.slimmed) {
      return Cols.slimmed;
    }
    return this.columns[opt]?.option ?? "";
  }

  setDefaultColumns() {
    const default_columns = new Set(this.defaultColumns);
    for (const col of Object.keys(this.cols)) {
      this.cols[col].display = default_columns.has(col);
    }
  }

  setDisplay(cols: string[]) {
    if (cols.length === 0) {
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
      this.defaultColumns : [];
    const set = new Set([...cols, ...default_columns]);

    for (const col of Object.keys(this.cols)) {
      this.cols[col].display = set.has(col);
    }
  }
}

