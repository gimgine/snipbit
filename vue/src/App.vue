<template>
  <toast />
  <router-view />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
</script>

<style>
html,
body,
#app {
  background: var(--surface-ground);
  height: 100%;
}
</style>
