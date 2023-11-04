<template>
  <div class="flex flex-col">
    <speed-dial :model="items" direction="up" :style="{ right: '1rem', bottom: '1rem' }" :tooltip-options="{ position: 'right', event: 'hover' }" />
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';
import SpeedDial from 'primevue/speeddial';
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
