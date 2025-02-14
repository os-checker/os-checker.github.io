<script lang="ts" setup>
import type { DropDownOptions } from '~/shared/file-tree/types';

type Props = { tag: string, counts: DropDownOptions, all: string };
const { tag, counts } = defineProps<Props>();
const selected = defineModel<string | null>({ default: null });
</script>

<template>

  <span class="input">{{ tag }}:</span>
  <span class="select">
    <Select v-model="selected" filter showClear :options="counts.names">
      <template #option="{ option }">
        <Tag severity="danger" class="drop-down-options">{{ counts.counts[option] }}</Tag>
        {{ option }}
      </template>

      <!-- <template #value="{ value }"> -->
      <!--   {{ value || all }} -->
      <!--   <Tag severity="danger" style="margin-left: 5px">{{ counts.counts[value || all] }}</Tag> -->
      <!-- </template> -->
    </Select>
  </span>

</template>

<style scoped>
.input {
  font-size: 14.5px;
  font-weight: bold;
  padding-right: 10px;
  color: var(--p-button-primary-background);
}

.select {
  padding-right: 10px;
}

.resolved-table {
  --p-datatable-header-cell-color: var(--p-button-primary-background);
}

.sources {
  color: var(--p-orange-400);
}

.sources-table {
  --p-datatable-header-cell-color: var(--p-orange-400);
}

.drop-down-options {
  margin-right: 8px;
  width: 40px;
  justify-content: right;
}
</style>
