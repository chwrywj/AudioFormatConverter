import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'audio-format-conversion',
      component: () => import('../views/AudioFormatConversion.vue')
    }
  ]
})

export default router
