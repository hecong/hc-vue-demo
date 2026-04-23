<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElPagination, ElMessage, ElMessageBox, ElForm, ElFormItem, ElInput, ElDialog, ElTag, ElSelect, ElOption } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { getUserPage, addUser, editUser, deleteUser, assignRoles } from '@/api/user'
import { getRoleList } from '@/api/system'
import type { UserResponse, RoleResponse } from '@/types'
import type { UserRequest } from '@/types/api.d'
import { formatDate } from '@/utils'

const loading = ref(false)
const tableData = ref<UserResponse[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  username: '',
  name: '',
  phone: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const formRef = ref()
const submitting = ref(false)

const formData = reactive<UserRequest>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  status: 1
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      username: searchForm.username || undefined,
      name: searchForm.name || undefined,
      phone: searchForm.phone || undefined
    })
    if (res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.name = ''
  searchForm.phone = ''
  handleSearch()
}

const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  fetchData()
}

const openAddDialog = () => {
  dialogTitle.value = '添加用户'
  Object.assign(formData, {
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    status: 1
  })
  dialogVisible.value = true
}

const openEditDialog = (row: UserResponse) => {
  dialogTitle.value = '编辑用户'
  Object.assign(formData, {
    username: row.username,
    password: '',
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status
  })
  formData.id = row.id
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (dialogTitle.value === '添加用户') {
      await addUser(formData)
      ElMessage.success('添加成功')
    } else {
      await editUser(formData.id!, formData)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

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
      console.error(error)
    }
  }
}

const getStatusTagType = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusText = (status: number) => {
  return status === 1 ? '启用' : '禁用'
}

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
  } catch (e) {
    // ignore
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
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  fetchData()
})
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

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
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
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="dialogTitle === '编辑用户'" />
        </el-form-item>
        <el-form-item v-if="dialogTitle === '添加用户'" label="密码" prop="password">
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
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
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
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .search-form {
    margin-bottom: 16px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .role-item {
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
