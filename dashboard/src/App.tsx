import React, { useEffect, useState, useMemo } from 'react';
import { ProjectWorkflow, GlobalMetrics, TabFilter } from './types/workflow';
import { HeaderMetrics } from './components/HeaderMetrics';
import { WorkflowCard } from './components/WorkflowCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { BuildPlansModal } from './components/BuildPlansModal';
import { Layers, Search } from 'lucide-react';

export const App: React.FC = () => {
  const [workflows, setWorkflows] = useState<ProjectWorkflow[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<TabFilter>('active');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProjectWorkflow | null>(null);
  const [isBuildPlansOpen, setIsBuildPlansOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Setup SSE Connection with fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/workflows/stream');

      eventSource.onopen = () => {
        console.log('[SSE] Connected to backend event stream');
        setIsLiveConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ProjectWorkflow[] = JSON.parse(event.data);
          setWorkflows(data);
        } catch (err) {
          console.error('[SSE] Failed to parse event data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('[SSE] Connection lost, retrying in 3s...', err);
        setIsLiveConnected(false);
        eventSource?.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Compute Metrics
  const metrics: GlobalMetrics = useMemo(() => {
    let activeTasksCount = 0;
    let attentionRequiredCount = 0;
    let idleCount = 0;
    let completedCount = 0;

    for (const w of workflows) {
      const s = w.activeTask.status;
      if (s === '進行中') activeTasksCount++;
      else if (s === '阻塞' || s === '需補充輸入') attentionRequiredCount++;
      else if (s === 'idle') idleCount++;
      else if (s === '已完成') completedCount++;
    }

    return {
      totalProjects: workflows.length,
      activeTasksCount,
      attentionRequiredCount,
      idleCount,
      completedCount
    };
  }, [workflows]);

  const totalBuildPlans = useMemo(() => {
    return workflows.reduce((acc, w) => acc + (w.buildPlanCount || 0), 0);
  }, [workflows]);

  // Filter Workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        w.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.activeTask.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.activeTask.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (currentTab === 'active') {
        return w.activeTask.status === '進行中';
      }
      if (currentTab === 'attention') {
        return w.activeTask.status === '阻塞' || w.activeTask.status === '需補充輸入';
      }
      if (currentTab === 'idle') {
        return w.activeTask.status === 'idle';
      }
      return true;
    });
  }, [workflows, currentTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 max-w-7xl mx-auto selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header Metrics Banner (Clickable cards to view detailed pages) */}
      <HeaderMetrics
        metrics={metrics}
        isLiveConnected={isLiveConnected}
        totalBuildPlans={totalBuildPlans}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenBuildPlansModal={() => setIsBuildPlansOpen(true)}
      />

      {/* Project Section Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200">
            {currentTab === 'active' && '執行進行中專案'}
            {currentTab === 'attention' && '需注意 / 阻塞專案'}
            {currentTab === 'idle' && '待命專案 (Idle)'}
            {currentTab === 'all' && '全部監控專案'}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-mono border border-slate-700/50">
            {filteredWorkflows.length} / {workflows.length}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋專案或 Task ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-panel text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Workflow Cards Grid */}
      {filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.projectPath}
              workflow={workflow}
              onSelect={setSelectedWorkflow}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">未找到符合條件的專案</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? `找不到與 "${searchQuery}" 相關的 Task 或專案。` : '當前分類標籤下尚無相關專案狀態記錄。'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        workflow={selectedWorkflow}
        isOpen={selectedWorkflow !== null}
        onClose={() => setSelectedWorkflow(null)}
      />

      {/* Build Plans Full Overview Modal */}
      <BuildPlansModal
        workflows={workflows}
        isOpen={isBuildPlansOpen}
        onClose={() => setIsBuildPlansOpen(false)}
        onSelectProject={(w) => setSelectedWorkflow(w)}
      />

    </div>
  );
};
