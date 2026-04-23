<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElCard, ElRow, ElCol } from 'element-plus'
import { User, ShoppingCart, Goods, TrendCharts, Tools, Setting, Document, Bell, InfoFilled, Timer } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const envMode = import.meta.env.MODE

const greeting = ref('')
const currentDate = ref('')

const userName = computed(() => {
  if (userStore.cUserInfo?.nickname) return userStore.cUserInfo.nickname
  if (userStore.bUserInfo?.name) return userStore.bUserInfo.name
  return '用户'
})

onMounted(() => {
  const hour = new Date().getHours()
  if (hour < 12) {
    greeting.value = '早上好'
  } else if (hour < 18) {
    greeting.value = '下午好'
  } else {
    greeting.value = '晚上好'
  }
  currentDate.value = new Date().toLocaleDateString('zh-CN')
})
</script>

<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>{{ greeting }}，{{ userName }}！</h2>
          <p>欢迎使用 HC 管理系统，祝您工作愉快！</p>
        </div>
        <div class="welcome-icon">
          <el-icon :size="48" color="rgba(255,255,255,0.25)"><TrendCharts /></el-icon>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card-blue">
          <div class="stat-item">
            <div class="stat-icon"><el-icon :size="28"><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">用户总数</div>
              <div class="stat-value">1,256</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card-green">
          <div class="stat-item">
            <div class="stat-icon"><el-icon :size="28"><ShoppingCart /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">订单总量</div>
              <div class="stat-value">3,890</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card-orange">
          <div class="stat-item">
            <div class="stat-icon"><el-icon :size="28"><Goods /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">商品数量</div>
              <div class="stat-value">8,765</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card-red">
          <div class="stat-item">
            <div class="stat-icon"><el-icon :size="28"><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">本月增长率</div>
              <div class="stat-value">23.5<span class="stat-suffix">%</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="section-row">
      <el-col :xs="24" :lg="16">
        <el-card class="action-card">
          <template #header>
            <div class="card-header-title">
              <el-icon :size="18"><Tools /></el-icon>
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="$router.push('/user')">
              <div class="action-icon blue"><el-icon :size="22"><User /></el-icon></div>
              <span>用户管理</span>
            </div>
            <div class="action-item" @click="$router.push('/enterprise')">
              <div class="action-icon green"><el-icon :size="22"><Tools /></el-icon></div>
              <span>企业管理</span>
            </div>
            <div class="action-item" @click="$router.push('/role')">
              <div class="action-icon orange"><el-icon :size="22"><Setting /></el-icon></div>
              <span>角色管理</span>
            </div>
            <div class="action-item" @click="$router.push('/permission')">
              <div class="action-icon red"><el-icon :size="22"><Document /></el-icon></div>
              <span>权限管理</span>
            </div>
            <div class="action-item" @click="$router.push('/log')">
              <div class="action-icon purple"><el-icon :size="22"><Bell /></el-icon></div>
              <span>日志查看</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="info-card">
          <template #header>
            <div class="card-header-title">
              <el-icon :size="18"><InfoFilled /></el-icon>
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info">
            <div class="info-row">
              <span class="info-label">系统版本</span>
              <el-tag type="primary" size="small">v1.0.0</el-tag>
            </div>
            <div class="info-row">
              <span class="info-label">运行环境</span>
              <span class="info-value">{{ envMode }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">用户类型</span>
              <el-tag :type="userStore.userType === 'P' ? 'warning' : 'success'" size="small">
                {{ userStore.userType === 'P' ? '平台管理员' : userStore.userType === 'B' ? 'B端用户' : 'C端用户' }}
              </el-tag>
            </div>
            <el-divider style="margin: 16px 0;" />
            <div class="info-footer">
              <el-icon :size="14" color="var(--text-tertiary)"><Timer /></el-icon>
              <span>{{ currentDate }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  animation: fadeIn 0.4s var(--transition-base);

  .welcome-card {
    margin-bottom: var(--space-5);
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
    border: none;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
      border-radius: 50%;
    }

    :deep(.el-card__body) {
      padding: 32px 36px;
      position: relative;
      z-index: 1;
    }

    .welcome-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;

      .welcome-text {
        h2 {
          margin: 0 0 8px 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.85;
          font-weight: 500;
        }
      }

      .welcome-icon {
        animation: float 4s ease-in-out infinite;
      }
    }
  }

  .stat-row {
    margin-bottom: var(--space-5);

    .el-col {
      margin-bottom: var(--space-4);
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-info {
      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
        font-weight: 500;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 26px;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.5px;
        line-height: 1;

        .stat-suffix {
          font-size: 16px;
          font-weight: 600;
          margin-left: 2px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .stat-card-blue .stat-icon {
    background: linear-gradient(135deg, #dbeafe, #eff6ff);
    color: var(--primary-600);
  }

  .stat-card-green .stat-icon {
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    color: #16a34a;
  }

  .stat-card-orange .stat-icon {
    background: linear-gradient(135deg, #fef3c7, #fffbeb);
    color: #d97706;
  }

  .stat-card-red .stat-icon {
    background: linear-gradient(135deg, #fee2e2, #fef2f2);
    color: #dc2626;
  }

  .section-row {
    .el-col {
      margin-bottom: var(--space-4);
    }
  }

  .card-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-4);

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5) var(--space-3);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      background: var(--bg-surface);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-200);
      }

      .action-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        transition: transform var(--transition-fast);
      }

      &:hover .action-icon {
        transform: scale(1.1);
      }

      span {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-secondary);
      }

      .action-icon.blue {
        background: linear-gradient(135deg, #dbeafe, #eff6ff);
        color: var(--primary-600);
      }
      .action-icon.green {
        background: linear-gradient(135deg, #dcfce7, #f0fdf4);
        color: #16a34a;
      }
      .action-icon.orange {
        background: linear-gradient(135deg, #fef3c7, #fffbeb);
        color: #d97706;
      }
      .action-icon.red {
        background: linear-gradient(135deg, #fee2e2, #fef2f2);
        color: #dc2626;
      }
      .action-icon.purple {
        background: linear-gradient(135deg, #ede9fe, #f5f3ff);
        color: #7c3aed;
      }
    }
  }

  .info-card {
    .system-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-3) 0;
        border-bottom: 1px solid var(--border-light);

        &:last-of-type {
          border-bottom: none;
        }

        .info-label {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .info-value {
          font-size: var(--text-sm);
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .info-footer {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-xs);
        color: var(--text-tertiary);
      }
    }
  }
}
</style>
