<template>
  <div>
    <Select v-model="selected" :options="targets" placeholder="Targets"
      :optionLabel="(opt: Target) => `[${opt.count}] ${opt.triple}`" />
  </div>
</template>

<script setup lang="ts">
import type { Target, Targets } from '~/shared/types';

const defaultTarget: Target = { triple: "All-Targets", count: 0 };
const selected = ref<Target>(defaultTarget);
const targets = ref<Targets>([defaultTarget]);

// 随路由页面变化而下载相应的 basic.json
const route = useRoute();
watch(() => route.params, () => fetch());

const candidates = useBasicStore();
fetch();
watch(selected, (val) => candidates.update_current(val.triple));

function fetch() {
  candidates.fetch().then(options => {
    // NOTE: 因为 basic 可能获取失败，那么这个数组为空，那么不要更新选项
    if (options[0]) {
      selected.value = options[0];
      targets.value = options;
    }
  });
}

</script>
