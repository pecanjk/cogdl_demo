<template>
  <div class="model-card" @click="$emit('click', model)">
    <div class="card-header">
      <div class="author-info">
        <el-avatar :size="24" :src="model.avatar" />
        <span class="author-name">{{ model.author }}</span>
      </div>
      <div class="card-actions">
        <el-button
          :type="model.liked ? 'primary' : 'default'"
          size="small"
          circle
          @click.stop="$emit('like', model.id)"
        >
          <el-icon>
            <Star v-if="model.liked" />
            <StarFilled v-else />
          </el-icon>
        </el-button>
      </div>
    </div>

    <div class="model-info">
      <h3 class="model-name">{{ model.name }}</h3>
      <p class="model-description">{{ model.description }}</p>
      
      <div class="model-tags">
        <el-tag
          v-for="tag in model.tags.slice(0, 4)"
          :key="tag"
          size="small"
          type="info"
        >
          {{ tag }}
        </el-tag>
        <span v-if="model.tags.length > 4" class="more-tags">
          +{{ model.tags.length - 4 }}
        </span>
      </div>
    </div>

    <div class="model-stats">
      <div class="stat-item">
        <el-icon><Download /></el-icon>
        <span>{{ formatNumber(model.downloads) }}</span>
      </div>
      <div class="stat-item">
        <el-icon><Star /></el-icon>
        <span>{{ formatNumber(model.likes) }}</span>
      </div>
      <div class="stat-item">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDate(model.updated_at) }}</span>
      </div>
    </div>

    <div class="model-meta">
      <div class="meta-item">
        <span class="meta-label">框架:</span>
        <span class="meta-value">{{ model.framework }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">大小:</span>
        <span class="meta-value">{{ model.size }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">许可:</span>
        <span class="meta-value">{{ model.license }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, StarFilled, Download, Clock } from '@element-plus/icons-vue'

defineProps({
  model: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'like'])

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '1天前'
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}个月前`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}年前`
  }
}
</script>

<style lang="scss" scoped>
.model-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .author-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .author-name {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.model-info {
  margin-bottom: 16px;
  
  .model-name {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }
  
  .model-description {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .model-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    
    .more-tags {
      font-size: 12px;
      color: #909399;
    }
  }
}

.model-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

.model-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .meta-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    
    .meta-label {
      color: #909399;
    }
    
    .meta-value {
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>