<template>
  <div class="bg-[var(--surface-ground)] lg:px-32 py-2 h-full">
    <top-nav />
    <div class="flex w-full h-full justify-center gap-1">
      <div class="flex flex-col w-2/12">
        <left-nav />
      </div>
      <div v-if="user" class="flex flex-col w-8/12 gap-2 p-2">
        <div class="flex">
          <prime-avatar class="w-32 h-32" :image="avatarCache.cache[user.id]" shape="circle" />
          <div class="flex-1 flex flex-col gap-4 justify-center items-center">
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <strong>{{ (user.expand as any)['posts(user)']?.length ?? 0 }}</strong>
                <small>Posts</small>
              </div>
              <div class="flex flex-col items-center">
                <strong>{{ followersCount }}</strong>
                <small>Followers</small>
              </div>
              <div class="flex flex-col items-center">
                <strong>{{ (user.expand as any)['following(user)']?.length ?? 0 }}</strong>
                <small>Following</small>
              </div>
            </div>
            <prime-button v-if="user.id !== pb.authStore.model?.id" size="small" @click="followUser">{{
              followingId ? 'Unfollow' : 'Follow'
            }}</prime-button>
          </div>
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
import PrimeButton from 'primevue/button';
import pb from '@/pocketbase';
import { Collections, type UsersResponse } from '@/util/pocketbase-types';
import { onMounted, ref, type Ref } from 'vue';
import { useAvatarCache } from '@/store';
import TimelinePost from '@/components/TimelinePost.vue';
import DataView from 'primevue/dataview';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const avatarCache = useAvatarCache();
const user: Ref<null | UsersResponse> = ref(null);

const props = defineProps({
  username: String
});

const followingId = ref('');
const followersCount = ref(0);

const followUser = () => {
  if (followingId.value) {
    let temp = followingId.value;
    followingId.value = '';
    pb.collection(Collections.Following)
      .delete(temp)
      .then(() => (followersCount.value -= 1))
      .catch(() => {
        followingId.value = temp;
        toast.add({ severity: 'error', summary: 'Error', detail: `Something went wrong on the server. Please try again.`, life: 3000 });
      });
  } else {
    followingId.value = 'temp';
    pb.collection(Collections.Following)
      .create({
        user: pb.authStore.model?.id,
        isFollowing: user.value?.id
      })
      .then((res) => {
        followersCount.value += 1;
        followingId.value = res.id;
      })
      .catch(() => {
        followingId.value = '';
        toast.add({ severity: 'error', summary: 'Error', detail: `Something went wrong on the server. Please try again.`, life: 3000 });
      });
  }
};

const initialize = async () => {
  const res = await pb
    .collection(Collections.Users)
    .getFirstListItem(`username = "${props.username}"`, { expand: 'posts(user).snippet.language,following(user),following(isFollowing)' });
  user.value = res;
  followingId.value = (user.value.expand as any)['following(isFollowing)']?.find((e: any) => e.user === pb.authStore.model?.id)?.id ?? '';
  followersCount.value = (user.value.expand as any)['following(isFollowing)']?.length ?? 0;
  avatarCache.getAvatarUrlForId(user.value.id);
};

onMounted(() => initialize());
</script>
