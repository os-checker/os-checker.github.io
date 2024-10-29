<template>

  <DataTable :value="data" showGridlines>

    <Column field="idx" header="Idx" />
    <Column field="binary_name" header="Binary Name" />
    <Column field="kind" header="Kind" />
    <Column field="test" header="Test Case" />

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
      return {
        idx,
        binary_name: test.binary_name,
        kind: test.kind,
        test: t,
      }
    })
  }).flat();
});
</script>
