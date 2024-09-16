
export const useDataThemeStore = defineStore('data-theme', {
  state: () => ({
    darkMode: null as Boolean | null
  }),
  actions: {
    update_dark_mode(dark: boolean) {
      this.darkMode = dark;
    }
  }
});
