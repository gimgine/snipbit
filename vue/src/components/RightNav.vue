<template>
  <div class="flex flex-col"></div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import { ref } from 'vue';

const items = ref<Array<MenuItem>>([
  {
    label: 'Post',
    icon: 'pi pi-file-edit'
  },
  {
    label: 'Snippet',
    icon: 'pi pi-code'
  }
]);
</script>
