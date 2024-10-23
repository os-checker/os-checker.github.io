<template>
  <div style="padding: 10px;">
    Repo:
    <!-- <Select v-model="selectedRepo" filter :options="repos" :optionLabel="label" /> -->
    <MultiSelect v-model="selectedRepo" display="chip" :options="repos" :optionLabel="label" filter
      :maxSelectedLabels="3" placeholder="Select Repos" />
  </div>

  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" :rowSelect="onRowSelectedJob" class="workflow-table" />

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

    <div v-if="jobsInfo" style="display: flex; justify-content: space-evenly; margin: 5px 10px; gap: 20px;">
      <WorkflowRatioCard title="Jobs" :data="jobsInfo.jobs" />
      <WorkflowRatioCard title="Steps" :data="jobsInfo.steps" />
    </div>

    <Accordion :value="jobsIdx" multiple>
      <AccordionPanel v-for="(job, idx) in jobs" :key="job.job.id" :value="idx.toString()">
        <AccordionHeader>
          <Tag :value="idx + 1" :severity="job.job_tag"></Tag>
          <b> {{ job.job.name }} </b>
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
            Job:
            <NuxtLink :to="job.job.html_url" target="_blank">
              {{ job.job.html_url }}
            </NuxtLink>
          </div>

        </AccordionContent>
      </AccordionPanel>
    </Accordion>

  </Dialog>

</template>

<script setup lang="ts">
import type { DataTableRowSelectEvent } from 'primevue/datatable';
import type { Workflows, Summary } from '~/shared/workflows';

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
  data.value = {
    user: latest.user,
    repo: latest.repo,
    runs_total_count: latest.runs,
    workflows: latest.last?.workflows ?? []
  };
});

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
  return selectedSummaries.value.map((val, idx) => ({
    idx: idx + 1,
    user: val.user,
    repo: val.repo,
    history: val.runs,
    completed: val.last?.completed ? "✅" : (val.runs ? "❌" : ""),
    success: val.last?.success ? "✅" : (val.runs ? "❌" : ""),
    head_branch: val.last?.head_branch ?? "",
    updated_at: val.last?.updated_at ?? "",
    duration_sec: val.last?.duration_sec ?? null,
  }));
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

// https://github.com/os-checker/database/blob/debug/plugin/github-api/workflows/Byte-OS/polyhal.json

function icon(status: string, conclusion: string) {
  if (status === "completed") {
    if (conclusion === "success") {
      return { icon: "pi pi-check", color: "#607D8B" };
    }
  }
  return { icon: "pi pi-times", color: "red" };
}

const selectedJob = ref<{ workflow_idx: number, run_name: string } | null>();
function onRowSelectedJob(event: DataTableRowSelectEvent) {
  // @rowSelect="onRowSelect"
  const run_id = event.data.id;
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
    return {
      job,
      job_success,
      job_tag: job_success ? "success" : "danger",
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

const green = ref("green");
const red = ref("red");
onMounted(() => {
  // 获取元素的计算后的样式
  const styles = window.getComputedStyle(document.documentElement);

  // 获取CSS变量的值
  green.value = styles.getPropertyValue('--p-emerald-500').trim();
  red.value = styles.getPropertyValue('--p-red-500').trim();
});

const jobsInfo = computed(() => {
  const val = data.value;
  const workflow_idx = selectedJob.value?.workflow_idx ?? null;
  if (!val || (workflow_idx === null)) { return null }

  const j = val.workflows[workflow_idx].jobs;
  const jj = val.workflows[workflow_idx].jobs.jobs;

  const total_jobs = j.total_count;
  const completed_jobs = jj.filter(job => job.status === "completed").length;
  const success_jobs = jj.filter(job => job.conclusion === "success").length;

  const total_steps = sum(jj.map(job => job.steps.length));
  const completed_steps = sum(jj.map(job => job.steps.filter(step => step.status === "completed").length));
  const success_steps = sum(jj.map(job => job.steps.filter(step => step.conclusion === "success").length));

  return {
    jobs: {
      total: total_jobs,
      completed: completed_jobs,
      completed_ratio: Math.round((completed_jobs / total_jobs) * 100),
      completed_color: (completed_jobs === total_jobs) ? green.value : red.value,
      success: success_jobs,
      successs_ratio: Math.round((success_jobs / total_jobs) * 100),
      success_color: (success_jobs === total_jobs) ? green.value : red.value,
    },
    steps: {
      total: total_steps,
      completed: completed_steps,
      completed_ratio: Math.round((completed_steps / total_steps) * 100),
      completed_color: (completed_steps === total_steps) ? green.value : red.value,
      success: success_steps,
      successs_ratio: Math.round((success_steps / total_steps) * 100),
      success_color: (success_steps === total_steps) ? green.value : red.value,
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
  grid-template-columns: 6fr 3fr 0.5fr;
}

.timeline-title {
  margin-left: 12px;
}

.timeline-timestamp {
  font-size: small;
  color: gray;
  justify-self: end;
}
</style>
