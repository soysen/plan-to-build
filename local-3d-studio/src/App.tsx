import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { ControlPanel } from './components/ControlPanel';
import { ModelType, StudioConfig } from './types/studio';
import { PRESET_POSES } from './utils/3d-generators';
import { captureStudioSnapshot, downloadOBJFile } from './utils/exporter';

export const INITIAL_CONFIG: StudioConfig = {
  modelType: 'humanoid_male',
  quadrupedSpecies: 'canine',
  renderMode: 'solid',
  camera: {
    fov: 45,
    presetAngle: 'three_quarter',
    showGrid: true,
    showAxes: true,
  },
  lighting: {
    keyLight: {
      enabled: true,
      color: '#ffffff',
      intensity: 1.2,
      angleX: 0.8,
      angleY: 0.5,
      castShadow: true,
    },
    fillLight: {
      enabled: true,
      color: '#93c5fd',
      intensity: 0.6,
      angleX: 0.3,
      angleY: -1.2,
    },
    rimLight: {
      enabled: true,
      color: '#f472b6',
      intensity: 0.9,
      angleX: 0.5,
      angleY: 2.5,
    },
    ambientLight: {
      color: '#334155',
      intensity: 0.4,
    },
  },
  pose: {
    presetName: PRESET_POSES.t_pose.presetName,
    leftHandGesture: 'relaxed',
    rightHandGesture: 'relaxed',
    joints: { ...PRESET_POSES.t_pose.joints },
  },
  reference: {
    src: null,
    fileName: null,
    overlayOpacity: 0.5,
    showOverlay: false,
    isConverting: false,
    conversionProgress: 0,
    converted3DMeshUrl: null,
    removedBackgroundSrc: null,
  },
  selectedJoint: null,
};

export function App() {
  const [config, setConfig] = useState<StudioConfig>(INITIAL_CONFIG);

  // 3D Scene references for snapshot & export
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentGroupRef = useRef<THREE.Group | null>(null);

  const handleModelTypeChange = (type: ModelType) => {
    let newPose = INITIAL_CONFIG.pose;
    if (type === 'quadruped') {
      newPose = {
        presetName: PRESET_POSES.quadruped_stand.presetName,
        leftHandGesture: 'relaxed',
        rightHandGesture: 'relaxed',
        joints: { ...PRESET_POSES.quadruped_stand.joints },
      };
    }

    setConfig((prev) => ({
      ...prev,
      modelType: type,
      pose: newPose,
      selectedJoint: null,
    }));
  };

  const handleSelectJoint = (jointName: string | null) => {
    setConfig((prev) => ({
      ...prev,
      selectedJoint: jointName,
    }));
  };

  const handleJointRotate = (jointName: string, axis: 'x' | 'y' | 'z', delta: number) => {
    setConfig((prev) => {
      const currentRot = prev.pose.joints[jointName] || { x: 0, y: 0, z: 0 };
      return {
        ...prev,
        pose: {
          ...prev.pose,
          joints: {
            ...prev.pose.joints,
            [jointName]: {
              ...currentRot,
              [axis]: currentRot[axis] + delta,
            },
          },
        },
      };
    });
  };

  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setConfig((prev) => ({
          ...prev,
          reference: {
            ...prev.reference,
            src: e.target?.result as string,
            fileName: file.name,
            showOverlay: true,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTrigger3DConversion = () => {
    if (!config.reference.src) return;

    setConfig((prev) => ({
      ...prev,
      reference: {
        ...prev.reference,
        isConverting: true,
        conversionProgress: 10,
      },
    }));

    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setConfig((prev) => ({
          ...prev,
          modelType: 'custom_upload',
          selectedJoint: 'custom_upload',
          reference: {
            ...prev.reference,
            isConverting: false,
            conversionProgress: 100,
          },
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          reference: {
            ...prev.reference,
            conversionProgress: progress,
          },
        }));
      }
    }, 250);
  };

  const handleTakeSnapshot = () => {
    if (rendererRef.current) {
      captureStudioSnapshot(rendererRef.current, `Studio_Pose_${Date.now()}.png`);
    }
  };

  const handleExportOBJ = () => {
    if (currentGroupRef.current) {
      downloadOBJFile(currentGroupRef.current, `Studio_Model_${Date.now()}.obj`);
    }
  };

  const handleResetAll = () => {
    setConfig(INITIAL_CONFIG);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Header */}
      <Header
        config={config}
        onChangeModelType={handleModelTypeChange}
        onTakeSnapshot={handleTakeSnapshot}
        onExportOBJ={handleExportOBJ}
        onResetAll={handleResetAll}
      />

      {/* Main Studio View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D Viewport */}
        <main className="flex-1 h-full relative">
          <Viewport3D
            config={config}
            onSelectJoint={handleSelectJoint}
            onJointRotate={handleJointRotate}
            onRendererReady={(renderer, _scene, _camera, group) => {
              rendererRef.current = renderer;
              currentGroupRef.current = group;
            }}
          />
        </main>

        {/* Sidebar Controls */}
        <ControlPanel
          config={config}
          onChangeConfig={setConfig}
          onUploadImage={handleUploadImage}
          onTrigger3DConversion={handleTrigger3DConversion}
        />
      </div>
    </div>
  );
}

export default App;
