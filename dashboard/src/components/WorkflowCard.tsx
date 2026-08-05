import React from 'react';
import { ProjectWorkflow } from '../types/workflow';
import { ResumeCopyButton } from './ResumeCopyButton';
import { ExternalLink, Layers, PlayCircle, Route, Sparkles, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface WorkflowCardProps {
  workflow: ProjectWorkflow;
  onSelect: (workflow: ProjectWorkflow) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onSelect }) => {
  const { projectName, activeTask, buildPlanCount, activeBuildPlan, projectPath } = workflow;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case '進行中':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
            進行中
          </span>
        );
      case '阻塞':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500 radar-alert" />
            阻塞 (Blocked)
          </span>
        );
      case '需補充輸入':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertOctagon className="w-3 h-3 text-amber-400" />
            需補充輸入
          </span>
        );
      case '暫停':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            暫停
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            待命 (Idle)
          </span>
        );
    }
  };

  const getCardBorder = (status: string) => {
    if (status === '進行中') return 'border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-950/20';
    if (status === '阻塞') return 'border-rose-500/40 hover:border-rose-500/70 shadow-rose-950/20';
    if (status === '需補充輸入') return 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/20';
    return 'border-slate-800 hover:border-slate-700';
  };

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 border ${getCardBorder(activeTask.status)} flex flex-col justify-between relative overflow-hidden group`}>
      
      {/* Top Bar: Project Name & Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/20">
                {projectName}
              </span>
              {buildPlanCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {buildPlanCount} Plans
                </span>
              )}
            </div>
          </div>
          {renderStatusBadge(activeTask.status)}
        </div>

        {/* Task Title / ID */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
            {activeTask.id !== 'none' ? `[${activeTask.id}] ${activeTask.title}` : `專案 ${projectName}`}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {activeTask.goal && activeTask.goal !== 'N/A' ? activeTask.goal : '目前專案處於待命狀態，尚無執行中任務。'}
          </p>
        </div>

        {/* Route Badge */}
        {activeTask.route && activeTask.route !== 'none' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Route:</span>
            <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Route className="w-3 h-3 text-cyan-400" />
              {activeTask.route}
            </span>
          </div>
        )}

        {/* Current Step snippet */}
        {activeTask.currentStep && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>當前進度</span>
            </div>
            <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed font-mono">
              {activeTask.currentStep}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <ResumeCopyButton resumeEntry={activeTask.resumeEntry} projectPath={projectPath} />

        <button
          onClick={() => onSelect(workflow)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer focus:outline-none"
        >
          <span>查看細節</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

    </div>
  );
};
