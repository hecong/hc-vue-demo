<script setup lang="ts">
import { getLoginLogPage } from '@/api/log'
import type { LoginLogResponse } from '@/types'
import { useTable } from '@/composables'

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
  handleSizeChange
} = useTable<LoginLogResponse, { userType: string; userId: number | undefined }>(
  async (params) => {
    const res = await getLoginLogPage({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      userType: params.userType || undefined,
      userId: params.userId || undefined
    })
    return res.data ?? undefined
  },
  { userType: '', userId: undefined },
  { defaultPageSize: 20, pageSizes: [20, 50, 100] }
)

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
</script>

<template>
  <div class="log-page">
    <el-card>
      <template #header>
        <span>登录日志</span>
      </template>

      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="用户类型">
          <el-select v-model="searchParams.userType" placeholder="全部" clearable style="width: 130px">
            <el-option label="C端用户" value="C" />
            <el-option label="B端用户" value="B" />
            <el-option label="平台管理员" value="P" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input-number v-model="searchParams.userId" :min="1" placeholder="请输入用户ID" controls-position="right" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
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
        @change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.log-page {
  animation: fadeIn 0.4s var(--transition-base);
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
