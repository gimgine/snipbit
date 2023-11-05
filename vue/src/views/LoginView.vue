<template>
  <div class="w-full h-full flex flex-col justify-center gap-16 items-center bg-[var(--surface-ground)]">
    <h1 class="text-5xl font-bold">&lt;devScribble /></h1>
    <card class="w-80">
      <template #title
        ><h1 class="text-center">{{ isNewUser ? 'Create Account' : 'Login Using' }}</h1></template
      >
      <template #content>
        <div v-if="!isNewUser" class="flex gap-2 justify-center flex-col">
          <prime-button class="flex justify-center gap-2" @click="authWithOAuth('github')"><i class="pi pi-github"></i>GitHub</prime-button>
          <prime-button class="flex justify-center gap-2" @click="authWithOAuth('microsoft')"><i class="pi pi-microsoft"></i>Microsoft</prime-button>
          <prime-button class="flex justify-center gap-2" @click="authWithOAuth('google')"><i class="pi pi-google"></i>Google</prime-button>
        </div>
        <div v-else class="flex gap-8 justify-center flex-col">
          <file-upload accept="image/*" v-model="profilePicture" :file-limit="1" @select="(e) => (profilePicture = e.files[0])">
            <template #header="{ chooseCallback }">
              {{ (chooseFile = chooseCallback) }}
            </template>
            <template #content="{ files, removeFileCallback }">
              <img v-if="files.length" :src="(files[0] as any).objectURL" class="w-full h-full object-cover rounded-full" />
              <i v-else class="pi pi-user text-4xl"></i>
              <i
                :class="`pi pi-${files.length ? 'times' : 'upload'} absolute right-0 bottom-0 bg-[var(--primary-color)] p-2 rounded-full text-xs`"
                @click="files.length ? removeFileCallback(0) : chooseFile()"
              ></i>
            </template>
          </file-upload>
          <span>
            <span class="p-float-label">
              <input-text
                id="username"
                :class="{ 'p-invalid': username.error, 'w-full': true }"
                v-model="username.text"
                @update:model-value="() => (username.error = '')"
              />
              <label for="username">Username</label>
            </span>
            <small v-if="username.error" class="p-error">{{ username.error }}</small>
          </span>
          <span class="p-float-label">
            <prime-textarea id="bio" class="w-full" v-model="bio" />
            <label for="bio">Bio</label>
          </span>
          <span class="flex justify-center"><prime-button class="w-fit" @click="finishProfile">Finish</prime-button></span>
        </div>
      </template>
    </card>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import PrimeButton from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import PrimeTextarea from 'primevue/textarea';
import pb from '@/pocketbase';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import router from '@/router';

const toast = useToast();

const isNewUser = ref(false);
const profilePicture = ref();
const username = ref({
  text: '',
  error: ''
});
const bio = ref('');

const chooseFile = ref();

const authWithOAuth = (provider: string) => {
  pb.collection('users')
    .authWithOAuth2({ provider: provider, scopes: ['error'] })
    .then((res) => {
      if (res.meta?.isNew) {
        isNewUser.value = true;
        username.value = res.meta.username ?? '';
      }
    })
    .catch(() => toast.add({ severity: 'error', summary: 'Error', detail: `Failed to authenticate with ${provider}.`, life: 3000 }));
};

const finishProfile = () => {
  if (username.value.text === '') {
    username.value.error = 'Username is required';
    return;
  }
  pb.collection('users')
    .update(pb.authStore.model?.id, {
      username: username.value.text,
      bio: bio.value,
      avatar: profilePicture.value
    })
    .then(() => router.push({ name: 'home' }))
    .catch(() => toast.add({ severity: 'error', summary: 'Error', detail: `There was a problem finishing your account.`, life: 3000 }));
};
</script>

<style>
.p-fileupload-buttonbar {
  display: none;
}
.p-fileupload-content {
  border-style: dashed;
  border-radius: 100%;
  width: 7rem;
  height: 7rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}
.p-fileupload {
  width: 100%;
  height: 7rem;
  display: flex;
  justify-content: center;
}
</style>
