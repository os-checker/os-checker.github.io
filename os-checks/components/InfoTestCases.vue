<template>

  <DataTable :value="data" showGridlines style="margin-top: 10px">
    <template #empty><b> No testcases found. </b></template>

    <Column field="idx" header="Idx" />
    <Column field="binary_name" header="Binary Name" />
    <Column field="kind" header="Kind" />
    <Column field="test_name" header="Test Case" />
    <Column field="status" header="Status" style="text-align: center;" />
    <Column field="duration_ms" header="Duration (ms)" style="text-align: right" />

  </DataTable>

</template>

<script setup lang="ts">
import type { Test } from '~/shared/info';

const { tests } = defineProps<{ tests: Test[] }>();

const data = computed(() => {
  let idx = 0;
  return tests.map(test => {
    return test.testcases.map(t => {
      idx += 1;
      let status = t.status;
      switch (t.status) {
        case "ok": { status = "✅"; break; }
        case "failed": { status = "❌"; break; }
      }
      return {
        idx,
        binary_name: test.binary_name,
        kind: test.kind,
        test_name: t.name,
        status,
        duration_ms: t.duration_ms,
      }
    })
  }).flat();
});
</script>
