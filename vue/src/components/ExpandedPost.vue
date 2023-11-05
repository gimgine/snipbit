<template>
  <div class="w-full">
    <tab-view class="h-full flex flex-col" v-if="postContent.type === PostsTypeOptions.htmlcssjs">
      <tab-panel v-for="lang in ['html', 'css', 'javascript']" :header="lang">
        <vue-monaco-editor
          :language="lang"
          class="min-h-[200px] rounded-t overflow-hidden"
          v-model:value="JSON.parse(postContent.expand?.snippet.content ?? '')[lang]"
          :options="{
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            theme: 'vs-dark'
          }"
        />
      </tab-panel>
    </tab-view>

    <vue-monaco-editor
      v-else
      :language="postContent.expand?.snippet.expand?.language.monacoName"
      theme="vs-dark"
      :value="postContent.expand?.snippet.content"
      class="min-h-[200px] rounded-t overflow-hidden"
      :options="{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        readOnly: true,
        formatOnType: true
      }"
    />
    <div class="flex justify-between pt-4">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold">{{ postContent.expand?.snippet.title }}</h1>
        <prime-tag :value="postContent.expand?.snippet.expand?.language.name" />
      </div>
      <div class="flex flex-col items-end gap-1">
        <div class="flex gap-2 items-center">
          <h1 class="text-sm">{{ postContent.expand?.user.username }}</h1>
          <prime-avatar :image="avatarCache.cache[postContent.user]" v-show="avatarCache.cache[postContent.user]" shape="circle" />
          <prime-avatar icon="pi pi-user" v-show="!avatarCache.cache[postContent.user]" shape="circle" />
        </div>
        <div>
          <h1 class="text-xs italic opacity-70">{{ formatDate(new Date(postContent.created)) }}</h1>
        </div>
      </div>
    </div>
    <p class="pt-2 pb-8">{{ postContent.caption }}</p>
    <span class="flex w-full gap-3">
      <span class="p-float-label w-full">
        <input-text
          id="newComment"
          :class="{ 'p-invalid': newComment.error, 'w-full': true }"
          v-model="newComment.text"
          autocomplete="off"
          @update:model-value="() => (newComment.error = '')"
        />
        <label for="newComment">Comment</label>
      </span>
      <prime-button label="Send" text @click="handleCommentClick" />
    </span>
    <small v-if="newComment.error" class="p-error">{{ newComment.error }}</small>
    <div class="h-96 mt-2 bg-[var(--surface-b)] rounded-md overflow-scroll">
      <div
        :class="['flex items-start py-3 pl-3 gap-3', index === 0 ? '' : 'border-t border-[var(--surface-d)]']"
        v-show="comments.length"
        v-for="(comment, index) in comments"
        :key="comment.id"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <prime-avatar :image="avatarCache.cache[postContent.user]" v-show="avatarCache.cache[postContent.user]" shape="circle" />
            <prime-avatar icon="pi pi-user" v-show="!avatarCache.cache[postContent.user]" shape="circle" />
            <p>{{ comment.expand?.user.username }}:</p>
          </div>
          <p class="italic text-xs mt-1">{{ formatDate(new Date(comment.created)) }}</p>
        </div>
        <p class="mt-1">{{ comment.comment }}</p>
      </div>
      <div v-show="comments.length === 0" class="flex items-center justify-center h-full font-extrabold text-2xl text-[var(--surface-d)]">
        no comments yet :(
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import PrimeButton from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import PrimeTag from 'primevue/tag';
import PrimeAvatar from 'primevue/avatar';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import pb from '@/pocketbase';
import {
  Collections,
  PostsTypeOptions,
  type CommentsResponse,
  type LanguagesRecord,
  type PostsResponse,
  type SnippetsResponse,
  type UsersResponse
} from '@/util/pocketbase-types';
import { ref } from 'vue';
import { useAvatarCache } from '@/store';
import { formatDate } from '@/util';
import { useToast } from 'primevue/usetoast';

const avatarCache = useAvatarCache();
const toast = useToast();

type ExpandedUserSnippet = { user: UsersResponse; snippet: SnippetsResponse<{ language: LanguagesRecord }> };

const props = defineProps({
  postId: { String, required: true }
});

const postContent = ref({} as PostsResponse<ExpandedUserSnippet>);
const comments = ref([] as Array<CommentsResponse<{ user: UsersResponse }>>);
const newComment = ref({
  text: '',
  error: ''
});

const handleCommentClick = () => {
  if (!pb.authStore.isValid) {
    toast.add({ severity: 'warn', summary: 'Not Authenticated', detail: `You must be signed in to perform this action.`, life: 3000 });
    return;
  }

  if (newComment.value.text.trim() === '') {
    newComment.value.error = 'Comment text is required';
    return;
  }

  pb.collection(Collections.Comments)
    .create({ user: pb.authStore.model?.id, comment: newComment.value.text, post: props.postId })
    .then(() => {
      updateComments();
      toast.add({ severity: 'success', summary: 'Success', detail: `Comment posted.`, life: 3000 });
      newComment.value.text = '';
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: 'Success', detail: `Something went wrong on the server. Please try again.`, life: 3000 });
    });
};

const updateComments = () => {
  pb.collection(Collections.Comments)
    .getFullList<CommentsResponse<{ user: UsersResponse }>>({ filter: `post = "${props.postId}"`, expand: 'user' })
    .then((res) => {
      comments.value = res;
      console.log(comments.value);
    });
};

const resetContent = () => {
  pb.collection(Collections.Posts)
    .getFirstListItem<PostsResponse<ExpandedUserSnippet>>(`id = "${props.postId}"`, { expand: 'user,snippet,snippet.language' })
    .then((res) => {
      postContent.value = res;
    });

  updateComments();
};
defineExpose({ resetContent: () => resetContent() });
</script>
