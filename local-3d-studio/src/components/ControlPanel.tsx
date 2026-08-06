import React, { useState } from 'react';
import { Camera, Sun, Upload, Eye, EyeOff, Layers, Sparkles, Move, RefreshCw, Dog, Target, X, Hand, Image as ImageIcon } from 'lucide-react';
import { CameraPreset, HandGesture, QuadrupedSpecies, RenderMode, StudioConfig } from '../types/studio';
import { JOINT_LIMITS, PRESET_POSES, clampJointAngle } from '../utils/3d-generators';

interface ControlPanelProps {
  config: StudioConfig;
  onChangeConfig: (newConfig: StudioConfig) => void;
  onUploadImage: (file: File) => void;
  onSelectImageFromUrl?: (imageUrl: string, fileName: string) => void;
  onUpload3DModel?: (file: File) => void;
  onTrigger3DConversion: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  onUploadImage,
  onSelectImageFromUrl,
  onUpload3DModel,
  onTrigger3DConversion,
}) => {
  const [activeTab, setActiveTab] = useState<'material' | 'camera' | 'lighting' | 'pose'>('pose');

  const updateCamera = (key: keyof StudioConfig['camera'], value: any) => {
    onChangeConfig({
      ...config,
      camera: {
        ...config.camera,
        [key]: value,
      },
    });
  };

  const updateLighting = (lightKey: keyof StudioConfig['lighting'], prop: string, value: any) => {
    onChangeConfig({
      ...config,
      lighting: {
        ...config.lighting,
        [lightKey]: {
          ...(config.lighting[lightKey] as any),
          [prop]: value,
        },
      },
    });
  };

  const updateJointRotation = (jointName: string, axis: 'x' | 'y' | 'z', value: number) => {
    const clampedValue = clampJointAngle(jointName, axis, value);
    onChangeConfig({
      ...config,
      pose: {
        ...config.pose,
        joints: {
          ...config.pose.joints,
          [jointName]: {
            ...(config.pose.joints[jointName] || { x: 0, y: 0, z: 0 }),
            [axis]: clampedValue,
          },
        },
      },
    });
  };

  const applyPresetPose = (poseKey: string) => {
    const preset = PRESET_POSES[poseKey];
    if (preset) {
      onChangeConfig({
        ...config,
        pose: {
          ...config.pose,
          presetName: preset.presetName,
          leftHandGesture: preset.leftHandGesture || 'relaxed',
          rightHandGesture: preset.rightHandGesture || 'relaxed',
          joints: { ...preset.joints },
        },
      });
    }
  };

  const setHandGesture = (side: 'left' | 'right', gesture: HandGesture) => {
    onChangeConfig({
      ...config,
      pose: {
        ...config.pose,
        [side === 'left' ? 'leftHandGesture' : 'rightHandGesture']: gesture,
      },
    });
  };

  return (
    <aside className="w-80 border-l border-slate-800 glass-panel flex flex-col z-20 shrink-0 select-none">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/40 p-1 gap-1">
        <button
          onClick={() => setActiveTab('pose')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'pose'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Move className="w-4 h-4" />
          <span>姿態與手勢</span>
        </button>

        <button
          onClick={() => setActiveTab('material')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'material'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>3D 生成</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'camera'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>相機透視</span>
        </button>

        <button
          onClick={() => setActiveTab('lighting')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'lighting'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>三點打光</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB: 關節與姿勢 */}
        {activeTab === 'pose' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Move className="w-4 h-4 text-emerald-400" />
                關節姿態與細部手勢 (Posing & Gestures)
              </span>
            </h3>

            {/* Selected Joint Indicator Banner */}
            {config.selectedJoint ? (
              <div className="p-3 bg-gradient-to-r from-cyan-950/80 via-emerald-950/60 to-slate-900 rounded-xl border border-cyan-500/40 flex items-center justify-between shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">已在 3D 畫面點擊選中</div>
                    <div className="text-xs font-bold text-white capitalize">{config.selectedJoint}</div>
                  </div>
                </div>
                <button
                  onClick={() => onChangeConfig({ ...config, selectedJoint: null })}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="取消選擇關節"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>提示：在 3D 畫面直接點擊任何關節，即可顯示 3D 旋轉環並調整！</span>
              </div>
            )}

            {/* Human Hand Gesture Controls */}
            {(config.modelType === 'humanoid_male' || config.modelType === 'humanoid_female') && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Hand className="w-4 h-4 text-cyan-400" />
                  <span>手部細節與手勢控制 (Hand Gestures)</span>
                </div>

                {/* Left Hand Gesture */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">左手手勢 (Left Hand)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['relaxed', 'open_palm', 'fist', 'pointing', 'victory', 'holding'] as HandGesture[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setHandGesture('left', g)}
                        className={`py-1 px-1.5 text-[10px] rounded font-medium capitalize border transition-all ${
                          config.pose.leftHandGesture === g
                            ? 'bg-cyan-600 text-white border-cyan-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {g === 'relaxed'
                          ? '放鬆'
                          : g === 'open_palm'
                          ? '平張掌'
                          : g === 'fist'
                          ? '握拳'
                          : g === 'pointing'
                          ? '指路'
                          : g === 'victory'
                          ? '剪刀手'
                          : '抓握道具'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Hand Gesture */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">右手手勢 (Right Hand)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['relaxed', 'open_palm', 'fist', 'pointing', 'victory', 'holding'] as HandGesture[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setHandGesture('right', g)}
                        className={`py-1 px-1.5 text-[10px] rounded font-medium capitalize border transition-all ${
                          config.pose.rightHandGesture === g
                            ? 'bg-cyan-600 text-white border-cyan-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {g === 'relaxed'
                          ? '放鬆'
                          : g === 'open_palm'
                          ? '平張掌'
                          : g === 'fist'
                          ? '握拳'
                          : g === 'pointing'
                          ? '指路'
                          : g === 'victory'
                          ? '剪刀手'
                          : '抓握道具'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quadruped Species Selector */}
            {config.modelType === 'quadruped' && (
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Dog className="w-4 h-4 text-emerald-400" />
                  四足生物解剖物種 (Species)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['canine', 'feline', 'equine'] as QuadrupedSpecies[]).map((species) => (
                    <button
                      key={species}
                      onClick={() => onChangeConfig({ ...config, quadrupedSpecies: species })}
                      className={`py-1.5 px-2 text-xs rounded-lg font-medium border capitalize transition-all ${
                        config.quadrupedSpecies === species
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {species === 'canine'
                        ? '🐶 犬科 Canine'
                        : species === 'feline'
                        ? '🐱 貓科 Feline'
                        : '🐴 馬科 Equine'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preset Poses Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">動態姿態預設 (Pose Presets)</label>
              <select
                value={Object.keys(PRESET_POSES).find((k) => PRESET_POSES[k].presetName === config.pose.presetName) || ''}
                onChange={(e) => applyPresetPose(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(PRESET_POSES).map(([key, pose]) => (
                  <option key={key} value={key}>
                    {pose.presetName}
                  </option>
                ))}
              </select>
            </div>

            {/* Joint Slider List */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-medium text-slate-300">微調關節旋轉 (Joint Rotations)</label>
              {Object.keys(config.pose.joints).length === 0 ? (
                <p className="text-xs text-slate-500">目前模型無可調關節數據</p>
              ) : (
                Object.entries(config.pose.joints).map(([jointName, rot]) => {
                  const isSelected = config.selectedJoint === jointName;
                  const limits = JOINT_LIMITS[jointName];
                  const rangeForAxis = (axis: 'x' | 'y' | 'z') => {
                    if (!limits) return { min: -2.5, max: 2.5 };
                    const min = limits[`min${axis.toUpperCase()}` as keyof typeof limits];
                    const max = limits[`max${axis.toUpperCase()}` as keyof typeof limits];
                    return { min, max };
                  };
                  const xRange = rangeForAxis('x');
                  const yRange = rangeForAxis('y');
                  const zRange = rangeForAxis('z');
                  return (
                    <div
                      key={jointName}
                      onClick={() => onChangeConfig({ ...config, selectedJoint: jointName })}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-semibold capitalize ${isSelected ? 'text-cyan-300 font-bold' : 'text-emerald-400'}`}>
                          {jointName}
                        </span>
                        {isSelected && <span className="text-[10px] text-cyan-400 font-mono">SELECTED</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <span className="text-slate-400">X: {rot.x.toFixed(1)}</span>
                          <input
                            type="range"
                            min={xRange.min}
                            max={xRange.max}
                            step="0.1"
                            value={rot.x}
                            onChange={(e) => updateJointRotation(jointName, 'x', parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400">Y: {rot.y.toFixed(1)}</span>
                          <input
                            type="range"
                            min={yRange.min}
                            max={yRange.max}
                            step="0.1"
                            value={rot.y}
                            onChange={(e) => updateJointRotation(jointName, 'y', parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400">Z: {rot.z.toFixed(1)}</span>
                          <input
                            type="range"
                            min={zRange.min}
                            max={zRange.max}
                            step="0.1"
                            value={rot.z}
                            onChange={(e) => updateJointRotation(jointName, 'z', parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: 3D AI & 素材 */}
        {activeTab === 'material' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              3D 模型與開源素材匯入
            </h3>

            {/* 3D Model Upload Box */}
            <div className="border-2 border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 rounded-xl p-4 text-center cursor-pointer transition-all">
              <input
                type="file"
                accept=".gltf,.glb,.obj"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0] && onUpload3DModel) {
                    onUpload3DModel(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="model-3d-upload-input"
              />
              <label htmlFor="model-3d-upload-input" className="cursor-pointer block">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-200">匯入 3D 人體 / 模型素材</p>
                <p className="text-[10px] text-slate-400 mt-1">支援 Blender / Sketchfab 匯出之 .gltf / .glb / .obj 檔</p>
              </label>
            </div>

            {/* Drag & Drop Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-900/50 hover:bg-slate-900 rounded-xl p-4 text-center cursor-pointer transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUploadImage(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-medium text-slate-200">拖曳或點擊上傳素材圖片</p>
                <p className="text-[10px] text-slate-500 mt-1">支援 PNG / JPG (建議去背或單一背景)</p>
              </label>
            </div>

            {/* Uploads Preset Images Gallery */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  uploads/ 內含素材藝廊 (點擊切換 3D 姿態)
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">4 張圖片</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '160801453526.jpg', url: '/uploads/160801453526.jpg', label: '雙臂護面防守姿態' },
                  { name: 'full (1).jpeg', url: '/uploads/full (1).jpeg', label: '馬步大張腿姿態' },
                  { name: 'full.jpeg', url: '/uploads/full.jpeg', label: '高舉臂交叉腿姿態' },
                  { name: 'images.jpeg', url: '/uploads/images.jpeg', label: '右臂高舉直立姿態' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onSelectImageFromUrl && onSelectImageFromUrl(item.url, item.name)}
                    className={`p-2 rounded-xl border text-left transition-all group flex flex-col items-center gap-1.5 ${
                      config.reference.fileName === item.name
                        ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="w-full">
                      <div className="text-[10px] font-bold text-slate-200 truncate">{item.name}</div>
                      <div className="text-[9px] text-cyan-400 font-medium truncate">{item.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image Preview */}
            {config.reference.src && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[160px]">
                    {config.reference.fileName || '已載入 2D 參考圖'}
                  </span>
                </div>

                <button
                  onClick={onTrigger3DConversion}
                  disabled={config.reference.isConverting}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  {config.reference.isConverting ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI 人物肢體姿態辨識中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> AI 2D 姿態辨識與自動對齊 3D 人偶
                    </span>
                  )}
                </button>

                <div className="h-28 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img src={config.reference.src} alt="Uploaded preview" className="max-h-full object-contain" />
                </div>

                {/* Progress bar */}
                {config.reference.isConverting && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>本機 TripoSR 模型推論中</span>
                      <span>{config.reference.conversionProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-300"
                        style={{ width: `${config.reference.conversionProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Overlay Toggle & Opacity Slider */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {config.reference.showOverlay ? (
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      與 3D 繪圖疊加比對
                    </span>
                    <input
                      type="checkbox"
                      checked={config.reference.showOverlay}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          reference: { ...config.reference, showOverlay: e.target.checked },
                        })
                      }
                      className="accent-cyan-500"
                    />
                  </div>

                  {config.reference.showOverlay && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>疊加不透明度</span>
                        <span>{Math.round(config.reference.overlayOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.reference.overlayOpacity}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            reference: { ...config.reference, overlayOpacity: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Render Mode Settings */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                3D 質感與線稿模式
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['solid', 'wireframe', 'flat', 'normals'] as RenderMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeConfig({ ...config, renderMode: mode })}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border capitalize transition-all ${
                      config.renderMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {mode === 'solid'
                      ? 'Solid 實體光影'
                      : mode === 'wireframe'
                      ? 'Wireframe 結構線'
                      : mode === 'flat'
                      ? 'Flat 切面透視'
                      : 'Normals 法線透視'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: 相機透視 */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-400" />
              焦距 (FOV) 與透視變形
            </h3>

            {/* FOV Slider */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-200 font-medium">
                <span>相機廣角 / 焦距 (FOV)</span>
                <span className="text-cyan-400 font-mono">{config.camera.fov}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="110"
                step="1"
                value={config.camera.fov}
                onChange={(e) => updateCamera('fov', parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>15mm (超廣角透視)</span>
                <span>50mm (標準)</span>
                <span>110mm (長焦平視)</span>
              </div>
            </div>

            {/* Quick Angle Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">視角預設 (Preset Angles)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['front', 'side', 'three_quarter', 'top', 'bottom'] as CameraPreset[]).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => updateCamera('presetAngle', angle)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border capitalize transition-all ${
                      config.camera.presetAngle === angle
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {angle === 'front'
                      ? '正面 Front'
                      : angle === 'side'
                      ? '正側 Side'
                      : angle === 'three_quarter'
                      ? '3/4 側臉'
                      : angle === 'top'
                      ? '俯視 Top'
                      : '仰角 Bottom'}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid & Axes Toggle */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>顯示透視地平面網格 (Grid)</span>
                <input
                  type="checkbox"
                  checked={config.camera.showGrid}
                  onChange={(e) => updateCamera('showGrid', e.target.checked)}
                  className="accent-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>顯示 XYZ 座標軸 (Axes)</span>
                <input
                  type="checkbox"
                  checked={config.camera.showAxes}
                  onChange={(e) => updateCamera('showAxes', e.target.checked)}
                  className="accent-indigo-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB: 三點打光 */}
        {activeTab === 'lighting' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              繪圖三點打光攝影棚
            </h3>

            {/* Key Light */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">主光 (Key Light)</span>
                <input
                  type="color"
                  value={config.lighting.keyLight.color}
                  onChange={(e) => updateLighting('keyLight', 'color', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>光線強度</span>
                  <span>{config.lighting.keyLight.intensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={config.lighting.keyLight.intensity}
                  onChange={(e) => updateLighting('keyLight', 'intensity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>水平打光角度</span>
                  <span>{Math.round((config.lighting.keyLight.angleY * 180) / Math.PI)}°</span>
                </div>
                <input
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step="0.1"
                  value={config.lighting.keyLight.angleY}
                  onChange={(e) => updateLighting('keyLight', 'angleY', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Fill Light */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">輔光 / 陰影填充 (Fill Light)</span>
                <input
                  type="color"
                  value={config.lighting.fillLight.color}
                  onChange={(e) => updateLighting('fillLight', 'color', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>光線強度</span>
                  <span>{config.lighting.fillLight.intensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={config.lighting.fillLight.intensity}
                  onChange={(e) => updateLighting('fillLight', 'intensity', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Rim Light */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-300">輪廓背光 (Rim Light)</span>
                <input
                  type="color"
                  value={config.lighting.rimLight.color}
                  onChange={(e) => updateLighting('rimLight', 'color', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>輪廓光強度</span>
                  <span>{config.lighting.rimLight.intensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={config.lighting.rimLight.intensity}
                  onChange={(e) => updateLighting('rimLight', 'intensity', parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
