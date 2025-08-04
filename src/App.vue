<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <AppHeader />
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue'
</script>

<style lang="scss">
#app {
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  height: 100%;
}

.app-header {
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.app-main {
  padding: 20px;
  background: #f5f7fa;
}
</style>