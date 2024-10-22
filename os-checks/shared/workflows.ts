export type Workflows = {
  user: string,
  repo: string,
  runs_total_count: number,
  workflows: Workflow[]
};

export type Workflow = {
  run: {
    name: string,
    head_branch: string,
    head_sha: string,
    head_commit: {
      message: string,
      timestamp: string,
    },
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

