<template>
  <TargetTable :data="workflowSelected" :dataColumns="workflowColumns" class="workflow-table" />

  <TargetTable :data="runSelected" :dataColumns="runColumns" class="workflow-table" />

  <Button label="Display" @click="click_visible" />
  <Dialog v-model:visible="visible" modal header="Github Action Workflows" :style="{ width: '70%' }">

    <Accordion :value="['0']" multiple>
      <AccordionPanel value="0">
        <AccordionHeader>Header I</AccordionHeader>
        <AccordionContent>

          <Timeline :value="events" align="top">
            <template #marker="slotProps">
              <span class="timeline-marker" :style="{ backgroundColor: slotProps.item.color }">
                <i :class="slotProps.item.icon"></i>
              </span>
            </template>
            <!-- <template #opposite="slotProps"> -->
            <!--   <small>{{ slotProps.item.date }}</small> -->
            <!-- </template> -->
            <template #content="{ item }">
              {{ item }}

              <!-- <Card> -->
              <!--   <template #title> -->
              <!--     {{ item.status }} -->
              <!--   </template> -->
              <!--   <template #subtitle> -->
              <!--     {{ item.date }} -->
              <!--   </template> -->
              <!--   <template #content> -->
              <!--     {{ item.icon }} -->
              <!--   </template> -->
              <!-- </Card> -->

            </template>
          </Timeline>

        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionHeader>Header II</AccordionHeader>
        <AccordionContent>
          <p class="m-0">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
            rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
            explicabo. Nemo enim
            ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
          </p>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="2">
        <AccordionHeader>Header III</AccordionHeader>
        <AccordionContent>
          <p class="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
            deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
            provident, similique sunt in culpa
            qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est
            et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo
            minus.
          </p>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>



  </Dialog>

</template>

<script setup lang="ts">
import type { Workflows } from '~/shared/workflows';

const visible = ref(true);
const click_visible = () => visible.value = !visible.value;

const events = ref([
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-times', color: 'red' },
]);

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

// https://github.com/os-checker/database/blob/debug/plugin/github-api/workflows/Byte-OS/polyhal.json

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
  flex: 0 !important;
}
</style>
