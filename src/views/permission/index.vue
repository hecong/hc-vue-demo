<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPermissionList, addPermission, editPermission, deletePermission, initPermissionCache } from '@/api/system'
import type { PermissionResponse } from '@/types'

const tableData = ref<PermissionResponse[]>([])
const loading = ref(false)

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  code: '',
  type: 'MENU',
  path: '',
  parentId: undefined as number | undefined
})
const rules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getPermissionList()
    tableData.value = res.data || []
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

async function handleInitCache() {
  try {
    await initPermissionCache()
    ElMessage.success('权限缓存初始化成功')
  } catch (e) {
    // ignore
  }
}

function openAdd() {
  dialogTitle.value = '新增权限'
  editingId.value = null
  Object.assign(form, { name: '', code: '', type: 'MENU', path: '', parentId: undefined })
  dialogVisible.value = true
}

function openEdit(row: PermissionResponse) {
  dialogTitle.value = '编辑权限'
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    code: row.code,
    type: row.type,
    path: row.path || '',
    parentId: row.parentId || undefined
  })
  dialogVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    const payload = { ...form, parentId: form.parentId || undefined }
    if (editingId.value !== null) {
      await editPermission(editingId.value, payload)
    } else {
      await addPermission(payload)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    // ignore
  }
}

async function handleDelete(row: PermissionResponse) {
  await ElMessageBox.confirm(`确定删除权限 "${row.name}" 吗？`, '提示', { type: 'warning' })
  try {
    await deletePermission(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    // ignore
  }
}

function getTypeName(type: string) {
  const map: Record<string, string> = { MENU: '菜单', BUTTON: '按钮', API: '接口' }
  return map[type] || type
}

function getTypeTag(type: string) {
  const map: Record<string, string> = { MENU: '', BUTTON: 'success', API: 'warning' }
  return map[type] || 'info'
}

onMounted(fetchList)
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="form.code" placeholder="如：user:list、user:add" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
            <el-option label="接口" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="form.path" placeholder="菜单路径或接口路径" />
        </el-form-item>
        <el-form-item label="父级ID">
          <el-input-number v-model="form.parentId" :min="0" placeholder="不填为顶级" style="width: 100%" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.permission-page {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    gap: 8px;
  }
}
</style>
