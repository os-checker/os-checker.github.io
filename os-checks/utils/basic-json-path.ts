import type { UserRepo } from "~/shared/types"

export default function ({ user, repo }: UserRepo): string {
  return (user && repo) ? `ui/repos/${user}/${repo}/basic.json` : "ui/basic.json";
}
