<template>
  <div>
    <!-- NOTE: choosing large page options will render slow and consume more memory -->
    <DataTable :value="data" paginator :rows="rowsPerPage" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]"
      stripedRows selectionMode="single" v-model:selection="selected" removableSort sortMode="multiple" scrollable
      :scrollHeight="scrollHeight" @rowSelect="rowSelect">
      <Column v-for="col of dataColumns" :key="col.field" :field="col.field" :header="col.header" sortable />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import type { DataTableRowSelectEvent } from 'primevue/datatable';

type FieldHeader = {
  field: string,
  header: string,
}

const { data, dataColumns, rowSelect, height, rows } = defineProps<{
  data: any,
  dataColumns: FieldHeader[],
  rowSelect?: (_: DataTableRowSelectEvent) => void,
  height?: string,
  rows?: number,
}>();

const scrollHeight = computed(() => height ?? "300px");
const rowsPerPage = computed(() => rows ?? 5);

const selected = ref();

</script>
