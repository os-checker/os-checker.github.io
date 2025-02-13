<script lang="ts" setup>
import type { SelectChangeEvent } from 'primevue/select';
import type { DropDownOptions } from '~/shared/file-tree/types';

type Props = { tag: string, counts: DropDownOptions, all: string };
const { tag, counts, all } = defineProps<Props>();
const selected = defineModel({ default: "" });

const emit = defineEmits<{
  (e: 'change', isClear: boolean): void
}>();

const change = ref<null | SelectChangeEvent>(null);
watch(change, event => {
  const val = event?.value;
  console.log("DropDownWithCount: ", val);
  // null means the option is cleared, all means All* option is chosen
  // both result in same behavior
  emit("change", val === null || val === all);
});
// const change = defineModel("change", { default: null });
</script>

<template>

  <span class="input">{{ tag }}:</span>
  <span class="select">
    <Select v-model="selected" filter showClear :options="counts.names" @change="(val) => change = val">
      <!-- <Select v-model="selected" filter showClear :options="counts.names"> -->
      <template #option="{ option }">
        <Tag severity="danger" class="drop-down-options">{{ counts.counts[option] }}</Tag>
        {{ option }}
      </template>

      <template #value="{ value }">
        {{ value || all }}
        <Tag severity="danger" style="margin-left: 5px">{{ counts.counts[value || all] }}</Tag>
      </template>
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
