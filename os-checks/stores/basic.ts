import type { Basic, Targets, Columns, TargetOption } from "~/shared/types"

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
    }
  }
})
