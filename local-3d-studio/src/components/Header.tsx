import React, { useState } from 'react';
import { Camera, Download, RotateCcw, HelpCircle, Box, User, Dog, Sparkles, Layers } from 'lucide-react';
import { ModelType, StudioConfig } from '../types/studio';

interface HeaderProps {
  config: StudioConfig;
  onChangeModelType: (type: ModelType) => void;
  onTakeSnapshot: () => void;
  onExportOBJ: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeModelType,
  onTakeSnapshot,
  onExportOBJ,
  onResetAll,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 glass-panel px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Box className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Local 3D Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/50 rounded-full tracking-wider uppercase">
                v1.0 Local
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">繪師專用 3D 素材建模、透視焦距與動態姿態攝影棚</p>
          </div>
        </div>

        {/* Model Type Selector */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeModelType('humanoid_male')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.modelType === 'humanoid_male'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            有機男體
          </button>

          <button
            onClick={() => onChangeModelType('humanoid_female')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.modelType === 'humanoid_female'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5 text-pink-400" />
            有機女體
          </button>

          <button
            onClick={() => onChangeModelType('quadruped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.modelType === 'quadruped'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Dog className="w-3.5 h-3.5 text-emerald-400" />
            四足動物
          </button>

          <button
            onClick={() => onChangeModelType('custom_upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.modelType === 'custom_upload'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            素材轉 3D
          </button>

          <button
            onClick={() => onChangeModelType('prop_box')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.modelType === 'prop_box'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            幾何道具
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTakeSnapshot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            title="擷取繪圖參考 PNG 高畫質圖檔"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">擷取快照</span>
          </button>

          <button
            onClick={onExportOBJ}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all active:scale-95"
            title="匯出 3D OBJ 模型檔 (可供 Blender / CSP 使用)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">匯出 3D</span>
          </button>

          <button
            onClick={onResetAll}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="重置相機與關節姿態"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="操作指南"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Local 3D Studio 繪師操作手冊
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-indigo-300 mb-1">1. 有機人體比例 (Organic Humanoid)</h4>
                <p>點擊頂部選單切換 **有機男體** 或 **有機女體**：</p>
                <p>・身體比例精準參照經典繪圖木偶（倒梯形前胸、腰部與胯骨比例）。</p>
                <p>・雕塑流線有機肌肉輪廓、真實細部 5 指手勢與 5 趾腳掌。</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-pink-300 mb-1">2. 3D 鏡頭與姿態手勢</h4>
                <p>・滑鼠左鍵拖曳：360° 旋轉攝影棚視角；點擊關節後拖曳 3D 旋轉環擺定姿態。</p>
                <p>・滑鼠右鍵拖曳：平移鏡頭位置。</p>
                <p>・滾輪縮放：放大 / 縮小視角。</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl font-medium text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110"
            >
              了解並開始創作
            </button>
          </div>
        </div>
      )}
    </>
  );
};
