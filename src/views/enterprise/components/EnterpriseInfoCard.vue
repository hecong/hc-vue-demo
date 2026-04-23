<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  updateSecuritySetting
} from '@/api/enterprise'
import type { EnterpriseResponse } from '@/types'

const props = withDefaults(defineProps<{
  enterpriseId?: number
}>(), {
  enterpriseId: 1
})

const enterprise = ref<EnterpriseResponse | null>(null)
const loading = ref(false)

const enterpriseFormRef = ref<FormInstance>()
const enterpriseDialogVisible = ref(false)
const enterpriseDialogTitle = ref('')
const enterpriseForm = reactive({
  name: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  validDate: ''
})
const enterpriseRules: FormRules = {
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }]
}

const securityDialogVisible = ref(false)
const securityForm = reactive({
  ipWhitelist: '',
  loginMutualExclusion: 0,
  passwordRule: ''
})

async function fetchEnterprise() {
  let loadingTimer: ReturnType<typeof setTimeout> | null = null
  try {
    loadingTimer = setTimeout(() => {
      loading.value = true
    }, 300)

    const res = await getEnterpriseById(props.enterpriseId)
    enterprise.value = res.data
  } catch {
    // ignore
  } finally {
    if (loadingTimer) clearTimeout(loadingTimer)
    loading.value = false
  }
}

function openCreate() {
  enterpriseDialogTitle.value = '新建企业'
  Object.assign(enterpriseForm, { name: '', contactPerson: '', contactPhone: '', contactEmail: '', address: '', validDate: '' })
  enterpriseDialogVisible.value = true
}

function openEdit() {
  if (!enterprise.value) return
  enterpriseDialogTitle.value = '编辑企业信息'
  Object.assign(enterpriseForm, {
    name: enterprise.value.name,
    contactPerson: enterprise.value.contactPerson,
    contactPhone: enterprise.value.contactPhone,
    contactEmail: enterprise.value.contactEmail,
    address: enterprise.value.address,
    validDate: enterprise.value.validDate
  })
  enterpriseDialogVisible.value = true
}

async function submitEnterprise() {
  const valid = await enterpriseFormRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (enterprise.value && enterpriseDialogTitle.value === '编辑企业信息') {
      await updateEnterprise(enterprise.value.id, {
        name: enterpriseForm.name,
        contactPerson: enterpriseForm.contactPerson,
        contactPhone: enterpriseForm.contactPhone,
        contactEmail: enterpriseForm.contactEmail,
        address: enterpriseForm.address
      })
    } else {
      await createEnterprise({ ...enterpriseForm })
    }
    ElMessage.success('操作成功')
    enterpriseDialogVisible.value = false
    fetchEnterprise()
  } catch {
    // ignore
  }
}

function openSecurity() {
  if (!enterprise.value) return
  Object.assign(securityForm, {
    ipWhitelist: enterprise.value.ipWhitelist || '',
    loginMutualExclusion: enterprise.value.loginMutualExclusion ?? 0,
    passwordRule: enterprise.value.passwordRule || ''
  })
  securityDialogVisible.value = true
}

async function submitSecurity() {
  if (!enterprise.value) return
  try {
    await updateSecuritySetting(enterprise.value.id, { ...securityForm })
    ElMessage.success('安全设置已保存')
    securityDialogVisible.value = false
    fetchEnterprise()
  } catch {
    // ignore
  }
}

defineExpose({ fetchEnterprise })
</script>

<template>
  <el-card class="info-card" v-loading="loading">
    <template #header>
      <div class="card-header">
        <span>企业信息</span>
        <div>
          <el-button type="primary" size="small" @click="openEdit" v-if="enterprise">编辑信息</el-button>
          <el-button size="small" @click="openCreate" v-if="!enterprise">新建企业</el-button>
          <el-button size="small" @click="openSecurity" v-if="enterprise">安全设置</el-button>
        </div>
      </div>
    </template>
    <el-descriptions v-if="enterprise" :column="3" border>
      <el-descriptions-item label="企业名称">{{ enterprise.name }}</el-descriptions-item>
      <el-descriptions-item label="企业编码">{{ enterprise.enterpriseCode }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="enterprise.status === 1 ? 'success' : 'danger'">
          {{ enterprise.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系人">{{ enterprise.contactPerson || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ enterprise.contactPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系邮箱">{{ enterprise.contactEmail || '-' }}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{ enterprise.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="有效期">{{ enterprise.validDate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="IP白名单" :span="3">{{ enterprise.ipWhitelist || '不限制' }}</el-descriptions-item>
      <el-descriptions-item label="互斥登录">{{ enterprise.loginMutualExclusion === 1 ? '开启' : '关闭' }}</el-descriptions-item>
      <el-descriptions-item label="密码规则" :span="2">{{ enterprise.passwordRule || '默认' }}</el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无企业信息" />

    <!-- 企业信息弹窗 -->
    <el-dialog v-model="enterpriseDialogVisible" :title="enterpriseDialogTitle" width="560px">
      <el-form ref="enterpriseFormRef" :model="enterpriseForm" :rules="enterpriseRules" label-width="90px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="enterpriseForm.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="enterpriseForm.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="enterpriseForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="enterpriseForm.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="enterpriseForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="enterpriseForm.validDate" type="date" value-format="YYYY-MM-DD" placeholder="选择有效期" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="enterpriseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEnterprise">确定</el-button>
      </template>
    </el-dialog>

    <!-- 安全设置弹窗 -->
    <el-dialog v-model="securityDialogVisible" title="安全设置" width="500px">
      <el-form :model="securityForm" label-width="110px">
        <el-form-item label="IP白名单">
          <el-input v-model="securityForm.ipWhitelist" type="textarea" :rows="3" placeholder="多个IP用英文逗号分隔，留空不限制" />
        </el-form-item>
        <el-form-item label="互斥登录">
          <el-switch v-model="securityForm.loginMutualExclusion" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
        </el-form-item>
        <el-form-item label="密码规则">
          <el-input v-model="securityForm.passwordRule" placeholder="请输入密码规则描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="securityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSecurity">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped lang="scss">
.info-card {
  :deep(.el-descriptions__cell) {
    padding: var(--space-3) var(--space-4);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}
</style>
