import type { Basic, Targets, Columns } from "~/shared/types"

export const useBasicStore = defineStore('targets', {
  state: () => ({
    basic: null as Basic | null,
    current: "All-Targets",
  }),

  getters: {
    targets(): Targets {
      return this.basic?.targets ?? [];
    },

    columns(): Columns {
      const order = this.basic?.kinds.order;
      if (!order) return [];
      return order.map(kind => {
        let val = kind;
        if (kind === "Clippy(Warn)") {
          val = "Clippy (Warn)";
        } else if (kind === "Clippy(Error)") {
          val = "Clippy (Error)"
        } else if (kind === "Lockbud(Possibly)") {
          val = "Lockbud (Possibly)"
        } else if (kind === "Lockbud(Probably)") {
          val = "Lockbud (Probably)"
        }
        return { field: kind, header: val };
      });
    }
  },

  actions: {
    async fetch(): Promise<Targets> {
      const path = basicJsonPath();
      this.basic = await githubFetch<Basic>({ path });
      return this.basic.targets;
    },

    update_current(target: string) {
      // 只在 target 不同时更新，否则会造成不必要的响应
      if (target !== this.current) {
        // console.log(target, this.current);
        this.current = target;
      }
    },

    init_with_and_subscribe_to_current(init: (target: string) => void): void {
      // init(this.current);
      this.$subscribe((_, state) => init(state.current));
    },

    init_with_and_subscribe_to_current_and_columns(init: (target: string, columns: Columns) => void): void {
      // init(this.current, this.columns);

      const { current, columns } = storeToRefs(this);
      watchEffect(() => init(current.value, columns.value));
    },
  }
})
