// 来自 route.params，即 /user/repo
// type UserRepo = { user: string | undefined, repo: string | undefined };

// 随路由页面变化返回相应的 basic.json 路径
export default function (): string {
  const basic_json = "ui/basic.json";
  const route = useRoute();
  const params = route.params;
  if (params) {
    const { user, repo } = params;
    return (user && repo) ? `ui/repos/${user}/${repo}/basic.json` : basic_json;
  } else {
    return basic_json;
  }
}
