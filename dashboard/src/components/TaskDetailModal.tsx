import React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X, CheckCircle2, AlertTriangle, FileCode, Route, Target, ListChecks, PlayCircle } from 'lucide-react';
import { ProjectWorkflow } from '../types/workflow';
import { ResumeCopyButton } from './ResumeCopyButton';

interface TaskDetailModalProps {
  workflow: ProjectWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ workflow, isOpen, onClose }) => {
  if (!workflow) return null;

  const { activeTask, projectName, projectPath, activeBuildPlan, lastCompletedTask } = workflow;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '進行中':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
            進行中 (Active)
          </span>
        );
      case '阻塞':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 radar-alert" />
            阻塞 (Blocked)
          </span>
        );
      case '需補充輸入':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            需補充輸入 (Input Needed)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            待命 (Idle)
          </span>
        );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay Backdrop */}
        <Dialog.Backdrop className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity animate-in fade-in duration-200" />

        {/* Modal Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-700/80 shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/50">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {projectName}
                  </span>
                  {getStatusBadge(activeTask.status)}
                </div>
                <Dialog.Title className="text-xl font-bold text-white mt-2">
                  {activeTask.id !== 'none' ? `[${activeTask.id}] ${activeTask.title}` : `專案 [${projectName}] 狀態詳情`}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-400 font-mono">
                  {projectPath}
                </Dialog.Description>
              </div>

              <div className="flex items-center gap-2">
                <ResumeCopyButton resumeEntry={activeTask.resumeEntry} projectPath={projectPath} />
                <Dialog.Close
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              
              {/* Task Details Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Route */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Route className="w-4 h-4 text-cyan-400" />
                    <span>Skill Route</span>
                  </div>
                  <div className="text-sm font-mono text-cyan-300 font-medium">
                    {activeTask.route || 'none'}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>最後更新時間</span>
                  </div>
                  <div className="text-sm font-mono text-slate-200">
                    {activeTask.lastUpdated || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>任務目標 (Goal)</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {activeTask.goal || '目前無明確目標標記'}
                </p>
              </div>

              {/* Execution Tracking */}
              {(activeTask.currentStep || activeTask.evidence) && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 border-b border-slate-800 pb-2">
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                    <span>執行追蹤 (Execution Tracking)</span>
                  </div>

                  {activeTask.currentStep && (
                    <div>
                      <span className="text-xs text-slate-400">當前步驟 (CurrentStep)：</span>
                      <p className="text-emerald-300 font-mono text-xs mt-0.5 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                        {activeTask.currentStep}
                      </p>
                    </div>
                  )}

                  {activeTask.evidence && (
                    <div>
                      <span className="text-xs text-slate-400">驗證證據 (Evidence)：</span>
                      <p className="text-slate-300 text-xs mt-0.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                        {activeTask.evidence}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Active Build Plan & Slices */}
              {activeBuildPlan && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
                      <ListChecks className="w-4 h-4 text-purple-400" />
                      <span>Build Plan 藍圖執行清單 ({activeBuildPlan.slices.length} 個切片)</span>
                    </div>
                    <span className="text-[11px] font-mono text-purple-300">{activeBuildPlan.title}</span>
                  </div>

                  {/* Task Card / Current Slice Goal */}
                  {(activeBuildPlan.currentSliceGoal || activeBuildPlan.taskCard?.goal) && (
                    <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-purple-300">
                          {activeTask.status !== 'idle'
                            ? (activeBuildPlan.currentTaskId ? `進行中任務：${activeBuildPlan.currentTaskId}` : '本輪任務目標')
                            : (lastCompletedTask?.id ? `最近完成任務：${lastCompletedTask.id}` : '最近任務紀錄')}
                        </span>
                        {(activeBuildPlan.taskCard?.route || activeTask.route || lastCompletedTask?.route) && 
                         (activeBuildPlan.taskCard?.route !== 'none' || activeTask.route !== 'none' || lastCompletedTask?.route !== 'none') && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                            Route: {activeBuildPlan.taskCard?.route || (activeTask.route !== 'none' ? activeTask.route : lastCompletedTask?.route)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        {activeBuildPlan.currentSliceGoal || activeBuildPlan.taskCard?.goal}
                      </p>
                      {activeBuildPlan.taskCard?.inOutScope && (
                        <p className="text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                          <strong className="text-slate-500">In/Out:</strong> {activeBuildPlan.taskCard.inOutScope}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Slices list */}
                  {activeBuildPlan.slices.length > 0 && (
                    <div className="space-y-2">
                      {activeBuildPlan.slices.map((slice, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between flex-wrap gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                slice.status.includes('已完成')
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                                  : slice.status.includes('進行中')
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {slice.status}
                              </span>
                              <span className="text-xs font-bold text-slate-200">{slice.title}</span>
                            </div>
                            {slice.route && slice.route !== 'none' && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                                {slice.route}
                              </span>
                            )}
                          </div>

                          {(slice.goal || slice.description) && (
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {slice.goal || slice.description}
                            </p>
                          )}

                          {slice.boundary && (
                            <p className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
                              <strong className="text-slate-500">In/Out:</strong> {slice.boundary}
                            </p>
                          )}

                          {slice.verification && (
                            <p className="text-[11px] text-emerald-400/90 bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20">
                              <strong>驗證：</strong>{slice.verification}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Updated Files */}
              {activeTask.updatedFiles && activeTask.updatedFiles.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>異動檔案清單</span>
                  </div>
                  <ul className="space-y-1 font-mono text-xs text-cyan-300">
                    {activeTask.updatedFiles.map((file, idx) => (
                      <li key={idx} className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 truncate">
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950 transition-all cursor-pointer focus:outline-none"
              >
                關閉 Details
              </button>
            </div>

          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
