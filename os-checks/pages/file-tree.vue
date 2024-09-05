<template>
  <div>
    <FileTree :fetch_path="(target: string) => `ui/file-tree/split/${target}.json`" />
  </div>
</template>
