import { createRouter, createWebHistory } from 'vue-router'
import CreateChangeView from '../views/CreateChangeView.vue'
import QueryChangeView from '../views/QueryChangeView.vue'
import ReviewChangeView from '../views/ReviewChangeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/change/create' },
    { path: '/change/create', name: 'change-create', component: CreateChangeView },
    { path: '/change/query', name: 'change-query', component: QueryChangeView },
    { path: '/change/review', name: 'change-review', component: ReviewChangeView }
  ]
})
