<template>
  <Card style="width: 40%;">
    <template #title>{{ title }}</template>
    <template #content>
      <div style="display: flex; justify-content: center; gap: 20%;">

        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 30%">
          <Knob v-model="completed_ratio" :valueTemplate="knobRatio" :value-color="completed_color" />
          <div>
            Completed
          </div>
          <div>
            {{ completed }} / {{ total }}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <Knob v-model="successs_ratio" :valueTemplate="knobRatio" :value-color="success_color" />
          <div>
            Success
          </div>
          <div>
            {{ success }} / {{ total }}
          </div>
        </div>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">

type Data = {
  total: number,
  completed: number,
  completed_ratio: number,
  completed_color: string,
  success: number,
  successs_ratio: number,
  success_color: string,
};

const { title, data } = defineProps<{ title: string, data: Data }>();

const {
  total, completed, completed_ratio, completed_color,
  success, successs_ratio, success_color
} = data;

const knobRatio = (val: number) => `${val}%`;

</script>
