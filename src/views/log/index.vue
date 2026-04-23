<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLoginLogPage } from '@/api/log'
import type { LoginLogResponse } from '@/types'

const tableData = ref<LoginLogResponse[]>([])
const total = ref(0)
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const searchForm = reactive({ userType: '', userId: undefined as number | undefined })

async function fetchList() {
  loading.value = true
  try {
    const params: any = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (searchForm.userType) params.userType = searchForm.userType
    if (searchForm.userId) params.userId = searchForm.userId
    const res = await getLoginLogPage(params)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function search() {
  pageNum.value = 1
  fetchList()
}

function resetSearch() {
  Object.assign(searchForm, { userType: '', userId: undefined })
  search()
}

function getStatusTag(status: number) {
  return status === 1 ? 'success' : 'danger'
}

function getStatusText(status: number) {
  return status === 1 ? '成功' : '失败'
}

function getUserTypeText(type: string) {
  const map: Record<string, string> = { C: 'C端用户', B: 'B端用户', P: '平台管理员' }
  return map[type] || type
}

onMounted(fetchList)
</script>

<template>
  <div class="log-page">
    <el-card>
      <template #header>
        <span>登录日志</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="全部" clearable style="width: 130px">
            <el-option label="C端用户" value="C" />
            <el-option label="B端用户" value="B" />
            <el-option label="平台管理员" value="P" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input-number v-model="searchForm.userId" :min="1" placeholder="请输入用户ID" controls-position="right" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="account" label="账号" min-width="130" />
        <el-table-column prop="userType" label="用户类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ getUserTypeText(row.userType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginStatus" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.loginStatus)" size="small">{{ getStatusText(row.loginStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginIp" label="登录IP" min-width="130" />
        <el-table-column prop="loginLocation" label="登录地点" min-width="130" show-overflow-tooltip />
        <el-table-column prop="loginDevice" label="登录设备" min-width="160" show-overflow-tooltip />
        <el-table-column prop="failReason" label="失败原因" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.failReason || '-' }}</template>
        </el-table-column>
        <el-table-column prop="loginTime" label="登录时间" min-width="160" />
      </el-table>

      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @change="fetchList"
      />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.log-page {
  padding: 16px;
}

.search-form {
  margin-bottom: 12px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
