<template>
  <div class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <el-icon class="logo-icon" size="32">
          <Box />
        </el-icon>
        <h1 class="logo-title">模型库</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path.startsWith(item.path) }"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/upload')">
          <el-icon><Upload /></el-icon>
          上传模型
        </el-button>
        <el-avatar 
          class="user-avatar"
          :size="32"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Box, Upload, House, List, Document } from '@element-plus/icons-vue'

const navItems = [
  { path: '/models', title: '模型库', icon: 'House' },
  { path: '/tasks', title: '任务列表', icon: 'List' },
  { path: '/docs', title: '文档', icon: 'Document' }
]
</script>

<style lang="scss" scoped>
.app-header {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .logo-icon {
    color: #409eff;
  }
  
  .logo-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}

.nav-menu {
  display: flex;
  gap: 32px;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    text-decoration: none;
    color: #606266;
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
      color: #409eff;
      background: #ecf5ff;
    }
    
    &.active {
      color: #409eff;
      background: #ecf5ff;
    }
    
    span {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .user-avatar {
    cursor: pointer;
  }
}
</style>