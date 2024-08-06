<script setup lang="ts">
// import type { TreeNode } from 'primevue/treenode';
import highlightRust from '~/composables/highlight-rust';

const raw_reports = ref<any>([]);
const url = "/test_raw_reports.json";
// const url = "https://github.com/os-checker/os-checker.github.io/raw/ui/raw-reports/os-checks/content/test_raw_reports.json";
$fetch(url).then((data) => {
  raw_reports.value = data;
  // console.log(`${JSON.stringify(data)}`);
});
// useAsyncData('raw_reports', () => queryContent('/test_raw_reports').findOne()).then(({ data }) => {
//   const value = data.value;
//   // const value = data.value?.body as unknown as TreeNode[] ?? [];
//   raw_reports.value = value;
//   console.log(`raw_reports=${JSON.stringify(value)}`);
// });

highlightRust();

const code = ref(`
-Original line
+Modified line`);

</script>

<template>

  <ScrollPanel style="width: 100%; height: 200px" :dt="{
    bar: {
      background: '{primary.color}'
    }
  }">
    <pre><code class="language-rust">
        fn main() { println!("Hello, world!"); }
        fn main() { println!("Hello, world!"); }
        fn main() { println!("Hello, world!"); }
        fn main() { println!("Hello, world!"); }
        fn main() { println!("Hello, world!"); }
      </code></pre>

    <pre><code class="language-diff">{{ code }}
      </code></pre>

  </ScrollPanel>

  <nav>
    <NuxtLink to="/">Go Home</NuxtLink>
  </nav>
  <p>{{ $route.params.user }} / {{ $route.params.repo }}</p>
  <div>fullPath = {{ $route.fullPath }}</div>

  <ScrollPanel style="width: 100%; height: 200px" :dt="{
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
