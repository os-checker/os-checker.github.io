<script setup lang="ts">
import type { FileTree } from '~/shared/file-tree';

const route = useRoute();
const user = route.params.user;
const repo = route.params.repo;

const file_tree = ref<FileTree | null>();

const basic = useBasicStore();

function init(target: string) {
  const path = `ui/repos/${user}/${repo}/${target}.json`;
  githubFetch<FileTree>({ path })
    .then((ftree) => {
      file_tree.value = ftree;
    });
}

init(basic.current);
basic.$subscribe((_, state) => init(state.current));
</script>

<template>
  <div>
    {{ $route.params.user }} - {{ $route.params.repo }}

    {{ JSON.stringify(file_tree ?? {}) }}
  </div>
</template>
