<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPermissionList, addPermission, editPermission, deletePermission, initPermissionCache } from '@/api/system'
import type { PermissionResponse } from '@/types'
import { useTable, useDialog } from '@/composables'

// ==================== 表格 ====================
const {
  loading,
  tableData,
  fetchData
} = useTable<PermissionResponse>(
  async () => {
    const res = await getPermissionList()
    return res.data || []
  },
  {},
  { defaultPageSize: 0 }
)

// ==================== 新增/编辑弹窗 ====================
const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const {
  visible: dialogVisible,
  title: dialogTitle,
  submitting,
  formData,
  openAdd,
  openEdit,
  handleSubmit
} = useDialog<{ name: string; code: string; type: string; path: string; parentId?: number }>(
  async (data, editing, id) => {
    const payload = { ...data, parentId: data.parentId || undefined }
    if (editing && id) {
      await editPermission(Number(id), payload)
    } else {
      await addPermission(payload)
    }
    ElMessage.success('操作成功')
    fetchData()
  },
  { name: '', code: '', type: 'MENU', path: '', parentId: undefined },
  { addTitle: '新增权限', editTitle: '编辑权限' }
)

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  await handleSubmit(() => Promise.resolve(true))
}

// ==================== 删除 ====================
async function handleDelete(row: PermissionResponse) {
  await ElMessageBox.confirm(`确定删除权限 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deletePermission(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // ignore
  }
}

// ==================== 缓存初始化 ====================
async function handleInitCache() {
  try {
    await initPermissionCache()
    ElMessage.success('权限缓存初始化成功')
  } catch {
    // ignore
  }
}

function getTypeName(type: string) {
  const map: Record<string, string> = { MENU: '菜单', BUTTON: '按钮', API: '接口' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, 'success' | 'warning' | 'info'> = { MENU: 'info', BUTTON: 'success', API: 'warning' }
  return map[type] || 'info'
}
</script>

<template>
  <div class="permission-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <div>
            <el-button size="small" @click="handleInitCache">初始化缓存</el-button>
            <el-button type="primary" size="small" @click="openAdd">新增权限</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe row-key="id">
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限编码" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="160" show-overflow-tooltip />
        <el-table-column prop="parentId" label="父级ID" width="90" align="center">
          <template #default="{ row }">{{ row.parentId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="如：user:list、user:add" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
            <el-option label="接口" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="formData.path" placeholder="菜单路径或接口路径" />
        </el-form-item>
        <el-form-item label="父级ID">
          <el-input-number v-model="formData.parentId" :min="0" placeholder="不填为顶级" style="width: 100%" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.permission-page {
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

  div {
    display: flex;
    gap: 8px;
  }
}
</style>
