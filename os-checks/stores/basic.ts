import type { Basic, Targets, Columns } from "~/shared/types"

export const useBasicStore = defineStore('targets', {
  state: () => ({
    basic: null as Basic | null,
    current: "x86_64-unknown-linux-gnu",
  }),

  getters: {
    targets(): Targets {
      return this.basic?.targets ?? [];
    },

    columns(): Columns {
      return this.basic?.kinds.columns ?? [];
    }
  },

  actions: {
    async fetch(): Promise<Targets> {
      this.basic = await githubFetch<Basic>({ path: "ui/basic.json" });
      return this.basic.targets;
    },

    update_current(target: string) {
      this.current = target;
    },

    init_with_and_subscribe_to_current(init: (target: string) => void): void {
      init(this.current);
      this.$subscribe((_, state) => init(state.current));
    },

    init_with_and_subscribe_to_current_and_columns(init: (target: string, columns: Columns) => void): void {
      init(this.current, this.columns);

      const { current, columns } = storeToRefs(this);
      watchEffect(() => init(current.value, columns.value));
    },
  }
})
