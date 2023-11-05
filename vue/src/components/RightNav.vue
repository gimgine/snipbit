<template>
  <div class="flex flex-col">
    <split-button
      class="h-12"
      v-if="pb.authStore.isValid"
      :model="items"
      size="small"
      text
      @click="$router.push({ name: 'profile', params: { username: pb.authStore.model?.username } })"
    >
      <template #buttoncontent>
        <div class="flex items-center gap-3">
          <prime-avatar class="mr-3" :image="avatarUrl" v-show="avatarUrl" shape="circle" />
          <prime-avatar class="mr-3" icon="pi pi-user" v-show="!avatarUrl" shape="circle" />
          <h1 class="hidden sm:block">{{ username }}</h1>
        </div>
      </template>
    </split-button>
    <prime-button v-else class="mx-7" label="Sign In" icon="pi pi-sign-in" @click="$router.push({ name: 'login' })" text />
  </div>
</template>

<script setup lang="ts">
import SplitButton from 'primevue/splitbutton';
import PrimeButton from 'primevue/button';
import PrimeAvatar from 'primevue/avatar';
import { onMounted, ref } from 'vue';
import { useAvatarCache } from '@/store';
import pb from '@/pocketbase';

const avatarUrl = ref('');
const username = ref('');

const avatarCache = useAvatarCache();

const items = [
  {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: () => {
      pb.authStore.clear();
      window.location.reload();
    }
  }
];

onMounted(() => {
  username.value = pb.authStore.model?.username;
  avatarCache.getAvatarUrlForId(pb.authStore.model?.id).then(() => {
    avatarUrl.value = avatarCache.cache[pb.authStore.model?.id];
  });
});
</script>
