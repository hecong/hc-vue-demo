<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getRoleList, addRole, editRole, deleteRole, assignPermissions, getPermissionList } from '@/api/system'
import type { RoleResponse, PermissionResponse } from '@/types'
import { useTable, useDialog } from '@/composables'

// ==================== 表格 ====================
const {
  loading,
  tableData,
  fetchData
} = useTable<RoleResponse>(
  async () => {
    const res = await getRoleList()
    return res.data || []
  },
  {},
  { defaultPageSize: 0 }
)

// ==================== 新增/编辑弹窗 ====================
const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const {
  visible: dialogVisible,
  title: dialogTitle,
  submitting,
  formData,
  openAdd,
  openEdit,
  handleSubmit
} = useDialog<{ name: string; code: string; description: string }>(
  async (data, editing, id) => {
    if (editing && id) {
      await editRole(Number(id), data)
    } else {
      await addRole(data)
    }
    ElMessage.success('操作成功')
    fetchData()
  },
  { name: '', code: '', description: '' },
  { addTitle: '新增角色', editTitle: '编辑角色' }
)

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await handleSubmit(() => Promise.resolve(true))
}

// ==================== 删除 ====================
async function handleDelete(row: RoleResponse) {
  await ElMessageBox.confirm(`确定删除角色 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // ignore
  }
}

// ==================== 分配权限 ====================
const assignDialogVisible = ref(false)
const assignRoleId = ref<number | null>(null)
const assignRoleName = ref('')
const allPermissions = ref<PermissionResponse[]>([])
const selectedPermissionIds = ref<number[]>([])
const assignLoading = ref(false)

async function openAssign(row: RoleResponse) {
  assignRoleId.value = row.id
  assignRoleName.value = row.name
  selectedPermissionIds.value = []
  assignLoading.value = true
  assignDialogVisible.value = true
  try {
    const res = await getPermissionList()
    allPermissions.value = res.data || []
  } catch {
    // ignore
  } finally {
    assignLoading.value = false
  }
}

async function submitAssign() {
  if (assignRoleId.value === null) return
  try {
    await assignPermissions({ roleId: assignRoleId.value, permissionIds: selectedPermissionIds.value })
    ElMessage.success('权限分配成功')
    assignDialogVisible.value = false
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="role-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" size="small" @click="openAdd">新增角色</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="primary" @click="openAssign(row)">分配权限</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="440px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="如：admin、editor" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog v-model="assignDialogVisible" :title="`分配权限 — ${assignRoleName}`" width="500px">
      <div v-loading="assignLoading">
        <el-checkbox-group v-model="selectedPermissionIds">
          <div v-for="perm in allPermissions" :key="perm.id" class="perm-item">
            <el-checkbox :label="perm.id">
              <span>{{ perm.name }}</span>
              <el-tag size="small" type="info" style="margin-left: 8px">{{ perm.code }}</el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <el-empty v-if="!assignLoading && allPermissions.length === 0" description="暂无权限数据" />
      </div>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.role-page {
  animation: fadeIn 0.4s var(--transition-base);
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

.perm-item {
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
</style>
