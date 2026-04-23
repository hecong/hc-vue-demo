<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getRoleList, addRole, editRole, deleteRole, assignPermissions, getPermissionList } from '@/api/system'
import type { RoleResponse, PermissionResponse } from '@/types'

const tableData = ref<RoleResponse[]>([])
const loading = ref(false)

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingId = ref<number | null>(null)
const form = reactive({ name: '', code: '', description: '' })
const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

// 分配权限
const assignDialogVisible = ref(false)
const assignRoleId = ref<number | null>(null)
const assignRoleName = ref('')
const allPermissions = ref<PermissionResponse[]>([])
const selectedPermissionIds = ref<number[]>([])
const assignLoading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getRoleList()
    tableData.value = res.data || []
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function openAdd() {
  dialogTitle.value = '新增角色'
  editingId.value = null
  Object.assign(form, { name: '', code: '', description: '' })
  dialogVisible.value = true
}

function openEdit(row: RoleResponse) {
  dialogTitle.value = '编辑角色'
  editingId.value = row.id
  Object.assign(form, { name: row.name, code: row.code, description: row.description })
  dialogVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (editingId.value !== null) {
      await editRole(editingId.value, { ...form })
    } else {
      await addRole({ ...form })
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    // ignore
  }
}

async function handleDelete(row: RoleResponse) {
  await ElMessageBox.confirm(`确定删除角色 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    // ignore
  }
}

async function openAssign(row: RoleResponse) {
  assignRoleId.value = row.id
  assignRoleName.value = row.name
  assignLoading.value = true
  assignDialogVisible.value = true
  try {
    const res = await getPermissionList()
    allPermissions.value = res.data || []
    // 初始化已选（实际应从接口获取该角色已有权限，此处默认空）
    selectedPermissionIds.value = []
  } catch (e) {
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
  } catch (e) {
    // ignore
  }
}

onMounted(fetchList)
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="如：admin、editor" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
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
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.perm-item {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}
</style>
