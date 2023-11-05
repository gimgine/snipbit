<template>
  <prime-card class="my-2 bg-[var(--surface-c)]">
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
    </template>
    <template #title>
      <div class="flex justify-between">
        <div class="flex items-center gap-4">
          <h1>{{ title }}</h1>
          <prime-tag :value="languageName" />
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="flex gap-2 items-center">
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
          <i :class="['pi pi-heart text-xl', isPostLiked ? 'text-red-500' : '']" @click="handleLikeClick" />
          <i :class="['pi pi-comment text-xl', isPostCommented ? 'text-green-500' : '']" @click="handleCommentClick" />
          <i :class="['pi pi-share-alt text-xl -rotate-90', isPostForked ? 'text-blue-500' : '']" @click="handleForkClick" />
        </div>
        <prime-button icon="pi pi-chevron-right" text rounded label="Open" @click="handleOpenClick" />
      </div>
    </template>
  </prime-card>
</template>

<script setup lang="ts">
import { Collections, PostsTypeOptions } from '@/util/pocketbase-types';
import PrimeCard from 'primevue/card';
import PrimeButton from 'primevue/button';
import PrimeTag from 'primevue/tag';
import PrimeAvatar from 'primevue/avatar';
import { useToast } from 'primevue/usetoast';
import VueMonacoEditor from '@guolao/vue-monaco-editor';
import { ref, onMounted, type PropType, inject } from 'vue';
import pb from '@/pocketbase';
import { useAvatarCache } from '@/store';

const avatarCache = useAvatarCache();

const toast = useToast();

const isPostLiked = ref(false);
const isPostCommented = ref(false);
const isPostForked = ref(false);

const likeId = ref('');

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
  postType: { type: String as PropType<PostsTypeOptions>, required: true }
});

const openPostDialog = inject<(postId: string) => void>('openPostDialog');

const handleLikeClick = () => {
  if (isPostLiked.value) {
    // user is unliking
    isPostLiked.value = false; // putting it out here to make it more responsive
    if (pb.authStore.model) {
      pb.collection(Collections.Likes)
        .delete(likeId.value)
        .then(() => {
          likeId.value = '';
        })
        .catch(() => {
          isPostLiked.value = true;
          toast.add({ severity: 'error', detail: 'Something went wrong on the server. Please try again.' });
        });
    }
  } else {
    // user is liking
    if (pb.authStore.model) {
      isPostLiked.value = true; // putting it out here to make it more responsive
      pb.collection(Collections.Likes)
        .create({
          user: pb.authStore.model.id,
          post: props.postId
        })
        .then((res) => {
          likeId.value = res.id;
        })
        .catch(() => {
          isPostLiked.value = false;
          toast.add({ severity: 'error', detail: 'Something went wrong on the server. Please try again.', life: 2000 });
        });
    }
  }
};

const handleCommentClick = () => {};

const handleForkClick = () => {};

const handleOpenClick = () => {
  if (openPostDialog) {
    openPostDialog(props.postId);
  }
};

const checkIfLiked = () => {
  if (pb.authStore.model) {
    pb.collection(Collections.Likes)
      .getFirstListItem(`post = "${props.postId}" && user = "${pb.authStore.model.id}"`)
      .then((res) => {
        isPostLiked.value = true;
        likeId.value = res.id;
      })
      .catch(() => {
        isPostLiked.value = false;
      });
  }
};

const checkIfCommented = () => {
  if (pb.authStore.model) {
    pb.collection(Collections.Comments)
      .getFirstListItem(`post = "${props.postId}" && user = "${pb.authStore.model.id}"`)
      .then(() => {
        isPostCommented.value = true;
      })
      .catch(() => {
        isPostCommented.value = false;
      });
  }
};

const checkIfForked = () => {
  if (pb.authStore.model) {
    pb.collection(Collections.Snippets)
      .getFirstListItem(`user = "${pb.authStore.model.id}" && forkedFrom = "${props.snippetId}"`)
      .then(() => {
        isPostForked.value = true;
      })
      .catch(() => {
        isPostForked.value = false;
      });
  }
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
  checkIfForked();
});
</script>
