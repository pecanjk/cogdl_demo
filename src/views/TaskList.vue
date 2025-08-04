<template>
  <div class="task-list">
    <div class="page-header">
      <h1>任务列表</h1>
      <p>从已完成的训练任务中创建模型库</p>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-select
        v-model="statusFilter"
        placeholder="任务状态"
        style="width: 150px"
        clearable
      >
        <el-option label="全部" value="" />
        <el-option label="运行中" value="running" />
        <el-option label="已完成" value="completed" />
        <el-option label="失败" value="failed" />
      </el-select>

      <el-input
        v-model="searchQuery"
        placeholder="搜索任务名称..."
        style="width: 300px"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container" v-loading="loading">
      <div class="task-grid">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @create-model="handleCreateModel"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredTasks.length === 0"
        description="暂无任务数据"
      />
    </div>

    <!-- 创建模型对话框 -->
    <CreateModelFromTaskDialog
      v-model="createModelVisible"
      :task="selectedTask"
      @confirm="handleConfirmCreate"
    />

    <!-- 任务详情对话框 -->
    <TaskDetailDialog
      v-model="detailVisible"
      :task="selectedTask"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import TaskCard from '../components/tasks/TaskCard.vue'
import CreateModelFromTaskDialog from '../components/tasks/CreateModelFromTaskDialog.vue'
import TaskDetailDialog from '../components/tasks/TaskDetailDialog.vue'
import { useTasksStore } from '../stores/tasks'

const tasksStore = useTasksStore()
const { tasks, loading, fetchTasks } = tasksStore

const statusFilter = ref('')
const searchQuery = ref('')
const createModelVisible = ref(false)
const detailVisible = ref(false)
const selectedTask = ref(null)

const filteredTasks = computed(() => {
  let filtered = tasks.value

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(query)
    )
  }

  return filtered
})

onMounted(async () => {
  try {
    await fetchTasks()
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  }
})

const handleCreateModel = (task) => {
  selectedTask.value = task
  createModelVisible.value = true
}

const handleViewDetails = (task) => {
  selectedTask.value = task
  detailVisible.value = true
}

const handleConfirmCreate = async (modelData) => {
  try {
    await tasksStore.createModelFromTask(selectedTask.value.id, modelData)
    ElMessage.success('模型创建成功')
    createModelVisible.value = false
  } catch (error) {
    ElMessage.error('模型创建失败')
  }
}
</script>

<style lang="scss" scoped>
.task-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
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

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.tasks-container {
  min-height: 400px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}
</style>