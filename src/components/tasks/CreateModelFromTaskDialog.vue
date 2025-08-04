<template>
  <el-dialog
    v-model="visible"
    title="从任务创建模型"
    width="700px"
    :before-close="handleClose"
  >
    <div v-if="task" class="dialog-content">
      <!-- 任务信息概览 -->
      <div class="task-overview">
        <h3>任务信息</h3>
        <div class="overview-grid">
          <div class="overview-item">
            <span class="label">任务名称:</span>
            <span class="value">{{ task.name }}</span>
          </div>
          <div class="overview-item">
            <span class="label">数据集:</span>
            <span class="value">{{ task.dataset || '未指定' }}</span>
          </div>
          <div class="overview-item">
            <span class="label">框架:</span>
            <span class="value">{{ task.framework || '未指定' }}</span>
          </div>
          <div class="overview-item">
            <span class="label">完成时间:</span>
            <span class="value">{{ formatDate(task.completed_at) }}</span>
          </div>
        </div>

        <!-- 性能指标 -->
        <div v-if="task.metrics" class="metrics-display">
          <h4>性能指标</h4>
          <div class="metrics-list">
            <div 
              v-for="(value, key) in task.metrics" 
              :key="key"
              class="metric-badge"
            >
              <span class="metric-name">{{ formatMetricName(key) }}</span>
              <span class="metric-value">{{ formatMetricValue(value) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 智能建议 -->
      <div class="ai-suggestions">
        <h3>
          <el-icon><MagicStick /></el-icon>
          智能建议
        </h3>
        <el-alert
          title="系统已为您生成以下建议，您可以直接使用或进行修改"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 模型信息表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="large"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="输入模型名称"
            maxlength="100"
            show-word-limit
          >
            <template #append>
              <el-button @click="applySuggestion('name')">
                <el-icon><Refresh /></el-icon>
                重新生成
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="模型描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="描述您的模型功能和特点"
            maxlength="500"
            show-word-limit
          >
          </el-input>
          <div class="suggestion-actions">
            <el-button size="small" @click="applySuggestion('description')">
              <el-icon><Refresh /></el-icon>
              使用建议描述
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="suggestion-actions">
            <el-button size="small" @click="applySuggestion('tags')">
              <el-icon><Refresh /></el-icon>
              使用建议标签
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="模型类型" prop="model_type">
          <el-select v-model="form.model_type" placeholder="选择模型类型">
            <el-option label="文本分类" value="text-classification" />
            <el-option label="文本生成" value="text-generation" />
            <el-option label="图像分类" value="image-classification" />
            <el-option label="目标检测" value="object-detection" />
            <el-option label="语音识别" value="speech-recognition" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="框架" prop="framework">
          <el-select v-model="form.framework" placeholder="选择框架">
            <el-option label="PyTorch" value="pytorch" />
            <el-option label="TensorFlow" value="tensorflow" />
            <el-option label="Hugging Face" value="transformers" />
            <el-option label="ONNX" value="onnx" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="许可证" prop="license">
          <el-select v-model="form.license" placeholder="选择许可证">
            <el-option label="Apache 2.0" value="Apache-2.0" />
            <el-option label="MIT" value="MIT" />
            <el-option label="BSD 3-Clause" value="BSD-3-Clause" />
            <el-option label="GPL v3" value="GPL-3.0" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleConfirm">
          {{ creating ? '创建中...' : '创建模型' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Refresh } from '@element-plus/icons-vue'
import { useTasksStore } from '../../stores/tasks'

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

const emit = defineEmits(['update:modelValue', 'confirm'])

const tasksStore = useTasksStore()
const formRef = ref()
const creating = ref(false)
const suggestions = ref({})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  name: '',
  description: '',
  tags: [],
  model_type: '',
  framework: '',
  license: 'MIT'
})

const allTags = ref([
  'NLP', 'CV', 'Speech', 'PyTorch', 'TensorFlow', 'Transformer',
  'BERT', 'GPT', 'ResNet', 'CNN', 'RNN', 'LSTM', 'GAN',
  '中文', '英文', '多语言', '分类', '检测', '生成', '预训练'
])

const rules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入模型描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  model_type: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  framework: [
    { required: true, message: '请选择框架', trigger: 'change' }
  ],
  license: [
    { required: true, message: '请选择许可证', trigger: 'change' }
  ]
}

// 监听任务变化，生成建议
watch(() => props.task, (newTask) => {
  if (newTask) {
    generateSuggestions(newTask)
  }
}, { immediate: true })

const generateSuggestions = (task) => {
  suggestions.value = tasksStore.analyzeTaskForModel(task)
  
  // 应用建议到表单
  form.name = suggestions.value.name
  form.description = suggestions.value.description
  form.tags = [...suggestions.value.tags]
  form.model_type = suggestions.value.model_type
  form.framework = suggestions.value.framework
}

const applySuggestion = (field) => {
  if (suggestions.value[field]) {
    if (field === 'tags') {
      form[field] = [...suggestions.value[field]]
    } else {
      form[field] = suggestions.value[field]
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
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

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    creating.value = true
    
    const modelData = {
      ...form,
      task_id: props.task.id,
      model_path: props.task.model_path,
      config_path: props.task.config_path,
      metrics: props.task.metrics
    }
    
    emit('confirm', modelData)
    
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    creating.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.task-overview {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    
    .overview-item {
      display: flex;
      justify-content: space-between;
      
      .label {
        font-size: 14px;
        color: #909399;
      }
      
      .value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
  
  .metrics-display {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #303133;
    }
    
    .metrics-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .metric-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
        border-radius: 12px;
        font-size: 12px;
        
        .metric-name {
          color: #409eff;
        }
        
        .metric-value {
          color: #303133;
          font-weight: 600;
        }
      }
    }
  }
}

.ai-suggestions {
  margin-bottom: 24px;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #303133;
    
    .el-icon {
      color: #409eff;
    }
  }
}

.suggestion-actions {
  margin-top: 8px;
}

.dialog-footer {
  text-align: right;
}
</style>