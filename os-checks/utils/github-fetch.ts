type Github = {
  repo?: string,
  branch?: string,
  path: string
}

export default function (github: Github) {
  const repo = github.repo || "os-checker.github.io";
  const branch = github.branch || "main";
  const url = `https://raw.githubusercontent.com/os-checker/${repo}/ui/${branch}/${github.path}`;
  return useFetch(url, {
    // 构造简单请求来解决跨域问题（同时 github raw 资源支持所有源）
    "headers": { "content-type": "text/plain" },
    "body": null,
    "method": "GET"
  });
}
