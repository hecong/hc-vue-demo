<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCUserProfile, updateCUserProfile, changeCUserPassword } from '@/api/cuser'
import { changeEnterpriseUserPassword } from '@/api/enterprise'
import type { CUserResponse } from '@/types'
import type { UpdateProfileRequest } from '@/types/api.d'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const cUserInfo = ref<CUserResponse | null>(null)

const isCUser = computed(() => userStore.isCUser)
const isBUser = computed(() => userStore.isBUser)
const bInfo = computed(() => userStore.bUserInfo)

const profileForm = reactive({ nickname: '', avatar: '', gender: 0, birthday: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const displayName = computed(() => {
  if (isCUser.value) return cUserInfo.value?.nickname || cUserInfo.value?.username || '-'
  if (isBUser.value) return bInfo.value?.name || bInfo.value?.username || '-'
  return userStore.userInfo?.userType === 'P' ? '平台管理员' : '-'
})

const displaySub = computed(() => {
  if (isCUser.value) return cUserInfo.value?.phone || cUserInfo.value?.email || ''
  if (isBUser.value) return bInfo.value?.phone || bInfo.value?.email || ''
  return ''
})

async function fetchCUserProfile() {
  loading.value = true
  try {
    const res = await getCUserProfile()
    if (res.data) {
      cUserInfo.value = res.data
      Object.assign(profileForm, {
        nickname: res.data.nickname || '',
        avatar: res.data.avatar || '',
        gender: res.data.gender || 0,
        birthday: res.data.birthday || ''
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleUpdateProfile() {
  saving.value = true
  try {
    const data: UpdateProfileRequest = {
      nickname: profileForm.nickname || undefined,
      avatar: profileForm.avatar || undefined,
      gender: profileForm.gender,
      birthday: profileForm.birthday || undefined
    }
    await updateCUserProfile(data)
    ElMessage.success('更新成功')
    fetchCUserProfile()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  try {
    const payload = { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword }
    if (isCUser.value) {
      await changeCUserPassword(payload)
    } else {
      await changeEnterpriseUserPassword(payload)
    }
    ElMessage.success('密码修改成功')
    Object.assign(passwordForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  if (isCUser.value) fetchCUserProfile()
})
</script>

<template>
  <div class="profile-page">
    <el-card v-loading="loading">
      <template #header>
        <span>个人中心</span>
      </template>

      <div class="profile-content">
        <!-- 头部信息 -->
        <div class="profile-header">
          <el-avatar :size="80" :src="(isCUser ? cUserInfo?.avatar : undefined) || defaultAvatar" />
          <div class="user-info">
            <h3>{{ displayName }}</h3>
            <p>{{ displaySub }}</p>
            <el-tag size="small" :type="isCUser ? '' : isBUser ? 'success' : 'warning'">
              {{ isCUser ? 'C端用户' : isBUser ? 'B端用户' : '平台管理员' }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <!-- C端用户：基本信息编辑 -->
        <template v-if="isCUser">
          <h4>基本信息</h4>
          <el-form :model="profileForm" label-width="80px" class="section-form">
            <el-form-item label="用户名">
              <el-input :value="cUserInfo?.username" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input :value="cUserInfo?.phone" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input :value="cUserInfo?.email" disabled />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="profileForm.gender">
                <el-radio :label="0">未知</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="profileForm.birthday" type="date" value-format="YYYY-MM-DD" placeholder="选择生日" style="width: 100%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleUpdateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>

          <el-divider />
        </template>

        <!-- B端用户：只读信息展示 -->
        <template v-if="isBUser">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border class="b-info">
            <el-descriptions-item label="用户名">{{ bInfo?.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ bInfo?.name }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ bInfo?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ bInfo?.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ bInfo?.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="企业编码">{{ bInfo?.enterpriseCode }}</el-descriptions-item>
          </el-descriptions>

          <el-divider />
        </template>

        <!-- 修改密码（C端和B端都支持） -->
        <template v-if="isCUser || isBUser">
          <h4>修改密码</h4>
          <el-form :model="passwordForm" label-width="80px" class="section-form">
            <el-form-item label="原密码">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </template>

        <!-- 平台管理员无密码修改入口提示 -->
        <template v-if="!isCUser && !isBUser">
          <el-empty description="平台管理员账号请联系超级管理员修改信息" />
        </template>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  padding: 16px;

  .profile-content {
    max-width: 640px;

    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 0;

      .user-info {
        h3 {
          margin: 0 0 6px 0;
          font-size: 20px;
        }

        p {
          margin: 0 0 8px 0;
          color: #909399;
          font-size: 14px;
        }
      }
    }

    h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
      color: #303133;
    }

    .section-form {
      max-width: 480px;
    }

    .b-info {
      margin-bottom: 0;
    }
  }
}
</style>
