import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { storage } from '@/utils/storage'
import { useUserStore } from '@/stores/user'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permissions?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', requiresAuth: true, permissions: ['user:list'] }
      },
      {
        path: 'enterprise',
        name: 'Enterprise',
        component: () => import('@/views/enterprise/index.vue'),
        meta: { title: '企业管理', requiresAuth: true, permissions: ['enterprise:list'] }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/role/index.vue'),
        meta: { title: '角色管理', requiresAuth: true, permissions: ['role:list'] }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/permission/index.vue'),
        meta: { title: '权限管理', requiresAuth: true, permissions: ['permission:list'] }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '日志管理', requiresAuth: true, permissions: ['log:list'] }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = storage.getToken()
  const title = to.meta.title

  if (title) {
    document.title = `${title} - HC管理系统`
  }

  if (to.meta.requiresAuth !== false) {
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    const requiredPermissions = to.meta.permissions
    if (requiredPermissions?.length) {
      const userStore = useUserStore()
      const userPermissions = userStore.permissions

      if (userPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(p => userPermissions.includes(p))
        if (!hasPermission) {
          next({ name: 'Dashboard' })
          return
        }
      } else {
        // 已登录但权限数据尚未加载，放行由页面内获取后重新判断
        // 若需更严格，可在此触发 fetchUserInfo 并等待结果
      }
    }
  }

  if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
