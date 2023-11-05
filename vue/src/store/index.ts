import { defineStore } from 'pinia';
import { ref } from 'vue';
import pb from '@/pocketbase';
import { Collections } from '@/util/pocketbase-types';

export const useStore = defineStore('store', () => {});

export const useAvatarCache = defineStore('avatarCache', () => {
  const cache = ref<Record<string, string>>({});

  const getAvatarUrlForId = async (userId: string) => {
    if (!(userId in cache.value)) {
      cache.value[userId] = '';
      const user = await pb.collection(Collections.Users).getOne(userId, { requestKey: null });
      cache.value[userId] = pb.files.getUrl(user, user.avatar);
    }
  };

  return { getAvatarUrlForId, cache };
});
