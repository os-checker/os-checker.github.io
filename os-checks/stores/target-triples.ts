import type { TargetTriples, Targets, Column, TargetOption } from "~/modules/types"

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    basic: null as TargetTriples | null,
    targets: [] as Targets,
    columns: [] as Column[],
    current: "x86_64-unknown-linux-gnu",
  }),
  getters: {},
  actions: {
    async fetch(): Promise<TargetOption[]> {
      const basic: TargetTriples = JSON.parse(await githubFetch({ path: "ui/target-triple.json" }) as string);
      this.basic = basic;
      this.columns = basic.kinds.columns;
      this.targets = basic.targets;
      return this.targets.map(target => ({ target }));
    },
    update(target: string) {
      this.current = target;
    }
  }
})
