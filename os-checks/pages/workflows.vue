<template>
  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" :rowSelect="onRowSelectedJob" class="workflow-table" />

  <Button label="Display" @click="click_visible" />
  <Dialog v-model:visible="visible" modal header="Github Action Workflows" :style="{ width: '70%' }">
    <div v-if="jobsInfo">
      {{ jobsInfo }}
    </div>

    <Accordion :value="jobsIdx" multiple>
      <AccordionPanel v-for="(job, idx) in jobs" :key="job.job.id" :value="idx.toString()">
        <AccordionHeader>
          <Tag :value="idx + 1"></Tag>
          <b> {{ job.job.workflow_name }}</b>
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

          <Card style="padding: 10px 18px;">
            <template #content>
              Job:
              <NuxtLink :to="job.job.html_url" target="_blank">
                {{ job.job.html_url }}
              </NuxtLink>
            </template>
          </Card>

        </AccordionContent>
      </AccordionPanel>
    </Accordion>

  </Dialog>

</template>

<script setup lang="ts">
import type { DataTableRowSelectEvent } from 'primevue/datatable';
import type { Workflows } from '~/shared/workflows';

const visible = ref(true);
const click_visible = () => visible.value = !visible.value;

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
  selectedJob.value = workflows[workflow_idx] ? ({ workflow_idx, run_name: workflows[workflow_idx].run.name }) : null;
  visible.value = true;
}

const jobs = computed(() => {
  const val = data.value;
  const selected_job = selectedJob.value;
  if (!val || !selected_job) { return [] }

  return val.workflows[selected_job.workflow_idx]?.jobs.jobs.map(job => {
    return {
      run_name: selected_job.run_name,
      job, icon: icon(job.status, job.conclusion),
      steps: job.steps.map(step => ({ step, icon: icon(step.status, step.conclusion) }))
    };
  }) ?? [];
});

const jobsIdx = computed(() => [...Array(jobs.value.length).keys().map(x => x.toString())]);

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
  return {
    jobs: {
      total: j.total_count,
      completed: jj.filter(job => job.status === "completed").length,
      success: jj.filter(job => job.conclusion === "success").length,
    },
    steps:
    {
      total: sum(jj.map(job => job.steps.length)),
      completed: sum(jj.map(job => job.steps.filter(step => step.status === "completed").length)),
      success: sum(jj.map(job => job.steps.filter(step => step.conclusion === "success").length)),

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
