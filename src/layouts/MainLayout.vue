<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElSubMenu, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElButton } from 'element-plus'
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
const activeMenu = ref(route.path)

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

const handleMenuSelect = (path: string) => {
  router.push(path)
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
        router
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
}

.sidebar {
  width: 200px;
  height: 100vh;
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b3a4a;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #3a4a5a;

    h1 {
      margin: 0;
      white-space: nowrap;
    }

    span {
      font-size: 20px;
    }
  }

  :deep(.el-menu) {
    border: none;
    background: #304156;

    .el-menu-item {
      color: #bfcbd9;
      height: 50px;
      line-height: 50px;

      &:hover {
        background: #263445;
        color: #409eff;
      }

      &.is-active {
        background: #409eff;
        color: #fff;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.main {
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
  padding: 16px;
}
</style>
