/**  查询 */
function prefer() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** 优先本地存储的 darkMode；如果没有点击过主题按钮来保存过 darkMode，那么遵照系统/浏览器明暗设置。*/
function load() {
  const dark = localStorage.getItem("darkMode");
  if (dark === "1") {
    return true;
  } else if (dark === "0") {
    return false;
  } else if (prefer()) {
    return true;
  } else {
    return false;
  }
}

/** 渲染深浅主题 */
function toggle(dark: boolean) {
  document.querySelector("html")?.classList.toggle("my-app-dark", dark);
}

const loaded = load();

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', () => {
    // 监听系统/浏览器明暗变化
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => toggle(event.matches));

    toggle(loaded);
  });
  return {
    provide: {
      darkMode: {
        init: loaded,
        load,
        prefer,
        toggle,
        store(dark: boolean) { localStorage.setItem("darkMode", dark ? "1" : "0") },
      }
    }
  }
})


