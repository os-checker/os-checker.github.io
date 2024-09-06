import type { UserRepo } from "~/shared/types"

export default function (params: UserRepo | undefined): string {
  const basic_json = "ui/basic.json";
  if (params) {
    const { user, repo } = params;
    return (user && repo) ? `ui/repos/${user}/${repo}/basic.json` : basic_json;
  } else {
    return basic_json;
  }
}
