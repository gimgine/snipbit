<template>
  <prime-card class="bg-[var(--surface-c)]">
    <template #header>
      <vue-monaco-editor
        v-if="postType === PostsTypeOptions.code"
        :language="monacoName"
        theme="vs-dark"
        :value="snippetContent"
        class="min-h-[200px] rounded-t overflow-hidden"
        :options="{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: true,
          formatOnType: true,
          lineNumbers: 'off',
          lineDecorationsWidth: 0
        }"
      />
      <div v-else-if="postType === PostsTypeOptions.htmlcssjs" ref="iframeContainer" class="w-full h-80 flex flex-col">
        <div class="w-full rounded-t h-8 flex gap-4 items-center px-4 bg-[var(--surface-card)]">
          <div class="flex gap-2">
            <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-red-500"></div>
            <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-yellow-500"></div>
            <div class="w-[0.65rem] h-[0.65rem] rounded-[50%] bg-green-500"></div>
          </div>
          <div
            class="rounded-sm flex-1 h-5 flex justify-between items-center px-2 truncate border border-[var(--surface-border)] bg-[var(--surface-ground)]"
          >
            <span class="text-[0.65rem] text-gray-400 truncate">https://snipbit.dev/snipbit</span>
            <i class="pi pi-search text-xs"></i>
          </div>
          <i class="pi pi-bars text-xs"></i>
        </div>
        <iframe
          ref="iframe"
          class="w-full flex-1 bg-white"
          :srcdoc="`<html><head><style>${JSON.parse(snippetContent ?? '').css}</style></head><body>${
            JSON.parse(snippetContent ?? '').html
          }</body><script>${JSON.parse(snippetContent ?? '').javascript}</script></html>`"
        ></iframe>
      </div>
    </template>
    <template #title>
      <div class="flex justify-between">
        <div class="flex items-center gap-4">
          <h1>{{ title }}</h1>
          <prime-tag :value="languageName" />
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="flex gap-2 items-center cursor-pointer" @click="$router.push({ name: 'profile', params: { username } })">
            <h1 class="text-sm">{{ username }}</h1>
            <prime-avatar :image="avatarCache.cache[userId]" v-show="avatarCache.cache[userId]" shape="circle" />
            <prime-avatar icon="pi pi-user" v-show="!avatarCache.cache[userId]" shape="circle" />
          </div>
          <div>
            <h1 class="text-xs italic opacity-70">{{ formatDate(new Date(created)) }}</h1>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      {{ caption }}
    </template>
    <template #footer>
      <div class="flex justify-between items-center">
        <div class="flex gap-3">
          <span>
            <i :class="['pi pi-heart text-xl', likeId ? 'text-red-500' : '']" @click="handleLikeClick" />
            {{ likeCount }}
          </span>
          <span>
            <i :class="['pi pi-comment text-xl', commentId ? 'text-green-500' : '']" @click="handleCommentClick" />
            {{ commentCount }}
          </span>
          <i :class="['pi pi-bookmark text-xl', saveId ? 'text-blue-500' : '']" @click="handleSaveClick" />
        </div>
        <prime-button icon="pi pi-chevron-right" text rounded label="Open" @click="handleOpenClick" />
      </div>
    </template>
  </prime-card>
</template>

<script setup lang="ts">
import { Collections, PostsTypeOptions, type LikesRecord, type LikesResponse } from '@/util/pocketbase-types';
import PrimeCard from 'primevue/card';
import PrimeButton from 'primevue/button';
import PrimeTag from 'primevue/tag';
import PrimeAvatar from 'primevue/avatar';
import { useToast } from 'primevue/usetoast';
import VueMonacoEditor from '@guolao/vue-monaco-editor';
import { ref, onMounted, type PropType, inject, computed } from 'vue';
import pb from '@/pocketbase';
import { useAvatarCache } from '@/store';

const avatarCache = useAvatarCache();

const toast = useToast();

const likeId = ref('');
const commentId = ref('');
const saveId = ref('');

const likeCount = ref(0);
const commentCount = ref(0);

const props = defineProps({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  snippetId: { type: String },
  monacoName: { type: String },
  languageName: { type: String },
  snippetContent: { type: String },
  title: { type: String, required: true },
  username: { type: String, required: true },
  created: { type: String, required: true },
  caption: { type: String, required: true },
  postType: { type: String as PropType<PostsTypeOptions>, required: true },
  comments: { type: Array },
  likes: { type: Array },
  saves: { type: Array }
});

const openPostDialog = inject<(postId: string) => void>('openPostDialog');

const handleLikeClick = () => {
  if (!pb.authStore.isValid) {
    toast.add({ severity: 'warn', summary: 'Not Authenticated', detail: `You must be signed in to perform this action.`, life: 3000 });
    return;
  }

  if (likeId.value) {
    // user is unliking
    let temp = likeId.value;
    likeId.value = ''; // putting it out here to make it more responsive
    if (pb.authStore.model) {
      pb.collection(Collections.Likes)
        .delete(temp)
        .then(() => {
          likeId.value = '';
          likeCount.value -= 1;
        })
        .catch(() => {
          likeId.value = temp;
          toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong on the server. Please try again.', life: 3000 });
        });
    }
  } else {
    // user is liking
    if (pb.authStore.model) {
      likeId.value = 'liked'; // putting it out here to make it more responsive
      pb.collection(Collections.Likes)
        .create({
          user: pb.authStore.model.id,
          post: props.postId
        })
        .then((res) => {
          likeId.value = res.id;
          likeCount.value += 1;
        })
        .catch(() => {
          likeId.value = '';
          toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong on the server. Please try again.', life: 2000 });
        });
    }
  }
};

const handleCommentClick = () => {};

const handleSaveClick = () => {};

const handleOpenClick = () => {
  if (openPostDialog) {
    openPostDialog(props.postId);
  }
};

const checkIfLiked = () => {
  likeCount.value = props.likes?.length ?? 0;
  likeId.value = (props.likes?.find((e: any) => e.user === pb.authStore.model?.id) as LikesResponse)?.id ?? '';
};

const checkIfCommented = () => {
  commentCount.value = props.comments?.length ?? 0;
  commentId.value = (props.comments?.find((e: any) => e.user === pb.authStore.model?.id) as LikesResponse)?.id ?? '';
};

const checkIfSaved = () => {
  saveId.value = (props.saves?.find((e: any) => e.user === pb.authStore.model?.id) as LikesResponse)?.id ?? '';
};

const formatDate = (date: Date) => {
  const now = new Date();
  const elapsed = now.getTime() - date.getTime();
  let elapsedString = '';
  switch (true) {
    case elapsed < 1000:
      elapsedString = `1 second ago`;
      break;
    case elapsed < 60000:
      const seconds = Math.floor(elapsed / 1000);
      elapsedString = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
      break;
    case elapsed < 3600000:
      const minutes = Math.floor(elapsed / 60000);
      elapsedString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      break;
    case elapsed < 86400000:
      const hours = Math.floor(elapsed / 3600000);
      elapsedString = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      break;
    default:
      const days = Math.floor(elapsed / 86400000);
      elapsedString = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  return elapsedString;
};

onMounted(() => {
  checkIfLiked();
  checkIfCommented();
  checkIfSaved();
});
</script>
