<template>
  <el-dialog
    v-model="visible"
    title="任务详情"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="task" class="task-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">任务名称:</span>
            <span class="value">{{ task.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态:</span>
            <el-tag :type="getStatusType(task.status)">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">数据集:</span>
            <span class="value">{{ task.dataset || '未指定' }}</span>
          </div>
          <div class="info-item">
            <span class="label">框架:</span>
            <span class="value">{{ task.framework || '未指定' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(task.created_at) }}</span>
          </div>
          <div v-if="task.completed_at" class="info-item">
            <span class="label">完成时间:</span>
            <span class="value">{{ formatDate(task.completed_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 进度信息 -->
      <div v-if="task.status === 'running'" class="detail-section">
        <h3>训练进度</h3>
        <el-progress 
          :percentage="Math.round((task.progress || 0) * 100)" 
          :stroke-width="8"
          :show-text="true"
        />
        <p class="progress-text">
          当前进度: {{ Math.round((task.progress || 0) * 100) }}%
        </p>
      </div>

      <!-- 性能指标 -->
      <div v-if="task.metrics" class="detail-section">
        <h3>性能指标</h3>
        <div class="metrics-display">
          <div 
            v-for="(value, key) in task.metrics" 
            :key="key"
            class="metric-card"
          >
            <div class="metric-name">{{ formatMetricName(key) }}</div>
            <div class="metric-value">{{ formatMetricValue(value) }}</div>
          </div>
        </div>
      </div>

      <!-- 文件信息 -->
      <div v-if="task.model_path || task.config_path" class="detail-section">
        <h3>输出文件</h3>
        <div class="file-list">
          <div v-if="task.model_path" class="file-item">
            <el-icon><Document /></el-icon>
            <div class="file-info">
              <div class="file-name">模型文件</div>
              <div class="file-path">{{ task.model_path }}</div>
            </div>
          </div>
          <div v-if="task.config_path" class="file-item">
            <el-icon><Setting /></el-icon>
            <div class="file-info">
              <div class="file-name">配置文件</div>
              <div class="file-path">{{ task.config_path }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 运行日志 -->
      <div class="detail-section">
        <h3>运行日志</h3>
        <div class="log-container">
          <pre class="log-content">{{ generateMockLog(task) }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="task && task.status === 'completed' && canCreateModel"
          type="primary" 
          @click="handleCreateModel"
        >
          创建模型
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Document, Setting } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'create-model'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canCreateModel = computed(() => {
  return props.task?.status === 'completed' && 
         props.task?.model_path && 
         props.task?.config_path
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

const generateMockLog = (task) => {
  const logs = [
    `[${new Date(task.created_at).toISOString()}] 任务开始执行`,
    `[${new Date(task.created_at).toISOString()}] 加载数据集: ${task.dataset || '默认数据集'}`,
    `[${new Date(task.created_at).toISOString()}] 初始化模型架构`,
    `[${new Date(task.created_at).toISOString()}] 开始训练...`
  ]

  if (task.status === 'completed') {
    logs.push(`[${new Date(task.completed_at).toISOString()}] 训练完成`)
    logs.push(`[${new Date(task.completed_at).toISOString()}] 保存模型到: ${task.model_path}`)
    logs.push(`[${new Date(task.completed_at).toISOString()}] 保存配置到: ${task.config_path}`)
    if (task.metrics) {
      Object.entries(task.metrics).forEach(([key, value]) => {
        logs.push(`[${new Date(task.completed_at).toISOString()}] ${formatMetricName(key)}: ${formatMetricValue(value)}`)
      })
    }
  } else if (task.status === 'running') {
    logs.push(`[${new Date().toISOString()}] 当前进度: ${Math.round((task.progress || 0) * 100)}%`)
    logs.push(`[${new Date().toISOString()}] 正在训练中...`)
  }

  return logs.join('\n')
}

const handleClose = () => {
  visible.value = false
}

const handleCreateModel = () => {
  emit('create-model', props.task)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.task-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    
    .label {
      font-size: 14px;
      color: #909399;
      font-weight: 500;
    }
    
    .value {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
    }
  }
}

.progress-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.metrics-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  
  .metric-card {
    padding: 16px;
    background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
    border: 1px solid #b3d8ff;
    border-radius: 8px;
    text-align: center;
    
    .metric-name {
      font-size: 12px;
      color: #409eff;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.file-list {
  .file-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 8px;
    
    .el-icon {
      color: #409eff;
      font-size: 18px;
      margin-top: 2px;
    }
    
    .file-info {
      flex: 1;
      
      .file-name {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .file-path {
        font-size: 12px;
        color: #909399;
        font-family: 'Courier New', monospace;
        word-break: break-all;
      }
    }
  }
}

.log-container {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  
  .log-content {
    color: #d4d4d4;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
  }
}

.dialog-footer {
  text-align: right;
}
</style>