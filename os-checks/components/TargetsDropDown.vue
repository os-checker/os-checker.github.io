<template>
  <div>
    <Select v-model="selected" :options="targets" placeholder="Targets" :optionLabel="label" />
  </div>
</template>

<script setup lang="ts">
const defaultTarget = "All-Targets";
const selected = ref(defaultTarget);
const targets = ref<string[]>([defaultTarget]);

// 随路由页面变化而下载相应的 basic.json
const route = useRoute();
watch(() => route.params, () => fetch());

const candidates = useBasicStore();
fetch();
watch(selected, (val) => candidates.update_current(val));

function label(opt: string) {
  const target = candidates.targets.find(target => target.triple == opt);
  return target ? `[${target.count}] ${target.triple}` : "";
};

function fetch() {
  candidates.fetch().then(options => {
    // FIXME: basic 可能获取失败怎么办？
    targets.value = options.map(target => target.triple);
  });
}

</script>
