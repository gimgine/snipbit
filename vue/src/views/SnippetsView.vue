<template>
  <div class="bg-[var(--surface-ground)] lg:px-32 py-2 h-full">
    <top-nav />
    <div class="flex w-full h-full justify-center gap-1">
      <div class="flex flex-col w-2/12">
        <left-nav />
      </div>
      <div class="grid w-8/12 grid-cols-3 gap-4">
        <card v-for="snippet in snippets" class="h-min">
          <template #title>{{ snippet.title }}</template>
          <template #subtitle><prime-tag :value="(snippet.expand as any)?.language.name ?? snippet.customLanguage" /></template>
          <template #content><prime-button icon="pi pi-file-edit" text class="float-right" @click="createSnippetDialog.open(snippet)" /></template>
          <template #footer
            ><small class="opacity-50">{{ snippet.created.slice(0, 10) }}</small></template
          >
        </card>
      </div>
      <div class="flex flex-col w-2/12">
        <right-nav />
      </div>
    </div>
    <create-button />
    <create-snippet ref="createSnippetDialog" />
  </div>
</template>

<script setup lang="ts">
import LeftNav from '@/components/LeftNav.vue';
import RightNav from '@/components/RightNav.vue';
import TopNav from '@/components/TopNav.vue';
import CreateButton from '@/components/CreateButton.vue';
import Card from 'primevue/card';
import PrimeTag from 'primevue/tag';
import PrimeButton from 'primevue/button';
import { onMounted, ref } from 'vue';
import pb from '@/pocketbase';
import { Collections, type SnippetsResponse } from '@/util/pocketbase-types';
import CreateSnippet from '@/components/CreateSnippet.vue';

const snippets = ref([] as SnippetsResponse[]);
const createSnippetDialog = ref();

onMounted(async () => {
  snippets.value = await pb.collection(Collections.Snippets).getFullList({ filter: `user = "${pb.authStore.model?.id}"`, expand: 'language' });
});
</script>
