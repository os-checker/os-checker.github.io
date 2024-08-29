<template>
  <div>
    <Select v-model="selected" :options="targets" optionLabel="target" placeholder="Targets" />
  </div>
</template>

<script setup lang="ts">
import type { TargetOption } from '~/modules/types';

const defaultTarget: TargetOption = { target: "x86_64-unknown-linux-gnu" };
const selected = ref<TargetOption>(defaultTarget);
const targets = ref<TargetOption[]>([defaultTarget]);

const candidates = useBasicStore();
candidates.fetch().then(options => targets.value = options);
watch(selected, (val) => candidates.update_current(val.target));

</script>
