<template>
  <div class="flex flex-col items-center gap-6 mt-6">
    <prime-button icon="pi pi-home" text rounded size="large" />
    <prime-button icon="pi pi-code" text rounded size="large" />
    <prime-button icon="pi pi-users" text rounded size="large" />
  </div>
</template>

<script setup lang="ts">
import PrimeButton from 'primevue/button';
</script>

<style scoped>
.p-button {
  height: 52px;
}
</style>
