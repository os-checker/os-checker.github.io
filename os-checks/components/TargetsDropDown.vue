<template>
  <div>
    <Select v-model="selected" :options="targets" placeholder="Targets"
      :optionLabel="(opt: Target) => `[${opt.count}] ${opt.triple}`" />
  </div>
</template>

<script setup lang="ts">
import type { Target, Targets } from '~/shared/types';

const defaultTarget: Target = { triple: "x86_64-unknown-linux-gnu", count: 0 };
const selected = ref<Target>(defaultTarget);
const targets = ref<Targets>([defaultTarget]);

const candidates = useBasicStore();
candidates.fetch().then(options => {
  selected.value = options[0];
  targets.value = options;
});
watch(selected, (val) => candidates.update_current(val.triple));

</script>
