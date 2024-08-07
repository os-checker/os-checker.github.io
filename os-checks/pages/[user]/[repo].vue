<script setup lang="ts">
// import type { TreeNode } from 'primevue/treenode';

highlightRust();

const raw_reports = ref<any>([]);
githubFetch({ branch: "raw-reports", path: "os-checks/public/test_raw_reports.json" })
  .then(({ data }) => raw_reports.value = JSON.parse(data.value as string));

const diffCode = ref([`aaa
-Original line
+Modified line`]);

type Clippy = { [key: string]: string[] };
const clippyWarn = ref<string[]>([]);
watch(raw_reports, (reports) => {
  clippyWarn.value = [];
  const fmts = (reports[7]?.[1]?.clippy_warn) as Clippy;
  for (const key in fmts) {
    clippyWarn.value.push(...fmts[key]);
  }
  clippyWarn.value.push(...diffCode.value);
});


</script>

<template>

  <ScrollPanel style="width: 100%; height: 400px" :dt="{
    bar: {
      background: '{primary.color}'
    }
  }">

    <CodeBlock :snippets="diffCode" lang="diff" />
    <CodeBlock :snippets="clippyWarn" />

    <pre><code class="language-rust">
        fn main() { println!("Hello, world!"); }
        fn main() { println!("Hello, world!"); }
      </code></pre>

  </ScrollPanel>

  <nav>
    <NuxtLink to="/">Go Home</NuxtLink>
  </nav>
  <p>{{ $route.params.user }} / {{ $route.params.repo }}</p>
  <div>fullPath = {{ $route.fullPath }}</div>

  <ScrollPanel style="width: 100%; height: 150px" :dt="{
    bar: {
      background: '{primary.color}'
    }
  }">
    <!-- {{ raw_reports[0]?.[1]?.fmt }} -->
    {{ raw_reports }}
  </ScrollPanel>


  <Tabs value="2">
    <TabList>
      <Tab value="0">Header I</Tab>
      <Tab value="1">Header II</Tab>
      <Tab value="2">Header III</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <p class="m-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.

        </p>
      </TabPanel>
      <TabPanel value="1">
        <p class="m-0">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
          aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          Nemo enim
          ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
          ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
        </p>
      </TabPanel>
      <TabPanel value="2">
        <p class="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
          atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
          sunt in culpa
          qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
          expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </TabPanel>
    </TabPanels>
  </Tabs>


</template>
