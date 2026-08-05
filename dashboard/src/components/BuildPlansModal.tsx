import React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X, Sparkles, Layers, ListChecks, Route, FileText, ArrowRight, Target, ShieldCheck, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { ProjectWorkflow } from '../types/workflow';

interface BuildPlansModalProps {
  workflows: ProjectWorkflow[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (workflow: ProjectWorkflow) => void;
}

export const BuildPlansModal: React.FC<BuildPlansModalProps> = ({
  workflows,
  isOpen,
  onClose,
  onSelectProject
}) => {
  const workflowsWithPlans = workflows.filter(
    (w) => w.buildPlanCount > 0 && w.activeBuildPlan
  );

  const totalSlices = workflowsWithPlans.reduce(
    (acc, w) => acc + (w.activeBuildPlan?.slices.length || 0),
    0
  );

  const renderStatusBadge = (status: string) => {
    if (status.includes('已完成')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          已完成
        </span>
      );
    }
    if (status.includes('進行中')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
          <PlayCircle className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          進行中
        </span>
      );
    }
    if (status.includes('阻塞') || status.includes('需補充')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/80 text-rose-300 border border-rose-500/30">
          {status}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
        <Clock className="w-2.5 h-2.5 text-slate-400" />
        {status || '未開始'}
      </span>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay Backdrop */}
        <Dialog.Backdrop className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity animate-in fade-in duration-200" />

        {/* Modal Container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="glass-panel w-full max-w-4xl max-h-[85vh] rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <Dialog.Title className="text-xl font-bold text-white">
                    全域 Build Plans 藍圖數據庫
                  </Dialog.Title>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                    {workflowsWithPlans.length} 份計畫 / {totalSlices} 切片
                  </span>
                </div>
                <Dialog.Description className="text-xs text-slate-400">
                  掃描自所有採用 Harness 規範專案之 <code className="text-purple-300 font-mono">.github/harness/plan/*-build-plan.md</code>
                </Dialog.Description>
              </div>

              <Dialog.Close
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {workflowsWithPlans.length > 0 ? (
                workflowsWithPlans.map((w) => {
                  const plan = w.activeBuildPlan!;
                  const hasTaskCard = !!plan.taskCard || !!plan.currentSliceGoal;
                  return (
                    <div
                      key={w.projectPath}
                      className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all"
                    >
                      {/* Plan Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {w.projectName}
                          </span>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-purple-400" />
                            {plan.title}
                          </h4>
                          {w.activeTask.status === '進行中' ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              進行中任務計畫
                            </span>
                          ) : w.activeTask.status === '阻塞' || w.activeTask.status === '需補充輸入' ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                              {w.activeTask.status}計畫
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              最近完成紀錄
                            </span>
                          )}
                          {plan.featureName && (
                            <span className="text-[11px] font-mono text-slate-400">
                              ({plan.featureName})
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onSelectProject(w);
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer self-start md:self-auto"
                        >
                          <span>開啟專案卡片</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* File Path */}
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {plan.filePath}
                      </div>

                      {/* Active Task / Task Card Banner (工作內容與 Skill Route) */}
                      {hasTaskCard && (
                        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                              <Target className="w-4 h-4 text-purple-400" />
                              <span>
                                {plan.currentTaskId ? `本輪進行中任務：${plan.currentTaskId}` : '本輪任務卡 (Task Card)'}
                              </span>
                            </div>
                            {(plan.taskCard?.route || w.activeTask.route) && (plan.taskCard?.route !== 'none' || w.activeTask.route !== 'none') && (
                              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/40 flex items-center gap-1.5">
                                <Route className="w-3.5 h-3.5 text-purple-400" />
                                <span>Route: {plan.taskCard?.route || w.activeTask.route}</span>
                              </span>
                            )}
                          </div>

                          {/* Work Content / Goal */}
                          {(plan.currentSliceGoal || plan.taskCard?.goal) && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-medium text-purple-300/80">工作內容 / 目標：</span>
                              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-purple-900/40">
                                {plan.currentSliceGoal || plan.taskCard?.goal}
                              </p>
                            </div>
                          )}

                          {/* In/Out Boundary */}
                          {plan.taskCard?.inOutScope && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-medium text-purple-300/80">範圍邊界 (In/Out Boundary)：</span>
                              <p className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                                {plan.taskCard.inOutScope}
                              </p>
                            </div>
                          )}

                          {/* Acceptance Criteria */}
                          {plan.taskCard?.acceptanceCriteria && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-medium text-purple-300/80">驗收標準：</span>
                              <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 leading-relaxed">
                                {plan.taskCard.acceptanceCriteria}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Slices List */}
                      {plan.slices.length > 0 && (
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-300">
                            <ListChecks className="w-4 h-4 text-purple-400" />
                            <span>執行切片清單 ({plan.slices.length})</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {plan.slices.map((slice, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-2 hover:bg-slate-900 transition-colors"
                              >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    {renderStatusBadge(slice.status)}
                                    <span className="text-xs font-bold text-slate-200">
                                      {slice.title}
                                    </span>
                                  </div>
                                  {slice.route && slice.route !== 'none' && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                      <Route className="w-3 h-3 text-purple-400" />
                                      {slice.route}
                                    </span>
                                  )}
                                </div>

                                {(slice.goal || slice.description) && (
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    <strong className="text-slate-400 font-normal">工作目標：</strong>{slice.goal || slice.description}
                                  </p>
                                )}

                                {slice.boundary && (
                                  <p className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                                    <strong className="text-slate-500">In/Out:</strong> {slice.boundary}
                                  </p>
                                )}

                                {slice.verification && (
                                  <div className="text-[11px] text-emerald-400/90 flex items-start gap-1 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span><strong>驗證方式：</strong>{slice.verification}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>目前尚無發現任何 Build Plan 數據。</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950 transition-all cursor-pointer focus:outline-none"
              >
                關閉頁面
              </button>
            </div>

          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

