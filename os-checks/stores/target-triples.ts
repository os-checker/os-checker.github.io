type TargetTriples = string[];
type TargetOption = { target: string };

export const useTargetsStore = defineStore('targets', {
  state: () => ({
    targets: [] as TargetTriples,
  }),
  actions: {
    async fetch(): Promise<TargetOption[]> {
      this.targets = JSON.parse(await githubFetch({ path: "ui/target-triple.json" }) as string);
      return this.targets.map(target => ({ target }));
    }
  }
})
