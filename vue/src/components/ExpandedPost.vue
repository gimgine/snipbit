<template>
  <div class="w-96">
    <vue-monaco-editor
      :language="postContent.expand?.snippet.expand?.language.monacoName"
      theme="vs-dark"
      :value="postContent.expand?.snippet.content"
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
  </div>
</template>

<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import pb from '@/pocketbase';
import { Collections, type LanguagesRecord, type PostsResponse, type SnippetsResponse, type UsersResponse } from '@/util/pocketbase-types';
import { ref } from 'vue';

type ExpandedUserSnippet = { user: UsersResponse; snippet: SnippetsResponse<{ language: LanguagesRecord }> };

const props = defineProps({
  postId: { String, required: true }
});

const postContent = ref({} as PostsResponse<ExpandedUserSnippet>);

const resetContent = () => {
  pb.collection(Collections.Posts)
    .getFirstListItem<PostsResponse<ExpandedUserSnippet>>(`id = "${props.postId}"`, { expand: 'user,snippet,snippet.language' })
    .then((res) => {
      postContent.value = res;
    });
};
defineExpose({ resetContent });
</script>
