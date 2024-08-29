import type { TargetTriples, Targets, Column, TargetOption } from "~/modules/types"

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    basic: null as TargetTriples | null,
    current: "x86_64-unknown-linux-gnu",
  }),
  getters: {
    targets(): Targets {
      return this.basic?.targets ?? [];
    },
    columns(): Column[] {
      return this.basic?.kinds.columns ?? [];
    }
  },
  actions: {
    async fetch(): Promise<TargetOption[]> {
      this.basic = await githubFetch<TargetTriples>({ path: "ui/target-triple.json" });
      return this.basic.targets.map(target => ({ target }));
    },
    update_current(target: string) {
      this.current = target;
    }
  }
})
