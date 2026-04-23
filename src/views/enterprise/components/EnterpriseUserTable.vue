<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createEnterpriseUser,
  editEnterpriseUser,
  deleteEnterpriseUser,
  resetEnterpriseUserPassword,
  activateEnterpriseUser,
  updateEnterpriseUserStatus,
  getEnterpriseUserPage
} from '@/api/enterprise'
import type { EnterpriseUserResponse } from '@/types'
import type { EnterpriseUserCreateRequest, ResetEnterpriseUserPasswordRequest } from '@/types/api'
import { useTable, useDialog } from '@/composables'

const props = withDefaults(defineProps<{
  enterpriseId?: number
}>(), {
  enterpriseId: 1
})

// ==================== 用户列表 ====================
const { loading, tableData, total, pageNum, pageSize, searchParams, handleSearch, handleReset } = useTable<EnterpriseUserResponse, { username: string; name: string; status: string }>(
  async (params) => {
    const apiParams: {
      pageNum: number
      pageSize: number
      enterpriseId: number
      username?: string
      name?: string
      status?: number
    } = {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      enterpriseId: props.enterpriseId
    }
    if (params.username) apiParams.username = params.username
    if (params.name) apiParams.name = params.name
    if (params.status !== '') apiParams.status = Number(params.status)
    const res = await getEnterpriseUserPage(apiParams)
    return res.data
  },
  { username: '', name: '', status: '' },
  { defaultPageSize: 10, pageSizes: [10, 20, 50] }
)

// ==================== 用户新增/编辑弹窗 ====================
const userFormRef = ref<FormInstance>()

const defaultUserForm: EnterpriseUserCreateRequest = {
  enterpriseId: props.enterpriseId,
  username: '',
  password: '',
  name: '',
  phone: '',
  email: ''
}

const {
  visible: userDialogVisible,
  title: userDialogTitle,
  editId: editingUserId,
  formData: userForm,
  openAdd: openAddUser,
  openEdit: openEditUserRaw,
  handleSubmit: submitUserRaw
} = useDialog<EnterpriseUserCreateRequest>(
  async (data, isEdit, editId) => {
    if (isEdit && editId) {
      await editEnterpriseUser(editId as number, data)
    } else {
      await createEnterpriseUser(data)
    }
    ElMessage.success('操作成功')
    handleSearch()
  },
  defaultUserForm,
  { addTitle: '新增企业用户', editTitle: '编辑企业用户' }
)

const userRules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: !editingUserId.value, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}))

function openEditUser(row: EnterpriseUserResponse) {
  openEditUserRaw(row as unknown as EnterpriseUserCreateRequest & { id?: number })
}

async function submitUser() {
  await submitUserRaw(async () => {
    return (await userFormRef.value?.validate().catch(() => false)) ?? false
  })
}

// ==================== 重置密码弹窗 ====================
const resetPwdFormRef = ref<FormInstance>()
const resetPwdDialogVisible = ref(false)
const resetPwdUserId = ref<number | null>(null)
const resetPwdForm = reactive<ResetEnterpriseUserPasswordRequest>({ newPassword: '' })
const resetPwdRules: FormRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
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
  } catch {
    // ignore
  }
}

// ==================== 其他操作 ====================
async function handleDeleteUser(row: EnterpriseUserResponse) {
  await ElMessageBox.confirm(`确定删除用户 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deleteEnterpriseUser(row.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch {
    // ignore
  }
}

async function handleActivateUser(row: EnterpriseUserResponse) {
  try {
    await activateEnterpriseUser(row.id)
    ElMessage.success('激活成功')
    handleSearch()
  } catch {
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
    handleSearch()
  } catch {
    // ignore
  }
}
</script>

<template>
  <el-card class="user-card">
    <template #header>
      <div class="card-header">
        <span>企业用户</span>
        <el-button type="primary" size="small" @click="openAddUser">新增用户</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="searchParams" class="search-form">
      <el-form-item label="用户名">
        <el-input v-model="searchParams.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="searchParams.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchParams.status" placeholder="全部" clearable style="width: 100px">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border stripe>
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
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="pagination"
      @change="handleSearch"
    />

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="userDialogTitle" width="480px">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="editingUserId !== undefined" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editingUserId">
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
  </el-card>
</template>

<style scoped lang="scss">
.user-card {
  // no specific styles needed
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

.search-form {
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.pagination {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
}
</style>
