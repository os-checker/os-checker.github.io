<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, _from) {
      const user = to.params.user;
      const repo = to.params.repo;
      const query = { user, repo, lock: "true" };
      return navigateTo({ path: "/file-tree", query });
    }
  ]
})
</script>
