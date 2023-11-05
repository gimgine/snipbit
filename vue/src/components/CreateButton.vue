<template>
  <speed-dial :model="items" direction="up" :style="{ right: '1rem', bottom: '1rem' }" :tooltip-options="{ position: 'right', event: 'hover' }" />
  <create-snippet ref="createSnippet" />
  <create-post ref="createPost" />
</template>

<script setup lang="ts">
import SpeedDial from 'primevue/speeddial';
import { ref } from 'vue';
import type { MenuItem } from 'primevue/menuitem';
import CreateSnippet from '@/components/CreateSnippet.vue';
import CreatePost from '@/components/CreatePost.vue';

const createSnippet = ref({} as InstanceType<typeof CreateSnippet>);
const createPost = ref({} as InstanceType<typeof CreatePost>);
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
