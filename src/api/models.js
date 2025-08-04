import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 模型相关API
export const getModels = (params = {}) => {
  return api.get('/models', { params })
}

export const getModel = (id) => {
  return api.get(`/models/${id}`)
}

export const createModel = (data) => {
  return api.post('/models', data)
}

export const updateModel = (id, data) => {
  return api.put(`/models/${id}`, data)
}

export const deleteModel = (id) => {
  return api.delete(`/models/${id}`)
}

export const likeModel = (id) => {
  return api.post(`/models/${id}/like`)
}

export const downloadModel = (id) => {
  return api.get(`/models/${id}/download`, { responseType: 'blob' })
}

// 文件上传
export const uploadModelFile = (formData, onProgress) => {
  return api.post('/models/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  })
}

// 任务相关API
export const getTasks = () => {
  return api.get('/tasks')
}

export const getTask = (id) => {
  return api.get(`/tasks/${id}`)
}

export const createModelFromTask = (taskId, modelData) => {
  return api.post(`/tasks/${taskId}/create-model`, modelData)
}

// 模拟数据 - 用于开发测试
export const getMockModels = () => {
  return Promise.resolve({
    data: [
      {
        id: '1',
        name: 'BERT-Base-Chinese',
        description: '基于中文语料训练的BERT模型，适用于中文文本分类、命名实体识别等任务',
        author: 'huggingface',
        avatar: 'https://avatars.githubusercontent.com/u/25720743?s=200&v=4',
        tags: ['NLP', 'BERT', '中文', 'Transformer'],
        downloads: 15420,
        likes: 892,
        liked: false,
        created_at: '2023-10-01T10:00:00Z',
        updated_at: '2023-12-15T14:30:00Z',
        model_type: 'text-classification',
        framework: 'pytorch',
        license: 'Apache-2.0',
        size: '412 MB',
        files: [
          { name: 'config.json', size: '1.2 KB' },
          { name: 'pytorch_model.bin', size: '412 MB' },
          { name: 'tokenizer.json', size: '2.1 MB' },
          { name: 'vocab.txt', size: '108 KB' }
        ],
        readme: `# BERT-Base-Chinese

这是一个基于中文语料训练的BERT模型。

## 模型描述

该模型在大规模中文文本数据上进行预训练，可以用于各种中文NLP任务。

## 使用方法

\`\`\`python
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained('bert-base-chinese')
model = BertModel.from_pretrained('bert-base-chinese')
\`\`\`

## 性能指标

- 准确率: 92.3%
- F1分数: 91.8%
`
      },
      {
        id: '2',
        name: 'GPT-2-Chinese-Small',
        description: '中文GPT-2小型模型，用于中文文本生成任务',
        author: 'THUDM',
        avatar: 'https://avatars.githubusercontent.com/u/48426991?s=200&v=4',
        tags: ['NLP', 'GPT', '中文', '文本生成'],
        downloads: 8934,
        likes: 567,
        liked: true,
        created_at: '2023-09-15T09:00:00Z',
        updated_at: '2023-12-10T11:20:00Z',
        model_type: 'text-generation',
        framework: 'pytorch',
        license: 'MIT',
        size: '248 MB',
        files: [
          { name: 'config.json', size: '0.8 KB' },
          { name: 'pytorch_model.bin', size: '248 MB' },
          { name: 'tokenizer.json', size: '1.8 MB' },
          { name: 'vocab.json', size: '456 KB' }
        ],
        readme: `# GPT-2-Chinese-Small

中文GPT-2小型模型，专为中文文本生成优化。

## 特性

- 参数量: 117M
- 训练语料: 中文维基百科、新闻等
- 支持多种生成任务

## 快速开始

\`\`\`python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

model = GPT2LMHeadModel.from_pretrained('gpt2-chinese-small')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2-chinese-small')
\`\`\`
`
      },
      {
        id: '3',
        name: 'ResNet-50-ImageNet',
        description: 'ResNet-50模型，在ImageNet数据集上预训练，用于图像分类',
        author: 'torchvision',
        avatar: 'https://pytorch.org/assets/images/pytorch-logo.png',
        tags: ['CV', 'ResNet', '图像分类', 'ImageNet'],
        downloads: 23567,
        likes: 1234,
        liked: false,
        created_at: '2023-08-20T15:30:00Z',
        updated_at: '2023-12-08T16:45:00Z',
        model_type: 'image-classification',
        framework: 'pytorch',
        license: 'BSD-3-Clause',
        size: '98 MB',
        files: [
          { name: 'model.pth', size: '98 MB' },
          { name: 'config.json', size: '0.5 KB' }
        ],
        readme: `# ResNet-50 ImageNet

ResNet-50架构的深度残差网络，在ImageNet-1k数据集上预训练。

## 模型性能

- Top-1准确率: 76.13%
- Top-5准确率: 92.86%
- 参数量: 25.6M

## 使用示例

\`\`\`python
import torch
import torchvision.models as models

model = models.resnet50(pretrained=True)
model.eval()
\`\`\`
`
      }
    ]
  })
}

export const getMockTasks = () => {
  return Promise.resolve({
    data: [
      {
        id: '1',
        name: '中文情感分析模型训练',
        status: 'completed',
        created_at: '2023-12-01T10:00:00Z',
        completed_at: '2023-12-03T14:30:00Z',
        model_path: '/data/tasks/1/model.pth',
        config_path: '/data/tasks/1/config.json',
        metrics: {
          accuracy: 0.923,
          f1_score: 0.918,
          precision: 0.925,
          recall: 0.912
        },
        dataset: '中文评论数据集',
        framework: 'pytorch'
      },
      {
        id: '2',
        name: '图像分类模型训练',
        status: 'completed',
        created_at: '2023-12-05T09:00:00Z',
        completed_at: '2023-12-07T16:20:00Z',
        model_path: '/data/tasks/2/best_model.pth',
        config_path: '/data/tasks/2/config.yaml',
        metrics: {
          accuracy: 0.891,
          top5_accuracy: 0.967
        },
        dataset: 'CIFAR-100',
        framework: 'pytorch'
      },
      {
        id: '3',
        name: '文本生成模型微调',
        status: 'running',
        created_at: '2023-12-10T11:00:00Z',
        progress: 0.65,
        dataset: '中文小说数据集',
        framework: 'pytorch'
      }
    ]
  })
}