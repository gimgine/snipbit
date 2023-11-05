<template>
  <tab-view v-model:active-index="activeTab" @tab-change="() => reloadTimeline()">
    <tab-panel header="Discover">
      <data-view
        :value="posts"
        data-key="id"
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
            :username="slotProps.data.expand.user.username"
            :created="slotProps.data.created"
            :caption="slotProps.data.caption"
            :post-type="slotProps.data.type"
            :language-name="slotProps.data.expand.snippet.expand.language.name"
            :comments="slotProps.data.expand['comments(post)']"
            :likes="slotProps.data.expand['likes(post)']"
            :saves="slotProps.data.expand['saves(post)']"
          />
        </template>
      </data-view>
    </tab-panel>
    <tab-panel header="Following">
      <data-view
        :value="posts"
        data-key="id"
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
            :username="slotProps.data.expand.user.username"
            :created="slotProps.data.created"
            :caption="slotProps.data.caption"
            :post-type="slotProps.data.type"
            :language-name="slotProps.data.expand.snippet.expand.language.name"
            :comments="slotProps.data.expand['comments(post)']"
            :likes="slotProps.data.expand['likes(post)']"
            :saves="slotProps.data.expand['saves(post)']"
          />
        </template>
      </data-view>
    </tab-panel>
  </tab-view>
  <strong class="text-center opacity-20 py-10">You've reached the end of the feed :(</strong>
  <prime-dialog v-model:visible="isPostDialogOpen" modal dismissable-mask :style="{ width: '50rem' }">
    <expanded-post ref="expandedPost" :post-id="openPostId" />
  </prime-dialog>
</template>

<script setup lang="ts">
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataView from 'primevue/dataview';
import PrimeDialog from 'primevue/dialog';
import TimelinePost from '@/components/TimelinePost.vue';
import { nextTick, onMounted, provide, ref } from 'vue';
import pb from '@/pocketbase';
import { Collections, type LanguagesRecord, type PostsResponse, type SnippetsResponse, type UsersResponse } from '@/util/pocketbase-types';
import { useAvatarCache } from '@/store';
import ExpandedPost from './ExpandedPost.vue';

type ExpandedUserSnippet = { user: UsersResponse; snippet: SnippetsResponse<{ language: LanguagesRecord }> };

const avatarCache = useAvatarCache();

const expandedPost = ref({} as InstanceType<typeof ExpandedPost>);

const posts = ref([] as Array<PostsResponse<ExpandedUserSnippet> & { avatarUrl: string }>);
const isPostDialogOpen = ref(false);
const openPostId = ref('');
const activeTab = ref(0);

const reloadTimeline = async () => {
  posts.value = [];

  const res = await pb.collection(Collections.Posts).getList<PostsResponse<ExpandedUserSnippet> & { avatarUrl: string }>(undefined, undefined, {
    sort: '-created',
    expand: 'user,snippet.language,likes(post),comments(post),saves(post)'
  });

  const following = activeTab.value
    ? (
        await pb.collection(Collections.Following).getList(undefined, undefined, {
          filter: `user = "${pb.authStore.model?.id}"`
        })
      ).items.map((e) => e.isFollowing)
    : [];

  for (let i = 0; i < res.items.length; i++) {
    avatarCache.getAvatarUrlForId(res.items[i].user);
  }

  posts.value = activeTab.value ? res.items.filter((e) => following.includes(e.user)) : res.items;
  console.log(posts.value);
};
defineExpose({ reloadTimeline });

const openPostDialog = (postId: string) => {
  isPostDialogOpen.value = true;
  openPostId.value = postId;

  nextTick(() => {
    expandedPost.value.resetContent();
  });
};
provide('openPostDialog', openPostDialog);

const closePostDialog = () => {
  isPostDialogOpen.value = false;
  openPostId.value = '';
};

onMounted(async () => {
  reloadTimeline();
});
</script>
