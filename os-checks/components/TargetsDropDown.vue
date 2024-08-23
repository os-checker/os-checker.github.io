<template>
  <div>
    <Select v-model="selected" :options="targets" optionLabel="target" placeholder="Targets" />
  </div>
</template>

<script setup>

const defaultTarget = { target: "x86_64-unknown-linux-gnu" };
const selected = ref(defaultTarget);
const targets = ref([defaultTarget]);

const candidates = useTargetsStore();
candidates.fetch().then(options => targets.value = options);
watch(selected, (val) => candidates.current = val.target);

</script>
