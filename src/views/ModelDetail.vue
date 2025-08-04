<template>
  <div class="model-detail" v-loading="loading">
    <div v-if="currentModel" class="detail-container">
      <!-- 模型头部信息 -->
      <div class="model-header">
        <div class="header-left">
          <div class="author-info">
            <el-avatar :size="40" :src="currentModel.avatar" />
            <div class="author-details">
              <h1 class="model-title">{{ currentModel.name }}</h1>
              <span class="author-name">{{ currentModel.author }}</span>
            </div>
          </div>
          <p class="model-description">{{ currentModel.description }}</p>
          
          <div class="model-tags">
            <el-tag
              v-for="tag in currentModel.tags"
              :key="tag"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="header-actions">
          <el-button
            type="primary"
            size="large"
            @click="downloadModel"
          >
            <el-icon><Download /></el-icon>
            下载模型
          </el-button>
          <el-button
            :type="currentModel.liked ? 'primary' : 'default'"
            size="large"
            @click="toggleLike"
          >
            <el-icon>
              <Star v-if="!currentModel.liked" />
              <StarFilled v-else />
            </el-icon>
            {{ currentModel.liked ? '已点赞' : '点赞' }}
          </el-button>
          <el-button
            size="large"
            @click="editModel"
            v-if="canEdit"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="model-stats">
        <div class="stat-card">
          <div class="stat-number">{{ formatNumber(currentModel.downloads) }}</div>
          <div class="stat-label">下载量</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ formatNumber(currentModel.likes) }}</div>
          <div class="stat-label">点赞数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ currentModel.size }}</div>
          <div class="stat-label">模型大小</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ currentModel.framework }}</div>
          <div class="stat-label">框架</div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-section">
        <div class="main-content">
          <!-- README内容 -->
          <div class="readme-section">
            <h2>模型说明</h2>
            <div class="readme-content" v-html="renderMarkdown(currentModel.readme)"></div>
          </div>
        </div>
        
        <div class="sidebar">
          <!-- 文件列表 -->
          <div class="files-section">
            <h3>模型文件</h3>
            <div class="file-list">
              <div
                v-for="file in currentModel.files"
                :key="file.name"
                class="file-item"
              >
                <div class="file-info">
                  <el-icon class="file-icon">
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <span class="file-size">{{ file.size }}</span>
              </div>
            </div>
          </div>

          <!-- 模型信息 -->
          <div class="info-section">
            <h3>模型信息</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">类型:</span>
                <span class="info-value">{{ currentModel.model_type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">框架:</span>
                <span class="info-value">{{ currentModel.framework }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">许可证:</span>
                <span class="info-value">{{ currentModel.license }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ formatFullDate(currentModel.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间:</span>
                <span class="info-value">{{ formatFullDate(currentModel.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <ModelEditDialog
      v-model="editDialogVisible"
      :model="currentModel"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Star, StarFilled, Edit, Document } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useModelsStore } from '../stores/models'
import ModelEditDialog from '../components/models/ModelEditDialog.vue'
import * as api from '../api/models'

const route = useRoute()
const router = useRouter()
const modelsStore = useModelsStore()

const { currentModel, loading, fetchModel, likeModel, updateModel } = modelsStore
const editDialogVisible = ref(false)

// 是否可以编辑（这里简化处理，实际应该检查用户权限）
const canEdit = computed(() => true)

onMounted(async () => {
  try {
    await fetchModel(route.params.id)
  } catch (error) {
    ElMessage.error('获取模型详情失败')
    router.push('/models')
  }
})

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatFullDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const renderMarkdown = (content) => {
  return marked(content || '')
}

const toggleLike = async () => {
  try {
    await likeModel(currentModel.value.id)
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const downloadModel = async () => {
  try {
    const response = await api.downloadModel(currentModel.value.id)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${currentModel.value.name}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载开始')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const editModel = () => {
  editDialogVisible.value = true
}

const handleSave = async (modelData) => {
  try {
    await updateModel(currentModel.value.id, modelData)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style lang="scss" scoped>
.model-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;
  
  .header-left {
    flex: 1;
    
    .author-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      .author-details {
        .model-title {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 600;
          color: #303133;
        }
        
        .author-name {
          font-size: 16px;
          color: #606266;
        }
      }
    }
    
    .model-description {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #606266;
      line-height: 1.6;
    }
    
    .model-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .header-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 200px;
  }
}

.model-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #f0f0f0;
  
  .stat-card {
    background: #fff;
    padding: 24px;
    text-align: center;
    
    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.content-section {
  display: flex;
  gap: 32px;
  padding: 32px;
  
  .main-content {
    flex: 1;
    
    .readme-section {
      h2 {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }
      
      .readme-content {
        :deep(h1), :deep(h2), :deep(h3) {
          color: #303133;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        
        :deep(p) {
          line-height: 1.6;
          margin-bottom: 12px;
        }
        
        :deep(pre) {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
        }
        
        :deep(code) {
          background: #f8f9fa;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 14px;
        }
      }
    }
  }
  
  .sidebar {
    width: 300px;
    
    .files-section, .info-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      
      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .file-list {
      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e4e7ed;
        
        &:last-child {
          border-bottom: none;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .file-icon {
            color: #909399;
          }
          
          .file-name {
            font-size: 14px;
            color: #303133;
          }
        }
        
        .file-size {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e4e7ed;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 14px;
          color: #909399;
        }
        
        .info-value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }
}
</style>