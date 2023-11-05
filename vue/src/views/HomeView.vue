<template>
  <div class="bg-[var(--surface-ground)] lg:px-32 py-2 h-full">
    <top-nav />
    <div class="flex w-full h-full justify-center gap-1">
      <div class="flex flex-col w-2/12">
        <left-nav />
      </div>
      <div class="flex flex-col w-8/12">
        <the-timeline ref="timeline" />
      </div>
      <div class="flex flex-col w-2/12">
        <right-nav />
      </div>
    </div>
    <create-button />
  </div>
</template>

<script setup lang="ts">
import TheTimeline from '@/components/TheTimeline.vue';
import LeftNav from '@/components/LeftNav.vue';
import RightNav from '@/components/RightNav.vue';
import TopNav from '@/components/TopNav.vue';
import CreateButton from '@/components/CreateButton.vue';
import { provide, ref } from 'vue';

const timeline = ref({} as InstanceType<typeof TheTimeline>);

provide('reloadTimeline', () => timeline.value.reloadTimeline());
</script>
