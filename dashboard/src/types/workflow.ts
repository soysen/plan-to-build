export type TaskStatus = 'idle' | '進行中' | '阻塞' | '暫停' | '需補充輸入' | '已完成';
export type TabFilter = 'active' | 'attention' | 'idle' | 'plans' | 'all';

export interface ActiveTaskInfo {
  id: string;
  title: string;
  status: TaskStatus;
  lastUpdated: string;
  goal: string;
  route: string;
  taskLevel?: string;
  currentStep?: string;
  evidence?: string;
  nextStep?: string;
  resumeEntry?: string;
  inOutScope?: string;
  acceptanceCriteria?: string;
  updatedFiles?: string[];
}

export interface CompletedTaskInfo {
  id: string;
  title: string;
  status: string;
  lastUpdated: string;
  goal: string;
  route: string;
  taskLevel?: string;
  evidence?: string;
  updatedFiles?: string[];
}

export interface BuildPlanSlice {
  sliceId: string;
  title: string;
  status: string;
  route?: string;
  goal?: string;
  boundary?: string;
  verification?: string;
  description?: string;
}

export interface TaskCardInfo {
  goal?: string;
  route?: string;
  inOutScope?: string;
  acceptanceCriteria?: string;
  evidence?: string;
  updatedFiles?: string[];
  resumeEntry?: string;
}

export interface BuildPlanTaskDetail {
  id: string;
  title: string;
  status: string;
  type?: string;
  priority?: string;
  estimate?: string;
  milestone?: string;
  route?: string;
  description?: string;
  acceptanceCriteria?: string[];
  slices?: BuildPlanSlice[];
}

export interface ActiveBuildPlan {
  title: string;
  filePath: string;
  featureName?: string;
  currentTaskId?: string;
  currentSliceGoal?: string;
  taskCard?: TaskCardInfo;
  slices: BuildPlanSlice[];
  tasks?: BuildPlanTaskDetail[];
}

export interface ProjectWorkflow {
  projectName: string;
  projectPath: string;
  statusFilePath: string;
  activeTask: ActiveTaskInfo;
  lastCompletedTask?: CompletedTaskInfo;
  buildPlanCount: number;
  activeBuildPlan?: ActiveBuildPlan;
}

export interface GlobalMetrics {
  totalProjects: number;
  activeTasksCount: number;
  attentionRequiredCount: number;
  idleCount: number;
  completedCount: number;
}
