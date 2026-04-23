<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getEnterpriseById,
  createEnterprise,
  updateEnterprise,
  updateSecuritySetting,
  createEnterpriseUser,
  editEnterpriseUser,
  deleteEnterpriseUser,
  resetEnterpriseUserPassword,
  activateEnterpriseUser,
  updateEnterpriseUserStatus,
  getEnterpriseUserPage
} from '@/api/enterprise'
import type { EnterpriseResponse, EnterpriseUserResponse } from '@/types'

// ==================== 企业信息 ====================
const enterprise = ref<EnterpriseResponse | null>(null)
const enterpriseLoading = ref(false)
const ENTERPRISE_ID = 1

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
  enterpriseLoading.value = true
  try {
    const res = await getEnterpriseById(ENTERPRISE_ID)
    enterprise.value = res.data
  } catch (e) {
    // ignore
  } finally {
    enterpriseLoading.value = false
  }
}

function openCreateEnterprise() {
  enterpriseDialogTitle.value = '新建企业'
  Object.assign(enterpriseForm, { name: '', contactPerson: '', contactPhone: '', contactEmail: '', address: '', validDate: '' })
  enterpriseDialogVisible.value = true
}

function openEditEnterprise() {
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
  } catch (e) {
    // ignore
  }
}

function openSecuritySetting() {
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
  } catch (e) {
    // ignore
  }
}

// ==================== 企业用户 ====================
const userTableData = ref<EnterpriseUserResponse[]>([])
const userTotal = ref(0)
const userLoading = ref(false)
const userPageNum = ref(1)
const userPageSize = ref(10)
const userSearchForm = reactive({ username: '', name: '', status: '' })

const userFormRef = ref<FormInstance>()
const userDialogVisible = ref(false)
const userDialogTitle = ref('')
const editingUserId = ref<number | null>(null)
const userForm = reactive({
  enterpriseId: ENTERPRISE_ID,
  username: '',
  password: '',
  name: '',
  phone: '',
  email: ''
})
const userRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const resetPwdFormRef = ref<FormInstance>()
const resetPwdDialogVisible = ref(false)
const resetPwdUserId = ref<number | null>(null)
const resetPwdForm = reactive({ newPassword: '' })
const resetPwdRules: FormRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

async function fetchUsers() {
  userLoading.value = true
  try {
    const params: any = {
      pageNum: userPageNum.value,
      pageSize: userPageSize.value,
      enterpriseId: ENTERPRISE_ID
    }
    if (userSearchForm.username) params.username = userSearchForm.username
    if (userSearchForm.name) params.name = userSearchForm.name
    if (userSearchForm.status !== '') params.status = Number(userSearchForm.status)
    const res = await getEnterpriseUserPage(params)
    userTableData.value = res.data?.list || []
    userTotal.value = res.data?.total || 0
  } catch (e) {
    // ignore
  } finally {
    userLoading.value = false
  }
}

function searchUsers() {
  userPageNum.value = 1
  fetchUsers()
}

function resetSearch() {
  Object.assign(userSearchForm, { username: '', name: '', status: '' })
  searchUsers()
}

function openAddUser() {
  userDialogTitle.value = '新增企业用户'
  editingUserId.value = null
  Object.assign(userForm, { enterpriseId: ENTERPRISE_ID, username: '', password: '', name: '', phone: '', email: '' })
  userDialogVisible.value = true
}

function openEditUser(row: EnterpriseUserResponse) {
  userDialogTitle.value = '编辑企业用户'
  editingUserId.value = row.id
  Object.assign(userForm, {
    enterpriseId: row.enterpriseId,
    username: row.username,
    password: '',
    name: row.name,
    phone: row.phone || '',
    email: row.email || ''
  })
  userDialogVisible.value = true
}

async function submitUser() {
  const valid = await userFormRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (editingUserId.value !== null) {
      await editEnterpriseUser(editingUserId.value, { ...userForm })
    } else {
      await createEnterpriseUser({ ...userForm })
    }
    ElMessage.success('操作成功')
    userDialogVisible.value = false
    fetchUsers()
  } catch (e) {
    // ignore
  }
}

async function handleDeleteUser(row: EnterpriseUserResponse) {
  await ElMessageBox.confirm(`确定删除用户 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deleteEnterpriseUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (e) {
    // ignore
  }
}

async function handleActivateUser(row: EnterpriseUserResponse) {
  try {
    await activateEnterpriseUser(row.id)
    ElMessage.success('激活成功')
    fetchUsers()
  } catch (e) {
    // ignore
  }
}

async function handleToggleStatus(row: EnterpriseUserResponse) {
  const newStatus = row.status === 1 ? 0 : 1
  const label = newStatus === 1 ? '启用' : '禁用'
  await ElMessageBox.confirm(`确定${label}用户 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await updateEnterpriseUserStatus(row.id, newStatus)
    ElMessage.success(`已${label}`)
    fetchUsers()
  } catch (e) {
    // ignore
  }
}

function openResetPwd(row: EnterpriseUserResponse) {
  resetPwdUserId.value = row.id
  resetPwdForm.newPassword = ''
  resetPwdDialogVisible.value = true
}

async function submitResetPwd() {
  const valid = await resetPwdFormRef.value?.validate().catch(() => false)
  if (!valid) return
  if (resetPwdUserId.value === null) return
  try {
    await resetEnterpriseUserPassword(resetPwdUserId.value, { newPassword: resetPwdForm.newPassword })
    ElMessage.success('密码重置成功')
    resetPwdDialogVisible.value = false
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  fetchEnterprise()
  fetchUsers()
})
</script>

<template>
  <div class="enterprise-page">
    <!-- 企业信息卡片 -->
    <el-card class="info-card" v-loading="enterpriseLoading">
      <template #header>
        <div class="card-header">
          <span>企业信息</span>
          <div>
            <el-button type="primary" size="small" @click="openEditEnterprise" v-if="enterprise">编辑信息</el-button>
            <el-button size="small" @click="openCreateEnterprise" v-if="!enterprise">新建企业</el-button>
            <el-button size="small" @click="openSecuritySetting" v-if="enterprise">安全设置</el-button>
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
    </el-card>

    <!-- 企业用户列表 -->
    <el-card class="user-card">
      <template #header>
        <div class="card-header">
          <span>企业用户</span>
          <el-button type="primary" size="small" @click="openAddUser">新增用户</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="userSearchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="userSearchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userSearchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userSearchForm.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userTableData" v-loading="userLoading" border stripe>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isFirstLogin" label="激活状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isFirstLogin === 1 ? 'warning' : 'success'" size="small">
              {{ row.isFirstLogin === 1 ? '未激活' : '已激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditUser(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openResetPwd(row)">重置密码</el-button>
            <el-button v-if="row.isFirstLogin === 1" size="small" type="success" @click="handleActivateUser(row)">激活</el-button>
            <el-button size="small" :type="row.status === 1 ? 'info' : 'primary'" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="userPageNum"
        v-model:page-size="userPageSize"
        :total="userTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @change="fetchUsers"
      />
    </el-card>

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

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="userDialogTitle" width="480px">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="editingUserId !== null" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="editingUserId === null">
          <el-input v-model="userForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="resetPwdDialogVisible" title="重置密码" width="400px">
      <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules" label-width="80px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.enterprise-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 12px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
