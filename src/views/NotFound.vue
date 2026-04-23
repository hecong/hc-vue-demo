<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found-container">
    <div class="content">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" :icon="HomeFilled" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-body) 0%, #e0e7ff 50%, var(--bg-body) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 20%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
    border-radius: 50%;
  }

  .content {
    text-align: center;
    position: relative;
    z-index: 1;
    animation: fadeInUp 0.6s var(--transition-base);

    h1 {
      font-size: 140px;
      font-weight: 900;
      background: linear-gradient(135deg, var(--primary-500), #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      line-height: 1;
      letter-spacing: -4px;
    }

    p {
      font-size: 18px;
      color: var(--text-secondary);
      margin: 24px 0 36px;
      font-weight: 500;
    }

    .el-button {
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 600;
    }
  }
}
</style>
