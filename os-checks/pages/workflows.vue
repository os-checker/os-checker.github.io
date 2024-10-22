<template>
  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" class="workflow-table" />
</template>

<script setup lang="ts">
import type { Workflows } from '~/shared/workflows';

const data = ref<Workflows>();

githubFetch<Workflows>({
  path: "plugin/github-api/workflows/Byte-OS/polyhal.json"
}).then(wf => data.value = wf);

const workflowColumns = [
  { field: "idx", header: "Idx" },
  { field: "user", header: "User" },
  { field: "repo", header: "Repo" },
  { field: "runs_total_count", header: "Workflows Count" },
]

const workflowSelected = computed(() => {
  const val = data.value;
  if (!val) { return []; }
  return [{
    idx: 1,
    user: val.user,
    repo: val.repo,
    runs_total_count: val.runs_total_count,
  }]
});

const runColumns = [
  { field: "idx", header: "Idx" },
  { field: "user", header: "User" },
  { field: "repo", header: "Repo" },
  { field: "name", header: "Workflow Name" },
  { field: "title", header: "Title" },
  // { field: "head_commit_message", header: "Head Commit Message" },
  // { field: "head_commit_timestamp", header: "Head Commit Timestamp" },
  { field: "status", header: "Status" },
  { field: "conclusion", header: "Conclusion" },
  // { field: "run_attempt", header: "Attempt" },
  // { field: "run_started_at", header: "Started" },
  { field: "created_at", header: "Created" },
  { field: "duration_sec", header: "Seconds" },
  // { field: "updated_at", header: "Updated" },
]

function fmtDateTime(utc: string) {
  const date = new Date(utc);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const runSelected = computed(() => {
  const val = data.value;
  if (!val) { return []; }

  return val.workflows.map((wf, idx) => ({
    idx,
    user: val.user,
    repo: val.repo,
    name: wf.run.name,
    title: wf.run.display_title,
    status: wf.run.status,
    conclusion: wf.run.conclusion,
    run_attempt: wf.run.run_attempt,
    run_started_at: wf.run.run_started_at,
    created_at: fmtDateTime(wf.run.created_at),
    updated_at: wf.run.updated_at,
    duration_sec: wf.run.duration_sec,
    // head_commit_message: wf.run.head_commit.message,
    // head_commit_timestamp: wf.run.head_commit.timestamp,
  }));
});

</script>
