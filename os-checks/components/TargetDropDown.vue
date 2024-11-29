<template>
  <div>
    <Select v-if="visible" v-model="selected" :options="targets" placeholder="Targets">

      <template #option="{ option }">
        <Tag severity="danger" class="drop-down-options">{{ tagCount(option) }}</Tag>
        {{ option }}
      </template>

      <template #value="{ value }">
        {{ value }}
        <Tag severity="danger" style="margin-left: 5px">{{ tagCount(value) }}</Tag>
      </template>

    </Select>
  </div>
</template>

<script setup lang="ts">
const defaultTarget = "All-Targets";
const selected = ref(defaultTarget);
const targets = ref<string[]>([defaultTarget]);
const visible = ref(true);
const candidates = useBasicStore();

// 随路由页面变化而下载相应的 basic.json
const route = useRoute();
change(route.path, route.params);
watch(() => [route.path, route.params], ([path, params]) => change(path as string, params));

fetch();
watch(selected, (val) => candidates.update_current(val));

function tagCount(opt: string) {
  const target = candidates.targets.find(target => target.triple == opt);
  return target ? target.count : 0;
};

function fetch() {
  candidates.fetch().then(options => {
    // FIXME: basic 可能获取失败怎么办？
    targets.value = options.map(target => target.triple);
  });
}

function change(path: string, params: any) {
  // console.log("path =", path);
  if (path === "/" || path === "/repos" || path === "/charts" || path === "/target" || path === "/workflows") {
    visible.value = false;
    return;
  } else if (params) {
    // console.log("path =", path);
    fetch();
  }
  visible.value = true;
}
</script>

<style scoped>
.drop-down-options {
  margin-right: 8px;
  width: 50px;
  justify-content: right;
}
</style>
