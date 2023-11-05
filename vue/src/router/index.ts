import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import SnippetsView from '@/views/SnippetsView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/snippets',
      name: 'snippets',
      component: SnippetsView
    },
    {
      path: '/:username',
      name: 'profile',
      component: ProfileView,
      props: true
    }
  ]
});

export default router;
