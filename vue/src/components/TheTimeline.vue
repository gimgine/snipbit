<template>
  <tab-view>
    <tab-panel header="Discover">
      <data-view :value="posts" data-key="id">
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
            :avatar-url="slotProps.data.avatarUrl"
          />
        </template>
      </data-view>
    </tab-panel>
    <tab-panel header="Following"> </tab-panel>
  </tab-view>
</template>

<script setup lang="ts">
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataView from 'primevue/dataview';
import TimelinePost from '@/components/TimelinePost.vue';
import { onMounted, ref } from 'vue';
import pb from '@/pocketbase';
import { Collections, type LanguagesRecord, type PostsResponse, type SnippetsResponse, type UsersResponse } from '@/util/pocketbase-types';
import { useAvatarCache } from '@/store';

type ExpandedUserSnippet = { user: UsersResponse; snippet: SnippetsResponse<{ language: LanguagesRecord }> };

const avatarCache = useAvatarCache();

const posts = ref([] as Array<PostsResponse<ExpandedUserSnippet> & { avatarUrl: string }>);

const getPosts = async () => {
  const res = await pb
    .collection(Collections.Posts)
    .getList<PostsResponse<ExpandedUserSnippet> & { avatarUrl: string }>(undefined, undefined, { expand: 'user,snippet,snippet.language' });

  res.items.forEach((post) => {});

  for (let i = 0; i < res.items.length; i++) {
    avatarCache.getAvatarUrlForId(res.items[i].user);
  }

  posts.value = res.items;
};

onMounted(async () => {
  getPosts();
});
</script>
