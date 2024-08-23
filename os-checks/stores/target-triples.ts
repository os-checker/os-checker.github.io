type TargetTriples = string[];
type TargetOption = { target: string };

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    targets: [] as TargetTriples,
    current: "x86_64-unknown-linux-gnu",
  }),
  actions: {
    async fetch(): Promise<TargetOption[]> {
      this.targets = JSON.parse(await githubFetch({ path: "ui/target-triple.json" }) as string);
      return this.targets.map(target => ({ target }));
    },
    update(target: string) {
      this.current = target;
    }
  }
})
