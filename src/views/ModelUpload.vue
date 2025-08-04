<template>
  <div class="model-upload">
    <div class="upload-container">
      <div class="upload-header">
        <h1>上传新模型</h1>
        <p>将您训练好的模型分享给社区</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="large"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>
          
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

          <el-form-item label="作者" prop="author">
            <el-input
              v-model="form.author"
              placeholder="作者名称"
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
        </div>

        <!-- 模型信息 -->
        <div class="form-section">
          <h3>模型信息</h3>
          
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
        </div>

        <!-- 文件上传 -->
        <div class="form-section">
          <h3>模型文件</h3>
          
          <el-form-item label="模型文件" prop="files">
            <el-upload
              ref="uploadRef"
              class="upload-area"
              drag
              multiple
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :before-upload="beforeUpload"
              accept=".pth,.pt,.bin,.onnx,.pb,.h5,.pkl,.json,.txt,.yaml,.yml,.md"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖拽到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持模型文件、配置文件、说明文档等，单个文件不超过500MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <div v-if="uploadFiles.length > 0" class="file-list">
            <h4>已选择的文件:</h4>
            <div class="file-item" v-for="file in uploadFiles" :key="file.uid">
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">({{ formatFileSize(file.size) }})</span>
              </div>
              <el-button
                type="danger"
                size="small"
                circle
                @click="removeFile(file)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- README编辑器 -->
        <div class="form-section">
          <h3>模型说明 (README)</h3>
          
          <el-form-item prop="readme">
            <div class="readme-editor">
              <el-tabs v-model="readmeTab" class="editor-tabs">
                <el-tab-pane label="编辑" name="edit">
                  <el-input
                    v-model="form.readme"
                    type="textarea"
                    :rows="20"
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
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="uploading"
            @click="submitForm"
          >
            {{ uploading ? '上传中...' : '上传模型' }}
          </el-button>
        </div>
      </el-form>

      <!-- 上传进度 -->
      <el-dialog
        v-model="progressVisible"
        title="上传进度"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <div class="upload-progress">
          <el-progress
            :percentage="uploadProgress"
            :status="uploadStatus"
            stroke-width="8"
          />
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document, Delete } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useModelsStore } from '../stores/models'
import * as api from '../api/models'

const router = useRouter()
const modelsStore = useModelsStore()

const formRef = ref()
const uploadRef = ref()
const uploading = ref(false)
const progressVisible = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const progressText = ref('')
const readmeTab = ref('edit')

const uploadFiles = ref([])

const form = reactive({
  name: '',
  description: '',
  author: '',
  tags: [],
  model_type: '',
  framework: '',
  license: '',
  readme: `# 模型名称

## 模型描述

这里描述您的模型...

## 使用方法

\`\`\`python
# 示例代码
import torch
model = torch.load('model.pth')
\`\`\`

## 性能指标

- 准确率: XX%
- F1分数: XX%

## 训练数据

描述训练数据集...

## 引用

如果使用了此模型，请引用...
`,
  files: []
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
  author: [
    { required: true, message: '请输入作者名称', trigger: 'blur' }
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

const renderMarkdown = (content) => {
  return marked(content || '')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileChange = (file, fileList) => {
  uploadFiles.value = fileList
}

const handleFileRemove = (file, fileList) => {
  uploadFiles.value = fileList
}

const removeFile = (file) => {
  uploadRef.value.handleRemove(file)
}

const beforeUpload = (file) => {
  const maxSize = 500 * 1024 * 1024 // 500MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 500MB')
    return false
  }
  return true
}

const resetForm = () => {
  formRef.value.resetFields()
  uploadFiles.value = []
  uploadRef.value.clearFiles()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    if (uploadFiles.value.length === 0) {
      ElMessage.warning('请至少上传一个模型文件')
      return
    }

    uploading.value = true
    progressVisible.value = true
    uploadProgress.value = 0
    uploadStatus.value = ''
    progressText.value = '准备上传...'

    // 创建FormData
    const formData = new FormData()
    
    // 添加基本信息
    Object.keys(form).forEach(key => {
      if (key !== 'files') {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(form[key]))
        } else {
          formData.append(key, form[key])
        }
      }
    })

    // 添加文件
    uploadFiles.value.forEach(file => {
      formData.append('files', file.raw)
    })

    // 上传
    const response = await api.uploadModelFile(formData, (progressEvent) => {
      uploadProgress.value = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      progressText.value = `上传中... ${uploadProgress.value}%`
    })

    uploadStatus.value = 'success'
    progressText.value = '上传成功！'

    setTimeout(() => {
      progressVisible.value = false
      ElMessage.success('模型上传成功')
      router.push(`/models/${response.data.id}`)
    }, 1500)

  } catch (error) {
    uploadStatus.value = 'exception'
    progressText.value = '上传失败'
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
    
    setTimeout(() => {
      progressVisible.value = false
    }, 2000)
  } finally {
    uploading.value = false
  }
}
</script>

<style lang="scss" scoped>
.model-upload {
  max-width: 800px;
  margin: 0 auto;
}

.upload-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
}

.upload-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    color: #606266;
  }
}

.form-section {
  margin-bottom: 32px;
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
  }
}

.upload-area {
  width: 100%;
  
  :deep(.el-upload-dragger) {
    width: 100%;
    height: 180px;
  }
}

.file-list {
  margin-top: 16px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #606266;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 8px;
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .file-name {
        font-size: 14px;
        color: #303133;
      }
      
      .file-size {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

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
    min-height: 400px;
    background: #fff;
    
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

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #f0f0f0;
}

.upload-progress {
  text-align: center;
  
  .progress-text {
    margin-top: 16px;
    font-size: 14px;
    color: #606266;
  }
}
</style>