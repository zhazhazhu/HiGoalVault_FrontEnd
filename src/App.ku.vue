<script setup lang="ts">
import { useTheme } from './composables'

const { theme, themeVars } = useTheme({
  colorTheme: '#3854F8',
  buttonSmallRadius: '4px',
  buttonMediumRadius: '4px',
  buttonLargeRadius: '4px',
  actionSheetRadius: '20px',
  colorSuccess: '#4e92de',
})
</script>

<template>
  <!-- 需要确保已注册 WdConfigProvider 组件 -->
  <wd-config-provider :theme="theme" :theme-vars="themeVars">
    <KuRootView />
  </wd-config-provider>
</template>
