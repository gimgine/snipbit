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
import pb from '@/pocketbase';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const createSnippet = ref({} as InstanceType<typeof CreateSnippet>);
const createPost = ref({} as InstanceType<typeof CreatePost>);
const items = ref<Array<MenuItem>>([
  {
    label: 'Post',
    icon: 'pi pi-file-edit',
    command: () => {
      if (!pb.authStore.isValid) {
        toast.add({ severity: 'warn', summary: 'Not Authenticated', detail: `You must be signed in to perform this action.`, life: 3000 });
        return;
      }
      createPost.value.open();
    }
  },
  {
    label: 'Snippet',
    icon: 'pi pi-code',
    command: () => {
      if (!pb.authStore.isValid) {
        toast.add({ severity: 'warn', summary: 'Not Authenticated', detail: `You must be signed in to perform this action.`, life: 3000 });
        return;
      }
      createSnippet.value.open();
    }
  }
]);
</script>

<style>
.p-speeddial {
  position: fixed !important;
}
</style>
