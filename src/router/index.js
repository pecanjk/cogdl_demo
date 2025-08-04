import { createRouter, createWebHistory } from 'vue-router'
import ModelHub from '../views/ModelHub.vue'
import ModelDetail from '../views/ModelDetail.vue'
import ModelUpload from '../views/ModelUpload.vue'
import TaskList from '../views/TaskList.vue'

const routes = [
  {
    path: '/',
    redirect: '/models'
  },
  {
    path: '/models',
    name: 'ModelHub',
    component: ModelHub,
    meta: { title: '模型库' }
  },
  {
    path: '/models/:id',
    name: 'ModelDetail',
    component: ModelDetail,
    meta: { title: '模型详情' }
  },
  {
    path: '/upload',
    name: 'ModelUpload',
    component: ModelUpload,
    meta: { title: '上传模型' }
  },
  {
    path: '/tasks',
    name: 'TaskList',
    component: TaskList,
    meta: { title: '任务列表' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router