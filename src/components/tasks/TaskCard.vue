<template>
  <div class="task-card" :class="{ 'completed': task.status === 'completed' }">
    <div class="card-header">
      <div class="task-info">
        <h3 class="task-name">{{ task.name }}</h3>
        <el-tag 
          :type="getStatusType(task.status)" 
          size="small"
        >
          {{ getStatusText(task.status) }}
        </el-tag>
      </div>
      
      <div class="task-actions">
        <el-button
          size="small"
          @click="$emit('view-details', task)"
        >
          <el-icon><View /></el-icon>
          详情
        </el-button>
        
        <el-button
          v-if="task.status === 'completed' && canCreateModel"
          type="primary"
          size="small"
          @click="$emit('create-model', task)"
        >
          <el-icon><Plus /></el-icon>
          创建模型
        </el-button>
      </div>
    </div>

    <div class="card-content">
      <!-- 基本信息 -->
      <div class="task-meta">
        <div class="meta-item">
          <span class="meta-label">数据集:</span>
          <span class="meta-value">{{ task.dataset || '未指定' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">框架:</span>
          <span class="meta-value">{{ task.framework || '未指定' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">创建时间:</span>
          <span class="meta-value">{{ formatDate(task.created_at) }}</span>
        </div>
        <div v-if="task.completed_at" class="meta-item">
          <span class="meta-label">完成时间:</span>
          <span class="meta-value">{{ formatDate(task.completed_at) }}</span>
        </div>
      </div>

      <!-- 进度条（运行中的任务） -->
      <div v-if="task.status === 'running' && task.progress" class="progress-section">
        <el-progress 
          :percentage="Math.round(task.progress * 100)" 
          :stroke-width="6"
          :show-text="true"
        />
      </div>

      <!-- 性能指标（已完成的任务） -->
      <div v-if="task.status === 'completed' && task.metrics" class="metrics-section">
        <h4>性能指标</h4>
        <div class="metrics-grid">
          <div 
            v-for="(value, key) in task.metrics" 
            :key="key"
            class="metric-item"
          >
            <span class="metric-label">{{ formatMetricName(key) }}:</span>
            <span class="metric-value">{{ formatMetricValue(value) }}</span>
          </div>
        </div>
      </div>

      <!-- 模型文件信息 -->
      <div v-if="task.model_path" class="files-section">
        <h4>模型文件</h4>
        <div class="file-list">
          <div class="file-item">
            <el-icon><Document /></el-icon>
            <span>{{ getFileName(task.model_path) }}</span>
          </div>
          <div v-if="task.config_path" class="file-item">
            <el-icon><Document /></el-icon>
            <span>{{ getFileName(task.config_path) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能建议 -->
    <div v-if="task.status === 'completed' && canCreateModel" class="suggestions">
      <el-icon class="suggest-icon"><Lightbulb /></el-icon>
      <span class="suggest-text">
        系统检测到此任务可以创建模型，点击"创建模型"开始
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View, Plus, Document, Lightbulb } from '@element-plus/icons-vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['create-model', 'view-details'])

const canCreateModel = computed(() => {
  return props.task.status === 'completed' && 
         props.task.model_path && 
         props.task.config_path
})

const getStatusType = (status) => {
  const types = {
    'running': 'warning',
    'completed': 'success',
    'failed': 'danger',
    'pending': 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'running': '运行中',
    'completed': '已完成',
    'failed': '失败',
    'pending': '等待中'
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMetricName = (key) => {
  const names = {
    'accuracy': '准确率',
    'f1_score': 'F1分数',
    'precision': '精确率',
    'recall': '召回率',
    'top5_accuracy': 'Top-5准确率',
    'loss': '损失'
  }
  return names[key] || key
}

const formatMetricValue = (value) => {
  if (typeof value === 'number') {
    if (value < 1 && value > 0) {
      return (value * 100).toFixed(1) + '%'
    }
    return value.toFixed(3)
  }
  return value
}

const getFileName = (path) => {
  return path.split('/').pop()
}
</script>

<style lang="scss" scoped>
.task-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #c0c4cc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.completed {
    border-left: 4px solid #67c23a;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  
  .task-info {
    flex: 1;
    
    .task-name {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      line-height: 1.4;
    }
  }
  
  .task-actions {
    display: flex;
    gap: 8px;
  }
}

.card-content {
  .task-meta {
    margin-bottom: 16px;
    
    .meta-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .meta-label {
        font-size: 14px;
        color: #909399;
      }
      
      .meta-value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
  
  .progress-section {
    margin-bottom: 16px;
  }
  
  .metrics-section, .files-section {
    margin-bottom: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    
    .metric-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      background: #f8f9fa;
      border-radius: 4px;
      
      .metric-label {
        font-size: 12px;
        color: #909399;
      }
      
      .metric-value {
        font-size: 12px;
        color: #303133;
        font-weight: 600;
      }
    }
  }
  
  .file-list {
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
      color: #606266;
      
      .el-icon {
        color: #909399;
      }
    }
  }
}

.suggestions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  margin-top: 16px;
  
  .suggest-icon {
    color: #409eff;
    font-size: 16px;
  }
  
  .suggest-text {
    font-size: 13px;
    color: #409eff;
    line-height: 1.4;
  }
}
</style>