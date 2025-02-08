<template>
  <div>
    <div>
      <div style="padding: 6px 8px 6px 8px">
        <span class="input">User:</span>
        <span class="select">
          <Select v-model="selectedUser" filter :options="users" :optionLabel="label" />
        </span>

        <span class="input">Repo:</span>
        <span class="select">
          <Select v-model="selectedRepo" filter :options="repos" :optionLabel="label" />
        </span>

        <span class="input">Pkg:</span>
        <span class="select">
          <Select v-model="selectedPkg" filter showClear :options="pkgs" :optionLabel="label" placeholder="All" />
        </span>

        <span class="input">Checker:</span>
        <span class="select">
          <Select v-model="selectedChecker" filter showClear :options="checkers" :optionLabel="label"
            placeholder="All" />
        </span>
      </div>

      <div style="padding: 2px 8px 10px 8px">
        <span class="input">Target:</span>
        <span class="select">
          <Select v-model="selectedTarget" filter showClear :options="targets" :optionLabel="label" placeholder="All" />
        </span>

        <span class="input">Features:</span>
        <span class="select">
          <Select v-model="selectedFeatures" filter showClear :options="features" :optionLabel="label"
            placeholder="All" />
        </span>
      </div>
    </div>

    <FileTree :fetch_path="(target: string) => `ui/file-tree/split/${target}.json`" />
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Issue File Tree' });

const label = (a: string) => a;

const selectedUser = ref("");
const selectedRepo = ref("");
const selectedPkg = ref("");
const selectedChecker = ref("");
const selectedTarget = ref("");
const selectedFeatures = ref("");

const users = ref([]);
const repos = ref([]);
const pkgs = ref([]);
const checkers = ref([]);
const targets = ref([]);
const features = ref([]);

</script>

<style scoped>
.input {
  font-size: 14.5px;
  font-weight: bold;
  padding-right: 10px;
  color: var(--p-button-primary-background);
}

.select {
  padding-right: 10px;
}

.resolved-table {
  --p-datatable-header-cell-color: var(--p-button-primary-background);
}

.sources {
  color: var(--p-orange-400);
}

.sources-table {
  --p-datatable-header-cell-color: var(--p-orange-400);
}
</style>
