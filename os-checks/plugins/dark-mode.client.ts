function get() { return localStorage.getItem("darkMode") ? true : false }

function toggle(dark: boolean) {
  document.querySelector("html")?.classList.toggle("my-app-dark", dark);
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', () => toggle(get()));
  return {
    provide: {
      darkMode: {
        get,
        toggle,
        store(dark: boolean) { localStorage.setItem("darkMode", dark ? "1" : "") },
      }
    }
  }
})


