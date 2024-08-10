type Github = {
  repo?: string,
  branch?: string,
  path: string
}

// https://raw.githubusercontent.com/os-checker/os-checker.github.io/main/os-checks/public/test_raw_reports.json
export default function (github: Github) {
  const repo = github.repo || "os-checker.github.io";
  const branch = github.branch || "main";
  const url = `https://raw.githubusercontent.com/os-checker/${repo}/${branch}/${github.path}`;
  return useFetch(url, {
    // 构造简单请求来解决跨域问题（同时 github raw 资源支持所有源）
    "headers": { "content-type": "text/plain" },
    "body": null,
    "method": "GET"
  });
}
