import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../api/models'

export const useModelsStore = defineStore('models', () => {
  const models = ref([])
  const currentModel = ref(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const selectedTags = ref([])
  const sortBy = ref('updated_at')

  // 计算属性
  const filteredModels = computed(() => {
    let filtered = models.value

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.author.toLowerCase().includes(query)
      )
    }

    // 标签过滤
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(model =>
        selectedTags.value.some(tag => model.tags.includes(tag))
      )
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'downloads':
          return b.downloads - a.downloads
        case 'likes':
          return b.likes - a.likes
        case 'updated_at':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at)
      }
    })

    return filtered
  })

  const allTags = computed(() => {
    const tags = new Set()
    models.value.forEach(model => {
      model.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  })

  // 操作方法
  const fetchModels = async () => {
    loading.value = true
    try {
      // 使用模拟数据，实际应该调用 api.getModels()
      const response = await api.getMockModels()
      models.value = response.data
    } catch (error) {
      console.error('获取模型列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchModel = async (id) => {
    loading.value = true
    try {
      // 使用模拟数据，从已有模型中查找
      const response = await api.getMockModels()
      const model = response.data.find(m => m.id === id)
      if (model) {
        currentModel.value = model
        return model
      } else {
        throw new Error('模型不存在')
      }
    } catch (error) {
      console.error('获取模型详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createModel = async (modelData) => {
    loading.value = true
    try {
      const response = await api.createModel(modelData)
      models.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建模型失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateModel = async (id, modelData) => {
    loading.value = true
    try {
      const response = await api.updateModel(id, modelData)
      const index = models.value.findIndex(m => m.id === id)
      if (index !== -1) {
        models.value[index] = response.data
      }
      if (currentModel.value && currentModel.value.id === id) {
        currentModel.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新模型失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteModel = async (id) => {
    loading.value = true
    try {
      await api.deleteModel(id)
      models.value = models.value.filter(m => m.id !== id)
    } catch (error) {
      console.error('删除模型失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const likeModel = async (id) => {
    try {
      const response = await api.likeModel(id)
      const index = models.value.findIndex(m => m.id === id)
      if (index !== -1) {
        models.value[index].likes = response.data.likes
        models.value[index].liked = response.data.liked
      }
      if (currentModel.value && currentModel.value.id === id) {
        currentModel.value.likes = response.data.likes
        currentModel.value.liked = response.data.liked
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  return {
    models,
    currentModel,
    loading,
    searchQuery,
    selectedTags,
    sortBy,
    filteredModels,
    allTags,
    fetchModels,
    fetchModel,
    createModel,
    updateModel,
    deleteModel,
    likeModel
  }
})