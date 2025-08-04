<template>
  <div class="model-hub">
    <!-- 搜索和过滤器 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索模型名称、描述或作者..."
          size="large"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="filters">
        <el-select
          v-model="selectedTags"
          multiple
          placeholder="选择标签"
          style="width: 200px"
          clearable
        >
          <el-option
            v-for="tag in allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          style="width: 150px"
        >
          <el-option label="最近更新" value="updated_at" />
          <el-option label="名称" value="name" />
          <el-option label="下载量" value="downloads" />
          <el-option label="点赞数" value="likes" />
        </el-select>
      </div>
    </div>

    <!-- 模型列表 -->
    <div class="models-grid" v-loading="loading">
      <ModelCard
        v-for="model in filteredModels"
        :key="model.id"
        :model="model"
        @like="handleLike"
        @click="viewModel"
      />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && filteredModels.length === 0"
      description="暂无模型数据"
    >
      <el-button type="primary" @click="$router.push('/upload')">
        上传第一个模型
      </el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useModelsStore } from '../stores/models'
import ModelCard from '../components/models/ModelCard.vue'

const router = useRouter()
const modelsStore = useModelsStore()

const {
  loading,
  filteredModels,
  allTags,
  searchQuery,
  selectedTags,
  sortBy,
  fetchModels,
  likeModel
} = modelsStore

onMounted(async () => {
  try {
    await fetchModels()
  } catch (error) {
    ElMessage.error('获取模型列表失败')
  }
})

const handleLike = async (modelId) => {
  try {
    await likeModel(modelId)
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const viewModel = (model) => {
  router.push(`/models/${model.id}`)
}
</script>

<style lang="scss" scoped>
.model-hub {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 24px;
  
  .search-bar {
    margin-bottom: 16px;
  }
  
  .filters {
    display: flex;
    gap: 16px;
    align-items: center;
  }
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  min-height: 200px;
}
</style>