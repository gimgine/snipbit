<template>
  <div class="bg-[var(--surface-ground)] px-32 h-full">
    <top-nav />
    <div class="flex w-full h-full justify-center gap-1">
      <div class="flex flex-col w-2/12">
        <left-nav />
      </div>
      <div class="flex flex-col w-8/12">
        <the-timeline />
      </div>
      <div class="flex flex-col w-2/12">
        <right-nav />
      </div>
    </div>
    <speed-dial :model="items" direction="up" :style="{ right: '1rem', bottom: '1rem' }" :tooltip-options="{ position: 'right', event: 'hover' }" />
    <create-snippet ref="createSnippet" />
    <create-post ref="createPost" />
  </div>
</template>

<script setup lang="ts">
import TheTimeline from '@/components/TheTimeline.vue';
import LeftNav from '@/components/LeftNav.vue';
import RightNav from '@/components/RightNav.vue';
import TopNav from '@/components/TopNav.vue';
import SpeedDial from 'primevue/speeddial';
import { ref } from 'vue';
import type { MenuItem } from 'primevue/menuitem';
import CreateSnippet from '@/components/CreateSnippet.vue';
import CreatePost from '@/components/CreatePost.vue';

const createSnippet = ref({} as InstanceType<typeof CreateSnippet>)
const createPost = ref({} as InstanceType<typeof CreatePost>)
const items = ref<Array<MenuItem>>([
  {
    label: 'Post',
    icon: 'pi pi-file-edit',
    command: () => createPost.value.open()
  },
  {
    label: 'Snippet',
    icon: 'pi pi-code',
    command: () => createSnippet.value.open()
  }
]);
</script>

<style>
.p-speeddial {
  position: fixed !important;
}
</style>
