<template>
  <div class="bg-[var(--surface-ground)] h-full overflow-y-auto text-xs">
    <div v-for="line in lines" :class="`p-2 ${line.icon ? '' : 'pl-6'} ${line.background}`">
      <i v-if="line.icon" :class="`pi pi-${line.icon} text-xs pr-1`"></i>
      {{ line.body }}
    </div>
    <div class="p-2">
      <i class="pi pi-chevron-right text-xs pr-1"></i>
      _
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const lines = ref([] as any[]);

const assert = (condition: boolean, ...data: any[]) => {
  if (!condition) lines.value.push({ body: 'Assertion failed: ' + data.join(' '), icon: 'circle-xmark', background: 'bg-red-400' });
};

const clear = () => {
  lines.value = [];
};

const warn = (...data: any[]) => {
  if (data.length === 0) return;
  lines.value.push({ body: data.join(' '), icon: 'exclamation-triangle', background: 'bg-orange-400' });
};

const error = (...data: any[]) => {
  if (data.length === 0) return;
  lines.value.push({ body: data.join(' '), icon: 'times-circle', background: 'bg-red-400' });
};

const info = (...data: any[]) => {
  if (data.length === 0) return;
  lines.value.push({ body: data.join(' '), icon: 'info-circle', background: 'bg-blue-400' });
};

const debug = (...data: any[]) => {
  if (data.length === 0) return;
  lines.value.push({ body: data.join(' '), icon: 'cog', background: 'bg-yellow-400' });
};

const log = (...data: any[]) => {
  if (data.length === 0) return;
  lines.value.push({ body: data.join(' ') });
};

defineExpose({ assert, clear, warn, error, info, debug, log })
</script>