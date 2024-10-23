export type Workflows = {
  user: string,
  repo: string,
  runs_total_count: number,
  workflows: Workflow[]
};

export type HeadCommit = {
  message: string,
  timestamp: string,
}

export type Workflow = {
  run: {
    name: string,
    head_branch: string,
    head_sha: string,
    head_commit: HeadCommit,
    display_title: string,
    html_url: string,
    event: string,
    status: string,
    conclusion: string,
    run_attempt: number,
    run_started_at: string,
    created_at: string,
    updated_at: string,
    duration_sec: number,
    actor: {
      login: string,
    },
    triggering_actor: {
      login: string,
    },
    id: number,
    jobs_url: string,
    logs_url: string,
  },
  jobs: {
    total_count: number,
    jobs: Job[]
  }
};

export type Job = {
  name: string,
  // seems identical to run.name, not job name
  workflow_name: string,
  html_url: string,
  status: string,
  conclusion: string,
  created_at: string,
  started_at: string,
  completed_at: number,
  duration_sec: string,
  steps: Step[],
  id: number,
};

export type Step = {
  name: string,
  status: string,
  conclusion: string,
  number: number,
  started_at: string,
  completed_at: string,
  duration_sec: number,
}

export type Summary = {
  user: string,
  repo: string,
  // total count of workflow runs
  runs: number,
  last: null | LastWorkflow,
}

export type LastWorkflow = {
  created_at: string,
  // Find the updated_at timestamp of latest
  updated_at: string,
  // A substraction from above timestamps: p
  duration_sec: number,
  completed: boolean,
  success: boolean,
  head_branch: string,
  head_sha: string,
  head_commit: HeadCommit,
  workflows: Workflow[],
}

export function summary_to_workflows(summary: Summary ): Workflows {
  return {
    user: summary.user,
    repo: summary.repo,
    runs_total_count: summary.runs,
    workflows: summary.last?.workflows ?? []
  };
}
