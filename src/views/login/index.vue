<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElRadioGroup, ElRadio, ElMessage, ElTabs, ElTabPane } from 'element-plus'
import { User, Lock, Message, Building } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRsaPublicKey, cPasswordLogin, cCodeLogin, bPasswordLogin, bCheckEnterprise, bCodeLogin, platformLogin, sendCode } from '@/api/auth'
import { encryptPassword } from '@/utils'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginType = ref<'c' | 'b' | 'platform'>('c')
const loginMode = ref<'password' | 'code'>('password')
const loading = ref(false)
const sendCodeLoading = ref(false)
const countdown = ref(0)
const publicKey = ref('')

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

const codeScene = computed(() => {
  return loginMode.value === 'code' ? 'login' : ''
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
  } catch (error) {
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
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error(error)
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
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchPublicKey = async () => {
  try {
    const res = await getRsaPublicKey()
    if (res.data) {
      publicKey.value = res.data
    }
  } catch (error) {
    console.error('获取公钥失败', error)
  }
}

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
              prefix-icon="Building"
              @blur="handleEnterpriseBlur"
            />
          </el-form-item>
          <el-form-item v-if="formData.enterpriseName" style="margin-top: -16px; margin-bottom: 16px;">
            <span style="color: #67c23a;">企业名称：{{ formData.enterpriseName }}</span>
          </el-form-item>
        </template>

        <el-form-item v-if="loginMode === 'code' && loginType !== 'platform'" prop="target">
          <el-input
            v-model="formData.target"
            placeholder="请输入手机号或邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item v-if="loginMode === 'code' && loginType !== 'platform'">
          <div style="display: flex; gap: 8px; width: 100%;">
            <el-input
              v-model="formData.code"
              placeholder="请输入验证码"
              prefix-icon="Lock"
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
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item v-else prop="account">
            <el-input
              v-model="formData.account"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    color: #303133;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    height: 40px;
  }

  :deep(.el-radio-group) {
    width: 100%;
  }
}
</style>
