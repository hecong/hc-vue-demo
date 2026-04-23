<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { OfficeBuilding as Building, Message, Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRsaPublicKey, cPasswordLogin, cCodeLogin, bPasswordLogin, bCheckEnterprise, bCodeLogin, platformLogin, sendCode } from '@/api/auth'
import { encryptPassword } from '@/utils'
import type { FormInstance, FormRules } from 'element-plus'
import { storage } from '@/utils/storage'
import { COUNTDOWN_CONFIG, RSA_PUBLIC_KEY_CACHE_HOURS } from '@/constants'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginType = ref<'c' | 'b' | 'platform'>('c')
const loginMode = ref<'password' | 'code'>('password')
const loading = ref(false)
const sendCodeLoading = ref(false)
const countdown = ref(0)
const publicKey = ref('')
let countdownTimer: ReturnType<typeof setInterval> | null = null

const formRef = ref<FormInstance>()
const formData = reactive({
  account: '',
  password: '',
  code: '',
  target: '',
  enterpriseCode: '',
  enterpriseName: ''
})

const cRules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const bRules: FormRules = {
  enterpriseCode: [{ required: true, message: '请输入企业编码', trigger: 'blur' }],
  account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const platformRules: FormRules = {
  account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const currentRules = computed(() => {
  if (loginType.value === 'b') return bRules
  if (loginType.value === 'platform') return platformRules
  return cRules
})

const handleLoginTypeChange = () => {
  formRef.value?.resetFields()
  formData.enterpriseName = ''
}

const handleEnterpriseBlur = async () => {
  if (loginType.value !== 'b' || !formData.enterpriseCode) return
  try {
    const res = await bCheckEnterprise({ enterpriseCode: formData.enterpriseCode })
    if (res.data) {
      formData.enterpriseName = res.data.enterpriseName
    }
  } catch {
    formData.enterpriseName = ''
  }
}

const handleSendCode = async () => {
  if (!formData.target) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }
  sendCodeLoading.value = true
  try {
    await sendCode({ target: formData.target, scene: 'login' })
    ElMessage.success('验证码已发送')
    countdown.value = COUNTDOWN_CONFIG.DEFAULT_SECONDS
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, COUNTDOWN_CONFIG.INTERVAL_MS)
  } catch {
    // ignore
  } finally {
    sendCodeLoading.value = false
  }
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const encryptedPassword = publicKey.value
      ? encryptPassword(formData.password, publicKey.value)
      : formData.password

    let res
    if (loginType.value === 'c') {
      if (loginMode.value === 'password') {
        res = await cPasswordLogin({ account: formData.account, password: encryptedPassword })
      } else {
        res = await cCodeLogin({ target: formData.target, code: formData.code })
      }
    } else if (loginType.value === 'b') {
      if (loginMode.value === 'password') {
        res = await bPasswordLogin({
          enterpriseCode: formData.enterpriseCode,
          username: formData.account,
          password: encryptedPassword
        })
      } else {
        res = await bCodeLogin({
          target: formData.target,
          code: formData.code,
          enterpriseCode: formData.enterpriseCode
        })
      }
    } else {
      res = await platformLogin({ username: formData.account, password: encryptedPassword })
    }

    if (res.data) {
      userStore.setLoginResponse(res.data)
      ElMessage.success('登录成功')

      const redirect = route.query.redirect as string
      router.push(redirect || '/dashboard')
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

const fetchPublicKey = async () => {
  // 优先使用缓存的公钥
  const cachedKey = storage.getRsaPublicKey()
  if (cachedKey) {
    publicKey.value = cachedKey
    return
  }

  try {
    const res = await getRsaPublicKey()
    if (res.data) {
      publicKey.value = res.data
      // 缓存公钥，使用配置的过期时间
      storage.setRsaPublicKey(res.data, RSA_PUBLIC_KEY_CACHE_HOURS)
    }
  } catch {
    // ignore
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

fetchPublicKey()
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>HC管理系统</h2>
        <p>企业级权限管理系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="currentRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item>
          <el-radio-group v-model="loginType" @change="handleLoginTypeChange">
            <el-radio label="c">C端用户</el-radio>
            <el-radio label="b">B端用户</el-radio>
            <el-radio label="platform">平台管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="loginType === 'b'">
          <el-form-item prop="enterpriseCode">
            <el-input
              v-model="formData.enterpriseCode"
              placeholder="请输入企业编码"
              :prefix-icon="Building"
              @blur="handleEnterpriseBlur"
            />
          </el-form-item>
          <el-form-item v-if="formData.enterpriseName" class="enterprise-name-item">
            <span class="enterprise-name-text">企业名称：{{ formData.enterpriseName }}</span>
          </el-form-item>
        </template>

        <el-form-item v-if="loginMode === 'code' && loginType !== 'platform'" prop="target">
          <el-input
            v-model="formData.target"
            placeholder="请输入手机号或邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item v-if="loginMode === 'code' && loginType !== 'platform'">
          <div class="code-input-group">
            <el-input
              v-model="formData.code"
              placeholder="请输入验证码"
              :prefix-icon="Lock"
              style="flex: 1"
            />
            <el-button
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <template v-if="loginMode === 'password' || loginType === 'platform'">
          <el-form-item v-if="loginType !== 'b'" prop="account">
            <el-input
              v-model="formData.account"
              placeholder="请输入账号"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item v-else prop="account">
            <el-input
              v-model="formData.account"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
        </template>

        <el-form-item>
          <el-radio-group v-if="loginType !== 'platform'" v-model="loginMode">
            <el-radio label="password">密码登录</el-radio>
            <el-radio label="code">验证码登录</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            style="width: 100%;"
            size="large"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #3b82f6 70%, #6366f1 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 40%);
    animation: float 8s ease-in-out infinite;
  }
}

.login-box {
  width: 440px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: var(--radius-xl);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  z-index: 1;
  animation: scaleIn 0.5s var(--transition-base) forwards;
  backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
    border-radius: 0 0 4px 4px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;

  h2 {
    font-size: 30px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--primary-600), #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px 0;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
    font-weight: 500;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    height: 44px;
  }

  :deep(.el-input__wrapper) {
    border-radius: var(--radius-md);
    padding-left: 12px;
  }

  :deep(.el-radio-group) {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  :deep(.el-radio) {
    margin-right: 0;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
    font-weight: 500;

    &.is-checked {
      border-color: var(--primary-500);
      background: var(--primary-50);
    }

    &:hover {
      border-color: var(--primary-300);
    }
  }

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    padding-left: 0;
  }

  :deep(.el-button--primary) {
    height: 46px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    border-radius: var(--radius-md);
  }

  .enterprise-name-item {
    margin-top: -16px;
    margin-bottom: 16px;
  }

  .enterprise-name-text {
    color: #67c23a;
  }

  .code-input-group {
    display: flex;
    gap: 8px;
    width: 100%;
  }
}
</style>
