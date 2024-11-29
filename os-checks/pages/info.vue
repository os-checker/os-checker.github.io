<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, _from) {
      // Redirect /info and queries to root
      if (to.path === "/info") {
        return navigateTo({ path: "/", query: to.query });
      }
    }
  ]
})
</script>
