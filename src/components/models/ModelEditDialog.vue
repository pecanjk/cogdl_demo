<template>
  <el-dialog
    v-model="visible"
    title="编辑模型"
    width="800px"
    :before-close="handleClose"
  >
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
        />
      </el-form-item>

      <el-form-item label="模型描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="描述您的模型功能和特点"
          maxlength="500"
          show-word-limit
        />
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
            v-for="tag in predefinedTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
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

      <el-form-item label="README" prop="readme">
        <div class="readme-editor">
          <el-tabs v-model="readmeTab" class="editor-tabs">
            <el-tab-pane label="编辑" name="edit">
              <el-input
                v-model="form.readme"
                type="textarea"
                :rows="15"
                placeholder="使用Markdown格式编写模型说明文档..."
                class="readme-textarea"
              />
            </el-tab-pane>
            <el-tab-pane label="预览" name="preview">
              <div class="markdown-preview" v-html="renderMarkdown(form.readme)"></div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  model: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref()
const saving = ref(false)
const readmeTab = ref('edit')

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
  license: '',
  readme: ''
})

const predefinedTags = [
  'NLP', 'CV', 'Speech', 'PyTorch', 'TensorFlow', 'Transformer',
  'BERT', 'GPT', 'ResNet', 'CNN', 'RNN', 'LSTM', 'GAN',
  '中文', '英文', '多语言', '分类', '检测', '生成', '预训练'
]

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

// 监听模型数据变化，更新表单
watch(() => props.model, (newModel) => {
  if (newModel) {
    Object.keys(form).forEach(key => {
      if (key in newModel) {
        form[key] = newModel[key]
      }
    })
  }
}, { immediate: true, deep: true })

const renderMarkdown = (content) => {
  return marked(content || '')
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 提交数据
    emit('save', { ...form })
    
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.readme-editor {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  
  .editor-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      background: #f8f9fa;
      border-bottom: 1px solid #e4e7ed;
    }
    
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
  
  .readme-textarea {
    :deep(.el-textarea__inner) {
      border: none;
      border-radius: 0;
      resize: vertical;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
    }
  }
  
  .markdown-preview {
    padding: 20px;
    min-height: 300px;
    background: #fff;
    max-height: 400px;
    overflow-y: auto;
    
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

.dialog-footer {
  text-align: right;
}
</style>