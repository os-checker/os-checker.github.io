<template>
  <div style="margin: 0 20px;">
    <Chart type="bar" class="pass-count" :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
  </div>
</template>

<script lang="ts" setup>
import type { PassCountRepos } from '~/shared/types';
import type { Context } from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';

useHead({ title: 'Charts' });

// 无诊断的仓库数量和具有 target 的总仓库
const passCountRepos = ref<PassCountRepos>({ "": { pass: 0, total: 0 } });

const labelTotal = computed(() => {
  const val = passCountRepos.value;
  const total = Object.values(val).map(count => count.total);

  return {
    formatter: (defect: number, ctx: Context) => {
      const sum = total[ctx.dataIndex];
      const passRatio = Math.round((1 - defect / sum) * 100);
      return `sum: ${sum}\npass: ${passRatio}%`;
    },
    font: { size: fontSizeSmaller },
    color: (ctx: Context) => {
      const sum = total[ctx.dataIndex];
      const defect = (ctx.dataset.data[ctx.dataIndex] as number) ?? 0;
      const passRatio = Math.round((1 - defect / sum) * 100);
      return (passRatio < 10) ? "#c63535" : "#1b79b7";
    },
    offset: 0,
    align: 'end',
    anchor: 'end'
  }
});

const chartData = ref();
const chartOptions = ref();

const fontSizeNormal = 15;
const fontSizeSmaller = 13;

function setChartData(val: PassCountRepos) {
  const documentStyle = getComputedStyle(document.documentElement);
  const passColor = documentStyle.getPropertyValue('--p-button-primary-background');
  const ignore_zero = (ctx: Context) => ctx.dataset.data[ctx.dataIndex] !== 0;

  chartData.value = {
    labels: Object.keys(val),
    datasets: [
      {
        type: 'bar',
        label: 'Pass',
        backgroundColor: passColor,
        data: Object.values(val).map(count => count.pass),
        datalabels: {
          display: ignore_zero,
          font: { size: fontSizeSmaller },
          offset: 0,
          color: "white",
          align: 'start',
          anchor: 'end'
        }
      },
      {
        type: 'bar',
        label: 'Defect',
        backgroundColor: documentStyle.getPropertyValue('--p-gray-200'),
        data: Object.values(val).map(count => count.total - count.pass),
        datalabels: {
          labels: {
            defect: {
              display: ignore_zero,
              font: { size: fontSizeSmaller },
              offset: 0,
              align: 'start',
              anchor: 'end'
            },
            total: labelTotal
          }
        }
      }
    ]
  };
}
watch(passCountRepos, setChartData);

// document 的颜色属性需要在 mount 之后才能获取到
onMounted(() => {
  githubFetch<PassCountRepos>({ path: "ui/pass_count_repo/_targets_.json" })
    .then(data => passCountRepos.value = data);
  chartOptions.value = setChartOptions();
});

// 当主题变化的时候，更新颜色
const { darkMode } = storeToRefs(useDataThemeStore());
watch(darkMode, () => chartOptions.value = setChartOptions());


function setChartOptions() {
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
        titleFont: { size: fontSizeSmaller },
        bodyFont: { size: fontSizeSmaller },
        footerFont: { size: fontSizeSmaller },
      },
      legend: {
        labels: {
          color: textColor,
          font: { size: fontSizeNormal }
        },
      },
      datalabels: {
        font: { weight: 'bold' },
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          font: { size: fontSizeNormal },
          text: "Count of Repositories"
        },
        stacked: true,
        ticks: {
          color: textColorSecondary,
          font: { size: fontSizeNormal }
        },
        grid: {
          color: surfaceBorder,
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
          font: { size: fontSizeNormal }
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
  height: 45rem;
}
</style>
