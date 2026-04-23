<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EnterpriseInfoCard from './components/EnterpriseInfoCard.vue'
import EnterpriseUserTable from './components/EnterpriseUserTable.vue'

const ENTERPRISE_ID = 1

const infoCardRef = ref<InstanceType<typeof EnterpriseInfoCard>>()

onMounted(() => {
  infoCardRef.value?.fetchEnterprise()
})
</script>

<template>
  <div class="enterprise-page">
    <EnterpriseInfoCard ref="infoCardRef" :enterprise-id="ENTERPRISE_ID" />
    <EnterpriseUserTable :enterprise-id="ENTERPRISE_ID" />
  </div>
</template>

<style scoped lang="scss">
.enterprise-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fadeIn 0.4s var(--transition-base);
}
</style>
