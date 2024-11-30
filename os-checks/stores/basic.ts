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
      return this.basic?.kinds.columns ?? [];
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
      init(this.current, this.columns);

      const { current, columns } = storeToRefs(this);
      const basic = reactive({ current, columns });
      watch(basic, (val, old) => {
        if (!val.current.value) return;

        // 下拉框更新导致数据变化，因此如果所选 target 和列相同，不要初始化获取表格数据。
        // 列变化的情况是从 [] 到 [all checkers]。
        if (val.current.value === old.current.value && val.columns.value === old.columns.value) return;

        init(val.current.value, val.columns.value);
      });
    },
  }
})
