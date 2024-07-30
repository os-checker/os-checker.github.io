<script setup>
import NodeService from './utils/data'
const nodes = await NodeService.getTreeTableNodes();
const value = ref(null);
</script>

<template>
  <Button label="Check" icon="pi pi-check-circle" />
  <TreeTable :value="nodes" tableStyle="min-width: 50rem">
    <Column field="name" header="Name" expander style="width: 34%"></Column>
    <Column field="size" header="Size" style="width: 33%"></Column>
    <Column field="type" header="Type" style="width: 33%"></Column>
  </TreeTable>

  <div>
    <i class="pi pi-check" style="font-size: 1rem"></i>
    <i class="pi pi-times" style="font-size: 1.5rem"></i>
    <i class="pi pi-search" style="font-size: 2rem"></i>
    <i class="pi pi-user" style="font-size: 2.5rem"></i>
  </div>


  <div class="card flex justify-center">
    <Password v-model="value" toggleMask />
  </div>
</template>
