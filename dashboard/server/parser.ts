import fs from 'fs';
import path from 'path';
import { 
  ProjectWorkflow, 
  ActiveTaskInfo, 
  CompletedTaskInfo, 
  TaskStatus, 
  ActiveBuildPlan, 
  BuildPlanSlice, 
  TaskCardInfo, 
  BuildPlanTaskDetail 
} from '../src/types/workflow.js';

export function parseAgentStatusContent(content: string, statusFilePath: string): { activeTask: ActiveTaskInfo; lastCompletedTask?: CompletedTaskInfo } {
  const lines = content.split('\n');
  let currentSection = '';
  
  const activeFields: Record<string, string> = {};
  const completedFields: Record<string, string> = {};
  const executionFields: Record<string, string> = {};
  const resumeFields: Record<string, string> = {};
  const activeUpdatedFiles: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim();
      continue;
    }

    if (line.startsWith('- ')) {
      const colonIdx = line.indexOf(':');
      const altColonIdx = line.indexOf('：');
      const idx = (colonIdx !== -1 && altColonIdx !== -1) 
        ? Math.min(colonIdx, altColonIdx) 
        : (colonIdx !== -1 ? colonIdx : altColonIdx);

      if (idx !== -1) {
        const key = line.substring(2, idx).trim().toLowerCase();
        const value = line.substring(idx + 1).trim();

        if (currentSection === 'Active Task') {
          activeFields[key] = value;
        } else if (currentSection === 'Last Completed Task') {
          completedFields[key] = value;
        } else if (currentSection === 'Execution Tracking') {
          executionFields[key] = value;
        } else if (currentSection === 'Resume Entry') {
          resumeFields[key] = value;
        }
      } else if (currentSection === 'Active Task' && line.startsWith('- Updated files:')) {
        // Collect bulleted sub-files
        let j = i + 1;
        while (j < lines.length && (lines[j].trim().startsWith('  - ') || lines[j].trim().startsWith('\t- '))) {
          activeUpdatedFiles.push(lines[j].trim().replace(/^[- \t]+/, ''));
          j++;
        }
      }
    }
  }

  // Determine status
  let rawStatus = activeFields['status'] || 'idle';
  let status: TaskStatus = 'idle';
  if (rawStatus.includes('進行中')) status = '進行中';
  else if (rawStatus.includes('阻塞')) status = '阻塞';
  else if (rawStatus.includes('暫停')) status = '暫停';
  else if (rawStatus.includes('需補充輸入')) status = '需補充輸入';
  else if (rawStatus.includes('已完成')) status = '已完成';
  else if (rawStatus.includes('idle')) status = 'idle';

  const activeTask: ActiveTaskInfo = {
    id: activeFields['id'] || 'none',
    title: activeFields['title'] || 'N/A',
    status,
    lastUpdated: activeFields['last updated'] || activeFields['lastupdated'] || 'N/A',
    goal: activeFields['goal'] || activeFields['目標'] || 'N/A',
    route: activeFields['route'] || activeFields['路由 (skill route)'] || activeFields['路由'] || 'none',
    taskLevel: activeFields['task level'] || activeFields['level'] || undefined,
    currentStep: executionFields['currentstep'] || executionFields['current step'] || undefined,
    evidence: executionFields['evidence'] || activeFields['evidence'] || undefined,
    nextStep: executionFields['nextstep'] || executionFields['next step'] || undefined,
    resumeEntry: resumeFields['start here'] ? `Start here: ${resumeFields['start here']}` : undefined,
    updatedFiles: activeUpdatedFiles.length > 0 ? activeUpdatedFiles : undefined
  };

  let lastCompletedTask: CompletedTaskInfo | undefined = undefined;
  if (completedFields['id'] && completedFields['id'] !== 'none') {
    lastCompletedTask = {
      id: completedFields['id'],
      title: completedFields['title'] || 'N/A',
      status: completedFields['status'] || '已完成',
      lastUpdated: completedFields['last updated'] || 'N/A',
      goal: completedFields['goal'] || 'N/A',
      route: completedFields['route'] || 'none',
      taskLevel: completedFields['task level'],
      evidence: completedFields['evidence']
    };
  }

  return { activeTask, lastCompletedTask };
}

export function parseBuildPlanContent(content: string, filePath: string, fallbackRoute?: string): ActiveBuildPlan {
  const lines = content.split('\n');
  const h1Line = lines.find(l => l.trim().startsWith('# '));
  const title = h1Line ? h1Line.trim().replace(/^#\s*/, '').trim() : path.basename(filePath);

  let featureName: string | undefined;
  let currentTaskId: string | undefined;
  let currentSliceGoal: string | undefined;
  let taskCard: TaskCardInfo | undefined;

  let currentH2 = '';
  let currentH3 = '';
  let currentH4 = '';

  const explicitSlices: BuildPlanSlice[] = [];
  const tasks: BuildPlanTaskDetail[] = [];
  let currentTask: Partial<BuildPlanTaskDetail> | null = null;
  let currentExplicitSlice: Partial<BuildPlanSlice> | null = null;
  let inTaskCard = false;
  const taskCardFields: Record<string, string> = {};

  const isIgnoredH3 = (heading: string) => {
    const h = heading.toLowerCase();
    return (
      h.includes('未完成任務（優先閱讀）') ||
      h.includes('已重置任務') ||
      h.includes('已完成任務（摘要）') ||
      h.includes('本期包含') ||
      h.includes('本期不包含') ||
      h.includes('未完成任務詳情') ||
      h.includes('已完成任務詳情')
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('## ')) {
      currentH2 = trimmed.substring(3).trim();
      currentH3 = '';
      currentH4 = '';
      inTaskCard = currentH2.includes('任務卡');

      // Save ongoing slice or task if any
      if (currentExplicitSlice && currentExplicitSlice.title) {
        explicitSlices.push(currentExplicitSlice as BuildPlanSlice);
        currentExplicitSlice = null;
      }
      if (currentTask && currentTask.id) {
        tasks.push(currentTask as BuildPlanTaskDetail);
        currentTask = null;
      }
      continue;
    }

    if (trimmed.startsWith('### ')) {
      currentH3 = trimmed.substring(4).trim();
      currentH4 = '';

      if (currentExplicitSlice && currentExplicitSlice.title) {
        explicitSlices.push(currentExplicitSlice as BuildPlanSlice);
        currentExplicitSlice = null;
      }
      if (currentTask && currentTask.id) {
        tasks.push(currentTask as BuildPlanTaskDetail);
        currentTask = null;
      }

      if (isIgnoredH3(currentH3)) {
        continue;
      }

      // Check if explicit Slice (e.g. ### 切片 1：... or ### Slice 1: ...)
      if (/^(切片\s*\d+|slice\s*\d+)/i.test(currentH3)) {
        let status = '進行中';
        if (currentH3.includes('[已完成]') || currentH3.includes('(已完成)')) status = '已完成';
        else if (currentH3.includes('[未開始]') || currentH3.includes('(未開始)')) status = '未開始';
        else if (currentH3.includes('[阻塞]') || currentH3.includes('(阻塞)')) status = '阻塞';

        currentExplicitSlice = {
          sliceId: `slice-${explicitSlices.length + 1}`,
          title: currentH3,
          status,
          route: fallbackRoute || 'none'
        };
        continue;
      }

      // Check if Task detail (e.g. ### TASK-XXX：... or ### TASK-001)
      const taskMatch = currentH3.match(/^(TASK-[A-Za-z0-9_-]+|[A-Za-z0-9_-]+)[：:\s]*(.*)$/i);
      if (taskMatch) {
        currentTask = {
          id: taskMatch[1].trim(),
          title: taskMatch[2]?.trim() || taskMatch[1].trim(),
          status: '進行中',
          route: fallbackRoute || 'none',
          acceptanceCriteria: [],
          slices: []
        };
        continue;
      }
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      currentH4 = trimmed.substring(5).trim();
      continue;
    }

    // Extract metadata from ## 狀態 & ## Workflow 模式與交接
    if (trimmed.startsWith('- ')) {
      const colonIdx = trimmed.indexOf(':');
      const altColonIdx = trimmed.indexOf('：');
      const idx = (colonIdx !== -1 && altColonIdx !== -1) 
        ? Math.min(colonIdx, altColonIdx) 
        : (colonIdx !== -1 ? colonIdx : altColonIdx);

      if (idx !== -1) {
        const rawKey = trimmed.substring(2, idx).replace(/\*\*/g, '').trim().toLowerCase();
        const value = trimmed.substring(idx + 1).replace(/\*\*/g, '').trim();

        if (rawKey === 'feature name') featureName = value;
        if (rawKey.includes('目前任務 id') || rawKey.includes('任務 id')) currentTaskId = value;
        if (rawKey.includes('本輪切片目標') || rawKey.includes('切片目標')) currentSliceGoal = value;

        if (inTaskCard) {
          taskCardFields[rawKey] = value;
        }

        // Fill explicit slice properties
        if (currentExplicitSlice) {
          if (rawKey.includes('目標') || rawKey === 'goal') {
            currentExplicitSlice.goal = value;
          } else if (rawKey.includes('route') || rawKey.includes('路由')) {
            currentExplicitSlice.route = value;
          } else if (rawKey.includes('boundary') || rawKey.includes('範圍') || rawKey.includes('in/out')) {
            currentExplicitSlice.boundary = value;
          } else if (rawKey.includes('驗證') || rawKey.includes('evidence') || rawKey.includes('標準')) {
            currentExplicitSlice.verification = value;
          } else if (rawKey.includes('狀態') || rawKey === 'status') {
            currentExplicitSlice.status = value;
          }
        }

        // Fill task properties
        if (currentTask) {
          if (rawKey.includes('狀態') || rawKey === 'status') currentTask.status = value;
          else if (rawKey.includes('類型') || rawKey === 'type') currentTask.type = value;
          else if (rawKey.includes('優先') || rawKey === 'priority') currentTask.priority = value;
          else if (rawKey.includes('估點') || rawKey === 'estimate') currentTask.estimate = value;
          else if (rawKey.includes('里程碑') || rawKey === 'milestone') currentTask.milestone = value;
          else if (rawKey.includes('route') || rawKey.includes('路由')) currentTask.route = value;
        }
      }
    }

    // Capture task description in #### 描述
    if (currentTask && currentH4.includes('描述') && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('- 狀態')) {
      if (!currentTask.description) {
        currentTask.description = trimmed;
      } else {
        currentTask.description += ' ' + trimmed;
      }
    }

    // Capture task criteria in #### 驗收標準
    if (currentTask && currentH4.includes('驗收標準') && (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]'))) {
      currentTask.acceptanceCriteria?.push(trimmed.substring(2));
    }

    // Capture slices table in #### 切片
    if (currentTask && currentH4.includes('切片') && trimmed.startsWith('|') && !trimmed.includes('---')) {
      const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3 && !parts[0].includes('切片') && !parts[0].includes('Slice')) {
        const sliceId = parts[0];
        const sliceStatus = parts[1] || '進行中';
        const sliceGoal = parts[2] || '';
        const sliceVerification = parts[3] || '';

        const subSlice: BuildPlanSlice = {
          sliceId: `${currentTask.id}-${sliceId}`,
          title: `[${currentTask.id}] 切片 ${sliceId}`,
          status: sliceStatus,
          goal: sliceGoal,
          verification: sliceVerification,
          route: currentTask.route || fallbackRoute || 'none'
        };
        currentTask.slices?.push(subSlice);
      }
    }
  }

  // Flush remaining
  if (currentExplicitSlice && currentExplicitSlice.title) {
    explicitSlices.push(currentExplicitSlice as BuildPlanSlice);
  }
  if (currentTask && currentTask.id) {
    tasks.push(currentTask as BuildPlanTaskDetail);
  }

  // Construct Task Card object if present
  if (Object.keys(taskCardFields).length > 0) {
    taskCard = {
      goal: taskCardFields['目標'] || taskCardFields['goal'],
      route: taskCardFields['路由 (skill route)'] || taskCardFields['路由'] || taskCardFields['skill route'] || taskCardFields['route'],
      inOutScope: taskCardFields['範圍 (in/out)'] || taskCardFields['範圍'] || taskCardFields['scope'] || taskCardFields['in/out'],
      acceptanceCriteria: taskCardFields['驗收標準'] || taskCardFields['criteria'],
      evidence: taskCardFields['驗證證據'] || taskCardFields['evidence'],
      resumeEntry: taskCardFields['阻塞/恢復入口'] || taskCardFields['恢復入口']
    };
  }

  // Synthesize Slices
  let finalSlices: BuildPlanSlice[] = [];

  if (explicitSlices.length > 0) {
    finalSlices = explicitSlices;
  } else {
    // Collect from tasks' sub-slices or convert tasks into slices
    const subSlicesFromTasks: BuildPlanSlice[] = [];
    for (const t of tasks) {
      if (t.slices && t.slices.length > 0) {
        for (const s of t.slices) {
          if (!s.route || s.route === 'none') {
            s.route = t.route || taskCard?.route || fallbackRoute || 'none';
          }
          subSlicesFromTasks.push(s);
        }
      }
    }

    if (subSlicesFromTasks.length > 0) {
      finalSlices = subSlicesFromTasks;
    } else if (tasks.length > 0) {
      finalSlices = tasks.map(t => ({
        sliceId: t.id,
        title: `[${t.id}] ${t.title}`,
        status: t.status,
        route: t.route || taskCard?.route || fallbackRoute || 'none',
        goal: t.description || t.title,
        description: t.description,
        verification: t.acceptanceCriteria?.join('; ')
      }));
    } else if (taskCard || currentSliceGoal) {
      finalSlices.push({
        sliceId: currentTaskId || 'active-slice-1',
        title: currentSliceGoal ? `當前切片：${currentSliceGoal}` : `任務卡工作切片`,
        status: '進行中',
        route: taskCard?.route || fallbackRoute || 'none',
        goal: taskCard?.goal || currentSliceGoal,
        boundary: taskCard?.inOutScope,
        verification: taskCard?.acceptanceCriteria || taskCard?.evidence
      });
    }
  }

  // Ensure all slices have routes populated from taskCard / fallbackRoute if available
  finalSlices = finalSlices.map(s => ({
    ...s,
    route: (s.route && s.route !== 'none') ? s.route : (taskCard?.route || fallbackRoute || 'none')
  }));

  return {
    title,
    filePath,
    featureName,
    currentTaskId,
    currentSliceGoal,
    taskCard,
    slices: finalSlices,
    tasks: tasks.length > 0 ? tasks : undefined
  };
}

export function parseProjectWorkflow(statusFilePath: string): ProjectWorkflow | null {
  try {
    if (!fs.existsSync(statusFilePath)) return null;

    const statusContent = fs.readFileSync(statusFilePath, 'utf-8');
    const { activeTask, lastCompletedTask } = parseAgentStatusContent(statusContent, statusFilePath);

    // Extract project path (3 levels up from .github/worklog/agent-status.md)
    let realStatusPath = statusFilePath;
    try {
      realStatusPath = fs.realpathSync(statusFilePath);
    } catch {
      // fallback to original
    }

    const projectPath = path.resolve(realStatusPath, '../../..');
    const projectName = path.basename(projectPath);

    // Find build plans in project
    const planDir = path.join(projectPath, '.github', 'harness', 'plan');
    let buildPlanCount = 0;
    let activeBuildPlan: ActiveBuildPlan | undefined = undefined;

    if (fs.existsSync(planDir)) {
      const planFiles = fs
        .readdirSync(planDir)
        .filter(f => (f.endsWith('-build-plan.md') || f === 'build-plan.md') && f !== 'README.md');
      buildPlanCount = planFiles.length;

      if (planFiles.length > 0) {
        // Sort files by modification time (newest first)
        const planFilesWithStats = planFiles.map(f => {
          const fullPath = path.join(planDir, f);
          const stat = fs.statSync(fullPath);
          return { file: f, fullPath, mtimeMs: stat.mtimeMs };
        }).sort((a, b) => b.mtimeMs - a.mtimeMs);

        // Default to the most recently modified plan
        let selectedPlan = planFilesWithStats[0].file;

        // 1. If activeTask has an ID and is active, find the matching plan
        if (activeTask && activeTask.id && activeTask.id !== 'none' && activeTask.status !== 'idle') {
          const cleanId = activeTask.id.toLowerCase().replace(/^task-/, '');
          
          // Check by filename
          const matchByFile = planFilesWithStats.find(p => p.file.toLowerCase().includes(cleanId));
          if (matchByFile) {
            selectedPlan = matchByFile.file;
          } else {
            // Check by content
            for (const p of planFilesWithStats) {
              const content = fs.readFileSync(p.fullPath, 'utf-8');
              if (content.toLowerCase().includes(activeTask.id.toLowerCase())) {
                selectedPlan = p.file;
                break;
              }
            }
          }
        } 
        // 2. If activeTask is idle, but lastCompletedTask exists, find the last completed plan
        else if (lastCompletedTask && lastCompletedTask.id && lastCompletedTask.id !== 'none') {
          const cleanId = lastCompletedTask.id.toLowerCase().replace(/^task-/, '');
          
          // Check by filename
          const matchByFile = planFilesWithStats.find(p => p.file.toLowerCase().includes(cleanId));
          if (matchByFile) {
            selectedPlan = matchByFile.file;
          } else {
            // Check by content
            for (const p of planFilesWithStats) {
              const content = fs.readFileSync(p.fullPath, 'utf-8');
              if (content.toLowerCase().includes(lastCompletedTask.id.toLowerCase())) {
                selectedPlan = p.file;
                break;
              }
            }
          }
        }

        const planPath = path.join(planDir, selectedPlan);
        const planContent = fs.readFileSync(planPath, 'utf-8');
        const fallbackRoute = (activeTask && activeTask.route !== 'none')
          ? activeTask.route
          : (lastCompletedTask && lastCompletedTask.route !== 'none')
          ? lastCompletedTask.route
          : undefined;

        activeBuildPlan = parseBuildPlanContent(planContent, planPath, fallbackRoute);
      }
    }

    return {
      projectName,
      projectPath,
      statusFilePath: realStatusPath,
      activeTask,
      lastCompletedTask,
      buildPlanCount,
      activeBuildPlan
    };
  } catch (err) {
    console.error(`Failed to parse ${statusFilePath}:`, err);
    return null;
  }
}

