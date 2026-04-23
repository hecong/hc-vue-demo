<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElButton } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  UserFilled,
  Setting,
  Document,
  Bell,
  Fold,
  Expand,
  SwitchButton,
  Tools
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapsed = ref(false)
const activeMenu = computed(() => route.path)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const userName = computed(() => {
  if (userStore.cUserInfo?.nickname) return userStore.cUserInfo.nickname
  if (userStore.bUserInfo?.name) return userStore.bUserInfo.name
  return '用户'
})

const userAvatar = computed(() => {
  return userStore.cUserInfo?.avatar || defaultAvatar
})

const userTypeLabel = computed(() => {
  const type = userStore.userType
  if (type === 'C') return 'C端用户'
  if (type === 'B') return 'B端用户'
  if (type === 'P') return '平台管理员'
  return ''
})

const visibleMenus = computed(() => {
  const isPlatform = userStore.userType === 'P'
  const hasPermissions = userStore.permissions.length > 0

  // 有权限数据时按权限控制，没有权限数据时平台管理员显示全部，其他用户只显示基础菜单
  const canShow = (permission: string) => {
    if (hasPermissions) return userStore.hasPermission(permission)
    return isPlatform
  }

  return [
    { path: '/dashboard', title: '首页', icon: HomeFilled, show: true },
    { path: '/user', title: '用户管理', icon: UserFilled, show: canShow('user:list') },
    { path: '/enterprise', title: '企业管理', icon: Tools, show: canShow('enterprise:list') },
    { path: '/role', title: '角色管理', icon: Setting, show: canShow('role:list') },
    { path: '/permission', title: '权限管理', icon: Document, show: canShow('permission:list') },
    { path: '/log', title: '日志管理', icon: Bell, show: canShow('log:list') },
    { path: '/profile', title: '个人中心', icon: UserFilled, show: true }
  ].filter(item => item.show)
})

let isNavigating = false

const handleMenuSelect = (path: string) => {
  if (route.path === path) return
  if (isNavigating) return
  isNavigating = true
  router.push(path).catch(() => {}).finally(() => {
    isNavigating = false
  })
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
  }
}

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo?.permissions?.length) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }
})
</script>

<template>
  <div class="main-layout">
    <aside :class="['sidebar', { collapsed: isCollapsed }]">
      <div class="logo">
        <h1 v-show="!isCollapsed">HC管理系统</h1>
        <span v-show="isCollapsed">HC</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="menu in visibleMenus"
          :key="menu.path"
          :index="menu.path"
        >
          <el-icon><component :is="menu.icon" /></el-icon>
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-content">
      <header class="header">
        <div class="header-left">
          <el-button text @click="toggleCollapse">
            <el-icon :size="20">
              <Fold v-if="!isCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title && route.path !== '/dashboard'">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tag type="info" size="small">{{ userTypeLabel }}</el-tag>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar">{{ userName }}</el-avatar>
              <span class="username">{{ userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><UserFilled /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-body);
}

.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--bg-sidebar);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);

  &.collapsed {
    width: 72px;
  }

  .logo {
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1));
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 20%;
      right: 20%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
    }

    h1 {
      margin: 0;
      white-space: nowrap;
      background: linear-gradient(135deg, #fff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    span {
      font-size: 22px;
      font-weight: 900;
      background: linear-gradient(135deg, #fff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  :deep(.el-menu) {
    border: none;
    background: transparent;
    padding: var(--space-2) 0;
    flex: 1;

    .el-menu-item {
      color: rgba(255, 255, 255, 0.65);
      height: 48px;
      line-height: 48px;
      margin: 3px 10px;
      border-radius: var(--radius-md);
      font-weight: 500;
      font-size: var(--text-sm);
      transition: all var(--transition-fast);

      .el-icon {
        font-size: 18px;
        margin-right: 12px;
      }

      &:hover {
        background: var(--bg-sidebar-hover);
        color: rgba(255, 255, 255, 0.9);
      }

      &.is-active {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15));
        color: #fff;
        font-weight: 600;
        box-shadow: 0 0 16px rgba(59, 130, 246, 0.15);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(180deg, var(--primary-400), var(--primary-600));
          border-radius: 0 3px 3px 0;
        }
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-5);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    .el-button {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      color: var(--text-tertiary);

      &:hover {
        color: var(--primary-500);
        background: var(--primary-50);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    .el-tag {
      background: linear-gradient(135deg, var(--primary-50), #ede9fe);
      border: 1px solid var(--primary-200);
      color: var(--primary-700);
      font-weight: 600;
      height: 28px;
      line-height: 26px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      border: 1px solid transparent;

      &:hover {
        background: var(--gray-50);
        border-color: var(--border-light);
      }

      .el-avatar {
        border: 2px solid var(--bg-surface);
        box-shadow: var(--shadow-sm);
      }

      .username {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

.main {
  flex: 1;
  overflow: auto;
  background: var(--bg-body);
  padding: var(--space-5);
}
</style>
