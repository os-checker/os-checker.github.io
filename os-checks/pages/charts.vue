<template>
  <div style="margin: 0 20px;">
    <Chart type="bar" :data="chartData" :options="chartOptions" class="pass-count" />
  </div>
</template>

<script lang="ts" setup>
import type { PassCountRepos } from '~/shared/types';

// 无诊断的仓库数量和具有 target 的总仓库
const passCountRepos = ref<PassCountRepos>({ "": { pass: 0, total: 0 } });
githubFetch<PassCountRepos>({ path: "ui/pass_count_repo/_targets_.json" })
  .then(data => passCountRepos.value = data);

const chartData = ref();
const chartOptions = ref();

watch(passCountRepos, (val) => {
  const documentStyle = getComputedStyle(document.documentElement);

  chartData.value = {
    labels: Object.keys(val),
    datasets: [
      {
        type: 'bar',
        label: 'Pass',
        backgroundColor: documentStyle.getPropertyValue('--p-button-primary-background'),
        data: Object.values(val).map(count => count.pass)
      },
      {
        type: 'bar',
        label: 'Defect',
        backgroundColor: documentStyle.getPropertyValue('--p-gray-200'),
        data: Object.values(val).map(count => count.total - count.pass)
      }
    ]
  };
});

// document 的颜色属性需要在 mount 之后才能获取到
onMounted(() => {
  // chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

// 当主题变化的时候，更新颜色
const { darkMode } = storeToRefs(useDataThemeStore());
watch(darkMode, () => chartOptions.value = setChartOptions());


function setChartOptions() {
  const fontSize = 18;
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    indexAxis: 'y',
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      tooltip: {
        mode: 'nearest',
        // intersect: false,
        titleFont: { size: fontSize },
        bodyFont: { size: fontSize },
        footerFont: { size: fontSize },
      },
      legend: {
        labels: {
          color: textColor,
          font: { size: fontSize }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
          font: { size: fontSize }
        },
        grid: {
          color: surfaceBorder,
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
          font: { size: fontSize }
        },
        grid: {
          color: surfaceBorder
        },
      }
    }
  };
}
</script>

<style scoped>
.pass-count {
  height: 40rem;
}
</style>
