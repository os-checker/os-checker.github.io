<template>
  hi~

  {{ data }}
</template>

<script setup lang="ts">
import type { Workflows } from '~/shared/workflows';

const data = await githubFetch<Workflows>({
  path: "plugin/github-api/workflows/Byte-OS/polyhal.json"
});
</script>
