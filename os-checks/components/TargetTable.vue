<template>
  <div>
    <!-- NOTE: choosing large page options will render slow and consume more memory -->
    <DataTable :value="data" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50, 100, 200, 1000]" stripedRows
      selectionMode="single" v-model:selection="selected" removableSort sortMode="multiple" scrollable
      scrollHeight="300px">
      <Column v-for="col of dataColumns" :key="col.field" :field="col.field" :header="col.header" sortable />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>

type FieldHeader = {
  field: string,
  header: string
}

const { data, dataColumns } = defineProps<{
  data: any,
  dataColumns: FieldHeader[]
}>();

const selected = ref();

</script>
