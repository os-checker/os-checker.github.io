type Github = {
  repo?: string,
  branch?: string,
  path: string
}

// 当构建期间设置了 DEBUG 环境变量，则去 debug 分支而不是 main 分支拉取数据
function defaultBranch(): string {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.debug ? "debug" : "main";
}

// https://raw.githubusercontent.com/os-checker/os-checker.github.io/main/os-checks/public/test_raw_reports.json
export default function <T>(github: Github): Promise<T> {
  const repo = github.repo || "database";
  const branch = github.branch || defaultBranch();
  const url = `https://raw.githubusercontent.com/os-checker/${repo}/${branch}/${github.path}`;
  return $fetch(url, {
    // 构造简单请求来解决跨域问题（同时 github raw 资源支持所有源）
    "headers": { "content-type": "text/plain" },
    "body": null,
    "method": "GET",
    parseResponse: JSON.parse
  });
}
