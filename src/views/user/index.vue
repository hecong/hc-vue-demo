<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { getUserPage, addUser, editUser, deleteUser, assignRoles } from '@/api/user'
import { getRoleList } from '@/api/system'
import type { UserResponse, RoleResponse } from '@/types'
import type { UserRequest } from '@/types/api'
import { formatDate } from '@/utils'
import { useTable, useDialog } from '@/composables'

// ==================== 表格 ====================
const {
  loading,
  tableData,
  total,
  pageNum,
  pageSize,
  searchParams,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  fetchData
} = useTable<UserResponse, { username: string; name: string; phone: string }>(
  async (params) => {
    const res = await getUserPage({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      username: params.username || undefined,
      name: params.name || undefined,
      phone: params.phone || undefined
    })
    return res.data ?? undefined
  },
  { username: '', name: '', phone: '' }
)

// ==================== 添加/编辑弹窗 ====================
const formRef = ref()

const defaultForm: UserRequest = {
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  status: 1
}

const {
  visible: dialogVisible,
  title: dialogTitle,
  isEdit,
  submitting,
  formData,
  openAdd: openAddDialog,
  openEdit: _openEditDialog,
  handleSubmit
} = useDialog<UserRequest>(
  async (data, editing, id) => {
    if (editing && id) {
      await editUser(Number(id), data)
      ElMessage.success('编辑成功')
    } else {
      await addUser(data)
      ElMessage.success('添加成功')
    }
    fetchData()
  },
  defaultForm,
  { addTitle: '添加用户', editTitle: '编辑用户' }
)

const formRules = computed(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: isEdit.value ? [] : [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
}))

function openEditDialog(row: UserResponse) {
  _openEditDialog({
    id: row.id,
    username: row.username,
    password: '',
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status
  } as unknown as UserRequest & { id: number })
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await handleSubmit(() => Promise.resolve(true))
}

// ==================== 删除 ====================
const handleDelete = async (row: UserResponse) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

const getStatusTagType = (status: number) => status === 1 ? 'success' : 'danger'
const getStatusText = (status: number) => status === 1 ? '启用' : '禁用'

// ==================== 分配角色 ====================
const assignDialogVisible = ref(false)
const assignUserId = ref<number | null>(null)
const assignUserName = ref('')
const allRoles = ref<RoleResponse[]>([])
const selectedRoleIds = ref<number[]>([])
const assignLoading = ref(false)

async function openAssignRoles(row: UserResponse) {
  assignUserId.value = row.id
  assignUserName.value = row.name || row.username
  selectedRoleIds.value = []
  assignLoading.value = true
  assignDialogVisible.value = true
  try {
    const res = await getRoleList()
    allRoles.value = res.data || []
  } catch {
    ElMessage.error('获取角色列表失败')
  } finally {
    assignLoading.value = false
  }
}

async function submitAssignRoles() {
  if (assignUserId.value === null) return
  try {
    await assignRoles({ userId: assignUserId.value, roleIds: selectedRoleIds.value })
    ElMessage.success('角色分配成功')
    assignDialogVisible.value = false
  } catch {
    ElMessage.error('分配角色失败，请重试')
  }
}
</script>

<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="page-header">
          <span class="title">用户管理</span>
          <el-button type="primary" :icon="Plus" @click="openAddDialog">
            添加用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchParams.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchParams.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="openAssignRoles(row)">
              分配角色
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option :label="'启用'" :value="1" />
            <el-option :label="'禁用'" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 -->
    <el-dialog v-model="assignDialogVisible" :title="`分配角色 — ${assignUserName}`" width="460px">
      <div v-loading="assignLoading">
        <el-checkbox-group v-model="selectedRoleIds">
          <div v-for="role in allRoles" :key="role.id" class="role-item">
            <el-checkbox :label="role.id">
              <span>{{ role.name }}</span>
              <el-tag size="small" type="info" style="margin-left: 8px">{{ role.code }}</el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <el-empty v-if="!assignLoading && allRoles.length === 0" description="暂无角色数据" />
      </div>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRoles">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.user-management {
  animation: fadeIn 0.4s var(--transition-base);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }
  }

  .search-form {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-light);
  }

  .role-item {
    padding: 10px var(--space-3);
    border-bottom: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);

    &:hover {
      background: var(--gray-50);
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
