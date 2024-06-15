import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import("../views/Login.vue")
  },
  {
    path: '/home',
    name: 'home',
    component: () => import("../views/Home.vue"),
    redirect: '/MeetRoom', //默认展示/MeetRoom子页面
    // 注册子页面
    children: [
      {
        path: '/MeetRoom',
        name: 'MeetRoom',
        component: () => import("../views/MeetRoom.vue")
      },
      {
        path: '/Meet',
        name: 'Meet',
        component: () => import("../views/Meet.vue")
      },
      {
        path: '/User',
        name: 'User',
        component: () => import("../views/User.vue")
      },
      {
        path: '/Admin',
        name: 'Admin',
        component: () => import("../views/Admin.vue")
      },
      {
        path: '/Dispatch',
        name: 'Dispatch',
        component: () => import("../views/Dispatch.vue")
      }
    ]
  },
 
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
