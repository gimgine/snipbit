<template>
  <prime-dialog v-model:visible="open" modal header="Create Post" class="w-96">
    <div v-if="active === null" class="flex flex-wrap gap-4 p-2">
      <prime-button
        class="w-[calc(50%-1rem)] aspect-square flex flex-col justify-center bg-[var(--surface-c)] border-[var(--surface-c)] text-[var(--primary-color)] gap-2"
        @click="active = State.CODE"
        ><i class="pi pi-code text-5xl"></i>
        <p class="italic">share some code</p>
      </prime-button>
      <prime-button
        class="w-[calc(50%-1rem)] aspect-square flex flex-col justify-center bg-[var(--surface-c)] border-[var(--surface-c)] text-[var(--primary-color)] gap-2"
        @click="active = State.IMAGE"
        ><i class="pi pi-image text-5xl"></i>
        <p class="italic">share an image</p>
      </prime-button>
      <prime-button
        class="w-[calc(50%-1rem)] aspect-square flex flex-col justify-center bg-[var(--surface-c)] border-[var(--surface-c)] text-[var(--primary-color)] gap-2"
        @click="active = State.TEXT"
        ><span class="text-5xl">.txt</span>
        <p class="italic">share some words</p>
      </prime-button>
      <prime-button
        class="w-[calc(50%-1rem)] aspect-square flex flex-col justify-center bg-[var(--surface-c)] border-[var(--surface-c)] text-[var(--primary-color)] gap-2"
        @click="active = State.LINK"
        ><i class="pi pi-link text-5xl"></i>
        <p class="italic">share a link</p>
      </prime-button>
    </div>
    <div v-else-if="active === State.CODE" class="flex flex-col gap-8 pt-6">
      <div class="p-float-label">
        <dropdown
          v-model="codeForm.snippet.value"
          inputId="code_description"
          option-label="title"
          :options="snippets"
          :class="`w-full ${codeForm.snippet.error ? 'p-invalid' : ''}`"
          show-clear
          @update:model-value="codeForm.snippet.error = ''"
        >
          <template #option="{ option }"
            >{{ option.title }} <small class="italic">{{ option.expand.language?.name ?? option.customLanguage }}</small></template
          >
        </dropdown>
        <label for="code_description">{{ codeForm.snippet.label }}</label>
      </div>
      <small v-if="codeForm.snippet.error" class="p-error mt-[-1.5rem]">{{ codeForm.snippet.error }}</small>
      <div class="p-float-label">
        <prime-textarea
          v-model="codeForm.description.value"
          id="code_description"
          :class="`w-full ${codeForm.description.error ? 'p-invalid' : ''}`"
        ></prime-textarea>
        <label for="code_description">{{ codeForm.description.label }}</label>
      </div>
    </div>
    <div v-else-if="active === State.IMAGE"></div>
    <div v-else-if="active === State.TEXT"></div>
    <div v-else-if="active === State.LINK"></div>
    <template #footer v-if="active !== null"><prime-button @click="createPost">Post</prime-button></template>
  </prime-dialog>
</template>

<script setup lang="ts">
import pb from '@/pocketbase';
import { Collections, PostsTypeOptions, type PostsRecord, type SnippetsResponse } from '@/util/pocketbase-types';
import PrimeButton from 'primevue/button';
import PrimeDialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import PrimeTextarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { ref, type Ref } from 'vue';

enum State {
  CODE,
  IMAGE,
  TEXT,
  LINK
}

const toast = useToast();
const open = ref(false);
const active: Ref<null | State> = ref(null);
const snippets = ref([] as SnippetsResponse[]);
const codeForm = ref({
  snippet: { label: 'Snippet', value: null, error: '' },
  description: { label: 'Description', value: '', error: '' }
});
const imageForm = ref({
  image: { label: 'Image', value: '', error: '' },
  caption: { label: 'Caption', value: '', error: '' }
});
const textForm = ref({
  content: { label: 'Content', value: '', error: '' }
});
const linkForm = ref({
  link: { label: 'Link', value: '', error: '' },
  description: { label: 'Description', value: '', error: '' }
});

const createPost = () => {
  let params;
  switch (active.value) {
    case State.CODE:
      if (!codeForm.value.snippet.value) {
        codeForm.value.snippet.error = 'Please select a snippet';
        return;
      }
      params = {
        snippet: (codeForm.value.snippet.value as SnippetsResponse).id,
        caption: codeForm.value.description.value,
        user: pb.authStore.model?.id,
        type:
          ((codeForm.value.snippet.value as SnippetsResponse).expand as any).language.name === 'HTML/CSS/JS'
            ? PostsTypeOptions.htmlcssjs
            : PostsTypeOptions.code
      } as PostsRecord;
  }
  pb.collection(Collections.Posts)
    .create(params)
    .then(() => {
      toast.add({ severity: 'success', summary: 'Success', detail: `Post successfully created.`, life: 3000 });
      open.value = false;
    })
    .catch(() => toast.add({ severity: 'error', summary: 'Error', detail: `There was a problem creating the post.`, life: 3000 }));
};

defineExpose({
  open: async () => {
    [codeForm, imageForm, textForm, linkForm].forEach((form: any) =>
      Object.keys(form.value).forEach((field) => (form.value[field].value, (form.value[field].error = '')))
    );
    codeForm.value.snippet.value = null;
    open.value = true;
    active.value = null;
    snippets.value = (
      await pb.collection(Collections.Snippets).getList(undefined, undefined, { filter: `user = "${pb.authStore.model?.id}"`, expand: 'language' })
    ).items;
    console.log(snippets.value);
  }
});
</script>
