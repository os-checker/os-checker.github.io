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
watch(() => route.params, ({ user, repo }) => {
  console.log(user, repo);
  console.log((user && repo) ? `repos/${user}/${repo}/` : "");
  fetch((user && repo) ? `repos/${user}/${repo}/` : "");
});

const candidates = useBasicStore();
fetch("");
watch(selected, (val) => candidates.update_current(val.triple));

function fetch(repo: string) {
  candidates.fetch(repo).then(options => {
    selected.value = options[0];
    targets.value = options;
  });
}

</script>
