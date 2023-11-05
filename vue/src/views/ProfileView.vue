<template>
  <div class="bg-[var(--surface-ground)] lg:px-32 py-2 h-full">
    <top-nav />
    <div class="flex w-full h-full justify-center gap-1">
      <div class="flex flex-col w-2/12">
        <left-nav />
      </div>
      <div v-if="user" class="flex flex-col w-8/12 gap-2 p-2">
        <div>
          <prime-avatar class="w-32 h-32" :image="avatarCache.cache[user.id]" shape="circle" />
        </div>
        <strong class="text-xl">{{ user.username }}</strong>
        <span>{{ user.bio }}</span>
        <data-view
          :value="(user.expand as any)['posts(user)']"
          data-key="id"
          class="mt-2"
          :pt="{
            grid: { class: 'bg-[var(--surface-ground)] gap-8' }
          }"
        >
          <template #list="slotProps">
            <timeline-post
              :user-id="slotProps.data.user"
              :post-id="slotProps.data.id"
              :snippet-id="slotProps.data.snippet"
              :monaco-name="slotProps.data.expand.snippet.expand.language.monacoName"
              :snippet-content="slotProps.data.expand.snippet.content"
              :title="slotProps.data.expand.snippet.title"
              :username="user.username"
              :created="slotProps.data.created"
              :caption="slotProps.data.caption"
              :post-type="slotProps.data.type"
              :language-name="slotProps.data.expand.snippet.expand.language.name"
            />
          </template>
        </data-view>
      </div>
      <div class="flex flex-col w-2/12">
        <right-nav />
      </div>
    </div>
    <create-button />
  </div>
</template>

<script setup lang="ts">
import CreateButton from '@/components/CreateButton.vue';
import LeftNav from '@/components/LeftNav.vue';
import RightNav from '@/components/RightNav.vue';
import TopNav from '@/components/TopNav.vue';
import PrimeAvatar from 'primevue/avatar';
import pb from '@/pocketbase';
import { Collections, type UsersResponse } from '@/util/pocketbase-types';
import { onMounted, ref, type Ref } from 'vue';
import { useAvatarCache } from '@/store';
import TimelinePost from '@/components/TimelinePost.vue';
import DataView from 'primevue/dataview';

const avatarCache = useAvatarCache();
const user: Ref<null | UsersResponse> = ref(null);

const props = defineProps({
  username: String
});

onMounted(async () => {
  const res = await pb.collection(Collections.Users).getFirstListItem(`username = "${props.username}"`, { expand: 'posts(user).snippet.language' });
  user.value = res;
  avatarCache.getAvatarUrlForId(user.value.id);
});
</script>
