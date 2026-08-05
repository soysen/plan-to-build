import React from 'react';
import { Activity, AlertTriangle, Clock, Layers, Sparkles, ChevronRight } from 'lucide-react';
import { GlobalMetrics, TabFilter } from '../types/workflow';

interface HeaderMetricsProps {
  metrics: GlobalMetrics;
  isLiveConnected: boolean;
  totalBuildPlans: number;
  currentTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  onOpenBuildPlansModal: () => void;
}

export const HeaderMetrics: React.FC<HeaderMetricsProps> = ({
  metrics,
  isLiveConnected,
  totalBuildPlans,
  currentTab,
  onTabChange,
  onOpenBuildPlansModal
}) => {
  return (
    <header className="mb-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Harness Workflow 控制台
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  AGENTS.md v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                實時監控 <code className="text-cyan-300 font-mono">~/projects/</code> 內所有 Harness 規範專案與 Agent 執行切片
              </p>
            </div>
          </div>
        </div>

        {/* Live SSE Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
            isLiveConnected 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-950/40' 
              : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 radar-live' : 'bg-rose-500'}`} />
            {isLiveConnected ? 'SSE Live 直播連線中' : '連線已中斷 (重連中...)'}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid (Interactive & Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Projects Card */}
        <div
          onClick={() => onTabChange('all')}
          className={`glass-panel p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group ${
            currentTab === 'all' ? 'border-cyan-500/50 ring-1 ring-cyan-500/30 bg-cyan-950/20' : 'hover:border-cyan-500/30'
          }`}
          title="點擊查看所有專案"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-cyan-300 transition-colors">總監測專案</span>
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalProjects}</div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-cyan-400 font-medium">
            <span>點擊切換頁籤</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Active Tasks Card */}
        <div
          onClick={() => onTabChange('active')}
          className={`glass-panel p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] border-emerald-500/20 group ${
            currentTab === 'active' ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-emerald-950/20' : 'hover:border-emerald-500/40'
          }`}
          title="點擊切換至進行中專案"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-emerald-400">執行進行中</span>
            <Activity className="w-4 h-4 text-emerald-400 group-hover:animate-spin" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{metrics.activeTasksCount}</div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-emerald-400 font-medium">
            <span>點擊篩選進行中</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Attention Required Card */}
        <div
          onClick={() => onTabChange('attention')}
          className={`glass-panel p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] border-amber-500/20 group ${
            currentTab === 'attention' ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-amber-950/20' : 'hover:border-amber-500/40'
          }`}
          title="點擊切換至需注意專案"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-amber-400">需補充/阻塞</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:bounce transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.attentionRequiredCount}</div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-amber-400 font-medium">
            <span>點擊處置阻塞</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Idle Card */}
        <div
          onClick={() => onTabChange('idle')}
          className={`glass-panel p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group ${
            currentTab === 'idle' ? 'border-slate-500/60 ring-1 ring-slate-500/40 bg-slate-900/40' : 'hover:border-slate-700'
          }`}
          title="點擊查看待命專案"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium group-hover:text-slate-200 transition-colors">待命 (Idle)</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 font-mono">{metrics.idleCount}</div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-medium">
            <span>點擊篩選待命</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Build Plans Card (Opens BuildPlansModal) */}
        <div
          onClick={onOpenBuildPlansModal}
          className="glass-panel p-4 rounded-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] border-purple-500/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/30 group"
          title="點擊開啟 Build Plans 藍圖數據庫"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-purple-400">Build Plans</span>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">{totalBuildPlans}</div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-purple-400 font-medium">
            <span>開啟數據庫頁面</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
};
