<script setup lang="ts">
import type { FileTree } from '~/shared/file-tree';

const route = useRoute();
const user = route.params.user;
const repo = route.params.repo;

const file_tree = ref<FileTree | null>();

const basic = useBasicStore();
basic.init_with_and_subscribe_to_current((target) => {
  const path = `ui/repos/${user}/${repo}/${target}.json`;
  githubFetch<FileTree>({ path })
    .then((ftree) => {
      file_tree.value = ftree;
    }).catch(() => {
      file_tree.value = {} as FileTree;
    });
});

</script>

<template>
  <div>
    {{ $route.params.user }} - {{ $route.params.repo }}

    {{ JSON.stringify(file_tree ?? {}) }}
  </div>
</template>
