<template>
  <div style="padding: 16px; display: flex; justify-content: space-between; ">
    <div>
      Repo:
      <MultiSelect v-model="selectedRepo" display="chip" :options="repos" :optionLabel="label" filter
        :maxSelectedLabels="3" placeholder="Select Repos" />
    </div>

    <Message severity="secondary">
      Repo Count: {{ summariesInfo.total_repos }} in total, {{ summariesInfo.good }} good, and
      {{ summariesInfo.zero_history }} with zero history
    </Message>
  </div>

  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" :rowSelect="onRowSelectedWorkflow"
    class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" :rowSelect="onRowSelectedJobs" class="workflow-table" />

  <Dialog v-model:visible="visible" modal :style="{ width: '70%' }">
    <template #header>
      <span style="display: inline-flex; justify-content: center; gap: 40px; font-size: large;">
        <div>
          <NuxtLink :to="dialogHeader.repo_url" target="_blank">
            <Tag icon="pi pi-github" severity="info">
              {{ dialogHeader.repo }}
            </Tag>
          </NuxtLink>
        </div>

        <div>
          <NuxtLink :to="dialogHeader.run_url" target="_blank">
            <Tag icon="pi pi-external-link" severity="contrast">
              {{ dialogHeader.run_name }}
            </Tag>
          </NuxtLink>
        </div>

        <div><b>{{ dialogHeader.title }}</b></div>
      </span>
    </template>

    <div v-if="jobsInfo" style="display: flex; justify-content: space-evenly; margin: 5px 50px 5px 0px; gap: 20px;">
      <WorkflowRatioCard title="Jobs" :data="jobsInfo.jobs" />
      <WorkflowRatioCard title="Steps" :data="jobsInfo.steps" />
    </div>

    <Accordion :value="jobsIdx" multiple>
      <AccordionPanel v-for="(job, idx) in jobs" :key="job.job.id" :value="idx.toString()">
        <AccordionHeader>
          <Tag :value="idx + 1" :severity="job.job_tag" style="flex-grow: 0"></Tag>
          <b style="font-size: large; flex-grow: 1; text-align: center;"> {{ job.job.name }} </b>
          <span style="flex-grow: 0; margin-right: 5px; font-size: smaller;">
            ( {{ job.job_duration_sec }} secs )
          </span>
        </AccordionHeader>

        <AccordionContent>
          <Timeline :value="job.steps" class="timeline-event">
            <template #marker="slotProps">
              <span class="timeline-marker" :style="{ backgroundColor: slotProps.item.icon.color }">
                <i :class="slotProps.item.icon.icon"></i>
              </span>
            </template>

            <template #content="{ item: { step } }">
              <Avatar :label="step.number.toString()" shape="circle" />

              <span class="timeline-steps">
                <span class="timeline-title"> {{ step.name }} </span>
                <span class="timeline-timestamp">
                  {{ `${fmtDateTime(step.started_at)} ~ ${fmtDateTime(step.completed_at)}` }}
                </span>
                <span class="timeline-timestamp">
                  {{ `[ ${step.duration_sec}s ]` }}
                </span>
              </span>

            </template>
          </Timeline>

          <div style="padding: 20px 30px;">
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0;">
              Job:
              <Message severity="info">
                <NuxtLink :to="job.job.html_url" target="_blank">
                  {{ job.job.html_url }}
                </NuxtLink>
              </Message>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              Log:
              <Message severity="warn">
                {{ `gh api /repos/${data?.user}/${data?.repo}/actions/jobs/${job.job.id}/logs | less -R` }}
              </Message>
            </div>
          </div>

        </AccordionContent>
      </AccordionPanel>
    </Accordion>

  </Dialog>

  <div style="padding-top: 20px; padding-left: 10px;">
    使用说明：第 1 个表为仓库 Github Action 总运行数和最近更新的情况；

    点击第 1 个表的一行，则更新第 2 个 Workflow 明细情况表；

    点击第 2 个明细表的一行，则弹出具体 Jobs 的运行情况。
  </div>
</template>

<script setup lang="ts">
import type { DataTableRowSelectEvent } from 'primevue/datatable';
import { type Workflows, type Summary, summary_to_workflows } from '~/shared/workflows';

const { color } = storeToRefs(useStyleStore());

const visible = ref(false);

type Header = { repo: string, repo_url: string, run_name: string, run_url: string, title: string };
const dialogHeader = ref<Header>({ repo: "", repo_url: "", run_name: "", run_url: "", title: "" });

const data = ref<Workflows>();

const selectedSummaries = ref<Summary[]>([]);

const summaries = ref<Summary[]>([]);

githubFetch<Summary[]>({
  path: "plugin/github-api/workflows/summaries.json"
}).then(val => {
  summaries.value = val;
  selectedSummaries.value = val;

  const latest = val[0];
  if (!latest) { return; }
  // githubFetch<Workflows>({
  //   path: `plugin/github-api/workflows/${latest.user}/${latest.repo}.json`
  // }).then(wf => data.value = wf);

  // 暂时只显示最新的 workflows
  data.value = summary_to_workflows(latest);
});

const summariesInfo = computed(() => {
  const val = summaries.value;
  const total_repos = val.length;
  const zero_history = val.reduce((acc, cur) => {
    if (cur.runs === 0) { acc += 1; }
    return acc;
  }, 0);
  return { total_repos, zero_history, good: total_repos - zero_history };
});

function onRowSelectedWorkflow(event: DataTableRowSelectEvent) {
  const user = event.data.user;
  const repo = event.data.repo;
  const found = selectedSummaries.value.find(val => val.user === user && val.repo === repo);
  if (!found) { return; }
  data.value = summary_to_workflows(found);

  // pop up if there is only one workflow
  const workflows = found.last?.workflows;
  if (workflows && workflows.length === 1) {
    selectJobs(workflows[0].run.id);
  }
}

type Repo = { idx: number, user: string, repo: string };
const label = ({ user, repo }: Repo) => `${user} / ${repo}`;
const repos = computed<Repo[]>(() => summaries.value.map((val, idx) => ({ idx, user: val.user, repo: val.repo })));

const selectedRepo = ref<Repo[] | null>(null);
watch(selectedRepo, (selected_repos) => {
  const arr = summaries.value;

  if (!selected_repos || selected_repos.length === 0) {
    selectedSummaries.value = arr;
    return;
  }

  let res = [];
  for (let value of selected_repos) {
    res.push(arr[value.idx]);
  }
  selectedSummaries.value = res;
});

const workflowColumns = [
  { field: "idx", header: "Idx" },
  { field: "user", header: "User" },
  { field: "repo", header: "Repo" },
  { field: "history", header: "History" },
  { field: "updated_at", header: "Updated" },
  { field: "completed", header: "Completed" },
  { field: "success", header: "Success" },
  { field: "head_branch", header: "Branch" },
  { field: "duration_sec", header: "Duration(s)" },
]

const workflowSelected = computed(() => {
  return selectedSummaries.value.map((val, idx) => {
    let updated_at = "";
    if (val.last?.updated_at) {
      updated_at = fmtDateTime(val.last?.updated_at);
    }

    return {
      idx: idx + 1,
      user: val.user,
      repo: val.repo,
      history: val.runs,
      completed: val.last?.completed ? "✅" : (val.runs ? "❌" : ""),
      success: val.last?.success ? "✅" : (val.runs ? "❌" : ""),
      head_branch: val.last?.head_branch ?? "",
      updated_at,
      duration_sec: val.last?.duration_sec ?? null,
    }
  });
});

const runColumns = [
  { field: "idx", header: "Idx" },
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
  { field: "duration_sec", header: "Duration(s)" },
  // { field: "updated_at", header: "Updated" },
]

const runSelected = computed(() => {
  const val = data.value;
  if (!val) { return []; }

  return val.workflows.map((wf, idx) => ({
    idx: idx + 1,
    repo: `${val.user}/${val.repo}`,
    name: wf.run.name,
    title: wf.run.display_title,
    status: wf.run.status,
    conclusion: wf.run.conclusion,
    run_attempt: wf.run.run_attempt,
    run_started_at: wf.run.run_started_at,
    created_at: fmtDateTime(wf.run.created_at),
    updated_at: wf.run.updated_at,
    duration_sec: wf.run.duration_sec,
    id: wf.run.id,
    // head_commit_message: wf.run.head_commit.message,
    // head_commit_timestamp: wf.run.head_commit.timestamp,
  }));
});

function icon(status: string, conclusion: string | null) {
  if (status === "completed") {
    switch (conclusion) {
      case "success": return { icon: "pi pi-check", color: "#607D8B" };
      case "skipped": return { icon: "pi pi-filter-slash", color: "#807D8B" };
    }
  }
  return { icon: "pi pi-times", color: color.value.red };
}

const selectedJob = ref<{ workflow_idx: number, run_name: string } | null>();
function onRowSelectedJobs(event: DataTableRowSelectEvent) {
  selectJobs(event.data.id);
}

function selectJobs(run_id: number) {
  const val = data.value;
  if (!val) { return; }

  const workflows = val.workflows;
  const workflow_idx = workflows.findIndex(wf => wf.run.id === run_id);
  const workflow = workflows[workflow_idx];
  if (!workflow) { return; }

  const run_name = workflow.run.name;
  selectedJob.value = { workflow_idx, run_name };
  const title = workflow.run.display_title;
  const repo = `${val.user}/${val.repo}`;
  const repo_url = `https://github.com/${repo}`;
  const run_url = workflow.run.html_url;
  dialogHeader.value = { repo, repo_url, run_name, run_url, title };
  visible.value = true;
}

const jobs = computed(() => {
  const val = data.value;
  const selected_job = selectedJob.value;
  if (!val || !selected_job) { return [] }

  return val.workflows[selected_job.workflow_idx]?.jobs.jobs.map(job => {
    const job_success = job.conclusion === "success";
    const job_duration_sec = job.steps.reduce((acc, step) => acc + step.duration_sec, 0);

    return {
      job,
      job_success,
      job_tag: job_success ? "success" : "danger",
      job_duration_sec,
      steps: job.steps.map(step => ({ step, icon: icon(step.status, step.conclusion) })),
      icon: icon(job.status, job.conclusion),
    };
  }) ?? [];
});

const jobsIdx = computed(() => {
  return jobs.value.reduce((acc, j, index) => {
    if (!j.job_success) { acc.push(index.toString()); }
    return acc;
  }, [] as string[]);
});

function sum(arr: any) {
  // @ts-ignore
  return arr.reduce((accumulator, currentNumber) => accumulator + currentNumber, 0);
};

const jobsInfo = computed(() => {
  const val = data.value;
  const workflow_idx = selectedJob.value?.workflow_idx ?? null;
  if (!val || (workflow_idx === null)) { return null }

  const j = val.workflows[workflow_idx].jobs;
  const jj = val.workflows[workflow_idx].jobs.jobs;

  const is_success = (s: string | null) => s === "success" || s === "skipped";

  const total_jobs = j.total_count;
  const completed_jobs = jj.filter(job => job.status === "completed").length;
  const success_jobs = jj.filter(job => is_success(job.conclusion)).length;

  const total_steps = sum(jj.map(job => job.steps.length));
  const completed_steps = sum(jj.map(job => job.steps.filter(step => step.status === "completed").length));
  const success_steps = sum(jj.map(job => job.steps.filter(step => is_success(step.conclusion)).length));

  return {
    jobs: {
      total: total_jobs,
      completed: completed_jobs,
      completed_ratio: Math.round((completed_jobs / total_jobs) * 100),
      completed_color: (completed_jobs === total_jobs) ? color.value.green : color.value.red,
      success: success_jobs,
      successs_ratio: Math.round((success_jobs / total_jobs) * 100),
      success_color: (success_jobs === total_jobs) ? color.value.green : color.value.red,
    },
    steps: {
      total: total_steps,
      completed: completed_steps,
      completed_ratio: Math.round((completed_steps / total_steps) * 100),
      completed_color: (completed_steps === total_steps) ? color.value.green : color.value.red,
      success: success_steps,
      successs_ratio: Math.round((success_steps / total_steps) * 100),
      success_color: (success_steps === total_steps) ? color.value.green : color.value.red,
    }
  }
});

</script>

<style lang="css">
.timeline-marker {
  display: flex;
  width: 2rem;
  /* Tailwind CSS 默认使用rem单位，这里8对应于2rem */
  height: 2rem;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 9999px;
  /* Tailwind CSS的rounded-full类使用一个非常大的值来创建圆形 */
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  /* Tailwind CSS的shadow-sm类定义了轻微的阴影效果 */
}

.p-timeline-event-opposite {
  /* eliminate the left hand side */
  flex: 0 !important;
}

.timeline-event {
  --p-timeline-event-min-height: 2.8rem;
}

.timeline-steps {
  display: inline-grid;
  grid-template-columns: minmax(500px, 60%) minmax(280px, 3fr) minmax(80px, 0.5fr);
}

.timeline-title {
  margin-left: 12px;
}

.timeline-timestamp {
  font-size: small;
  color: gray;
  justify-self: end;
}

.p-card-body {
  padding: 0.4rem !important;
  gap: 0 !important
}
</style>
