<template>
  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" class="workflow-table" />

  <Button label="Display" @click="click_visible" />
  <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '70%' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="username" class="font-semibold w-24">Username</label>
      <InputText id="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="email" class="font-semibold w-24">Email</label>
      <InputText id="email" class="flex-auto" autocomplete="off" />

    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
      <Button type="button" label="Save" @click="visible = false"></Button>
    </div>

    <p class="mb-8">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p class="mb-8">
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
      enim
      ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
      ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
      adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
      voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
      aliquid
      ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
      molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
    </p>
    <p class="mb-8">
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
      corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
      culpa
      qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
      expedita
      distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod
      maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
      quibusdam
      et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae
      non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias
      consequatur aut perferendis doloribus asperiores repellat.
    </p>
    <p class="mb-8">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p class="mb-8">
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
      enim
      ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
      ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
      adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
      voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
      aliquid
      ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
      molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
    </p>
    <p>
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
      corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
      culpa
      qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
      expedita
      distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod
      maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem
      quibusdam
      et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae
      non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias
      consequatur aut perferendis doloribus asperiores repellat.
    </p>
  </Dialog>

</template>

<script setup lang="ts">
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
    idx,
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
    // head_commit_message: wf.run.head_commit.message,
    // head_commit_timestamp: wf.run.head_commit.timestamp,
  }));
});

</script>
