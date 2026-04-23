<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElRow, ElCol, ElStatistic } from 'element-plus'
import { User, ShoppingCart, Goods, TrendCharts } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const envMode = import.meta.env.MODE

const greeting = ref('')

const userName = () => {
  if (userStore.cUserInfo?.nickname) return userStore.cUserInfo.nickname
  if (userStore.bUserInfo?.name) return userStore.bUserInfo.name
  return '用户'
}

onMounted(() => {
  const hour = new Date().getHours()
  if (hour < 12) {
    greeting.value = '早上好'
  } else if (hour < 18) {
    greeting.value = '下午好'
  } else {
    greeting.value = '晚上好'
  }
})
</script>

<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <div class="welcome-content">
        <h2>{{ greeting }}，{{ userName() }}！</h2>
        <p>欢迎使用HC管理系统，祝您工作愉快！</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="用户总数" :value="1256">
            <template #prefix>
              <el-icon size="24" color="#409eff"><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="订单总量" :value="3890">
            <template #prefix>
              <el-icon size="24" color="#67c23a"><ShoppingCart /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="商品数量" :value="8765">
            <template #prefix>
              <el-icon size="24" color="#e6a23c"><Goods /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="本月增长率" :value="23.5" suffix="%">
            <template #prefix>
              <el-icon size="24" color="#f56c6c"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary">用户管理</el-button>
            <el-button type="success">企业管理</el-button>
            <el-button type="warning">角色管理</el-button>
            <el-button type="danger">权限管理</el-button>
            <el-button>日志查看</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <div class="system-info">
            <p><strong>版本：</strong>v1.0.0</p>
            <p><strong>环境：</strong>{{ envMode }}</p>
            <p><strong>用户类型：</strong>{{ userStore.userType }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  .welcome-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    :deep(.el-card__body) {
      padding: 30px;
    }

    .welcome-content {
      color: #fff;

      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
      }

      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }

  .stat-row {
    margin-bottom: 20px;
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .system-info {
    p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #606266;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
