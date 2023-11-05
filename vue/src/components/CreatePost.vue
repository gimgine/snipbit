<template>
  <prime-dialog v-model:visible="open" modal header="Create Post"> </prime-dialog>
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import { ref } from 'vue';

const open = ref(false);

defineExpose({ open: () => (open.value = true) });
</script>
