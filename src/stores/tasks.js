import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/models'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)

  const fetchTasks = async () => {
    loading.value = true
    try {
      // 使用模拟数据，实际应该调用 api.getTasks()
      const response = await api.getMockTasks()
      tasks.value = response.data
    } catch (error) {
      console.error('获取任务列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getTask = async (id) => {
    try {
      const response = await api.getTask(id)
      return response.data
    } catch (error) {
      console.error('获取任务详情失败:', error)
      throw error
    }
  }

  const createModelFromTask = async (taskId, modelData) => {
    try {
      const response = await api.createModelFromTask(taskId, modelData)
      return response.data
    } catch (error) {
      console.error('从任务创建模型失败:', error)
      throw error
    }
  }

  // 自动识别可以创建模型的任务
  const getCompletedTasksWithModels = () => {
    return tasks.value.filter(task => 
      task.status === 'completed' && 
      task.model_path && 
      task.config_path
    )
  }

  // 分析任务结果，提取模型信息
  const analyzeTaskForModel = (task) => {
    const suggestions = {
      name: generateModelName(task),
      description: generateModelDescription(task),
      tags: generateModelTags(task),
      model_type: inferModelType(task),
      framework: task.framework || 'pytorch',
      metrics: task.metrics || {}
    }
    
    return suggestions
  }

  // 生成模型名称建议
  const generateModelName = (task) => {
    const baseName = task.name.replace(/训练|模型|任务/g, '').trim()
    const timestamp = new Date(task.completed_at).toISOString().slice(0, 10)
    return `${baseName}-${timestamp}`
  }

  // 生成模型描述建议
  const generateModelDescription = (task) => {
    const descriptions = {
      'text-classification': '文本分类模型',
      'image-classification': '图像分类模型',
      'object-detection': '目标检测模型',
      'text-generation': '文本生成模型',
      'speech-recognition': '语音识别模型'
    }
    
    const modelType = inferModelType(task)
    const baseDesc = descriptions[modelType] || '机器学习模型'
    
    if (task.dataset) {
      return `基于${task.dataset}数据集训练的${baseDesc}`
    }
    
    return `训练完成的${baseDesc}`
  }

  // 生成标签建议
  const generateModelTags = (task) => {
    const tags = []
    
    // 基于任务名称推断标签
    const taskName = task.name.toLowerCase()
    if (taskName.includes('中文') || taskName.includes('chinese')) {
      tags.push('中文')
    }
    if (taskName.includes('英文') || taskName.includes('english')) {
      tags.push('英文')
    }
    if (taskName.includes('情感') || taskName.includes('sentiment')) {
      tags.push('情感分析')
    }
    if (taskName.includes('分类') || taskName.includes('classification')) {
      tags.push('分类')
    }
    if (taskName.includes('检测') || taskName.includes('detection')) {
      tags.push('检测')
    }
    if (taskName.includes('生成') || taskName.includes('generation')) {
      tags.push('生成')
    }

    // 基于框架添加标签
    if (task.framework) {
      tags.push(task.framework.charAt(0).toUpperCase() + task.framework.slice(1))
    }

    // 基于数据集添加标签
    if (task.dataset) {
      if (task.dataset.includes('CIFAR')) tags.push('CIFAR')
      if (task.dataset.includes('ImageNet')) tags.push('ImageNet')
      if (task.dataset.includes('BERT')) tags.push('BERT')
    }

    return [...new Set(tags)] // 去重
  }

  // 推断模型类型
  const inferModelType = (task) => {
    const taskName = task.name.toLowerCase()
    
    if (taskName.includes('分类') || taskName.includes('classification')) {
      if (taskName.includes('图像') || taskName.includes('image') || taskName.includes('视觉')) {
        return 'image-classification'
      }
      return 'text-classification'
    }
    
    if (taskName.includes('检测') || taskName.includes('detection')) {
      return 'object-detection'
    }
    
    if (taskName.includes('生成') || taskName.includes('generation')) {
      return 'text-generation'
    }
    
    if (taskName.includes('语音') || taskName.includes('speech')) {
      return 'speech-recognition'
    }

    // 基于数据集推断
    if (task.dataset) {
      const dataset = task.dataset.toLowerCase()
      if (dataset.includes('cifar') || dataset.includes('imagenet')) {
        return 'image-classification'
      }
      if (dataset.includes('coco') || dataset.includes('yolo')) {
        return 'object-detection'
      }
    }
    
    return 'other'
  }

  return {
    tasks,
    loading,
    fetchTasks,
    getTask,
    createModelFromTask,
    getCompletedTasksWithModels,
    analyzeTaskForModel
  }
})