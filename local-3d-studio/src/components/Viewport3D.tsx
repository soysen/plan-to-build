import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StudioConfig } from '../types/studio';
import {
  buildHumanoidMannequin,
  buildQuadrupedMannequin,
  buildReliefMeshFromImage,
  getMaterialForMode,
} from '../utils/3d-generators';

interface Viewport3DProps {
  config: StudioConfig;
  onSelectJoint?: (jointName: string | null) => void;
  onJointRotate?: (jointName: string, axis: 'x' | 'y' | 'z', delta: number) => void;
  onRendererReady?: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    currentGroup: THREE.Group
  ) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  config,
  onSelectJoint,
  onJointRotate,
  onRendererReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentGroupRef = useRef<THREE.Group | null>(null);

  // Lighting refs
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Helpers & Selection Gizmo
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);

  // Hover & Active Tooltip
  const [hoveredJoint, setHoveredJoint] = useState<string | null>(null);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const isGizmoDraggingRef = useRef(false);
  const activeGizmoAxisRef = useRef<'x' | 'y' | 'z' | null>(null);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({
    spherical: new THREE.Spherical(4.5, Math.PI / 3, Math.PI / 4),
    target: new THREE.Vector3(0, 0.85, 0),
  });

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(config.camera.fov, width / height, 0.1, 100);
    const spherical = cameraAngleRef.current.spherical;
    const target = cameraAngleRef.current.target;
    camera.position.setFromSpherical(spherical).add(target);
    camera.lookAt(target);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Grid & Axes
    const grid = new THREE.GridHelper(10, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);
    axesHelperRef.current = axes;

    // Selection 3D Gizmo Group
    const gizmoGroup = new THREE.Group();
    gizmoGroup.name = 'interactive_gizmo';
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 3D Rotation Gizmo when selectedJoint changes
  useEffect(() => {
    if (!gizmoGroupRef.current || !currentGroupRef.current) return;

    const gizmo = gizmoGroupRef.current;
    gizmo.clear();

    if (!config.selectedJoint) return;

    // Find world position of selected joint
    let targetObj: THREE.Object3D | null = null;
    currentGroupRef.current.traverse((child) => {
      if (child.name === config.selectedJoint || child.userData.jointName === config.selectedJoint) {
        targetObj = child;
      }
    });

    if (targetObj) {
      const worldPos = new THREE.Vector3();
      (targetObj as THREE.Object3D).getWorldPosition(worldPos);
      gizmo.position.copy(worldPos);

      const radius = 0.3;
      const tube = 0.015;

      const xRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      xRing.rotation.y = Math.PI / 2;
      xRing.userData = { isGizmoRing: true, axis: 'x' };
      gizmo.add(xRing);

      const yRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      yRing.rotation.x = Math.PI / 2;
      yRing.userData = { isGizmoRing: true, axis: 'y' };
      gizmo.add(yRing);

      const zRing = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
      );
      zRing.userData = { isGizmoRing: true, axis: 'z' };
      gizmo.add(zRing);
    }
  }, [config.selectedJoint, config.pose]);

  // Sync Camera Presets & FOV
  useEffect(() => {
    if (!cameraRef.current) return;

    const cam = cameraRef.current;
    cam.fov = config.camera.fov;
    cam.updateProjectionMatrix();

    if (config.camera.presetAngle !== 'custom') {
      const target = cameraAngleRef.current.target;
      let radius = cameraAngleRef.current.spherical.radius;
      if (radius < 1) radius = 4.5;

      let phi = Math.PI / 3;
      let theta = 0;

      switch (config.camera.presetAngle) {
        case 'front':
          phi = Math.PI / 2;
          theta = 0;
          break;
        case 'side':
          phi = Math.PI / 2;
          theta = Math.PI / 2;
          break;
        case 'three_quarter':
          phi = Math.PI / 3;
          theta = Math.PI / 4;
          break;
        case 'top':
          phi = 0.05;
          theta = 0;
          break;
        case 'bottom':
          phi = Math.PI - 0.1;
          theta = 0;
          break;
      }

      cameraAngleRef.current.spherical.set(radius, phi, theta);
      cam.position.setFromSpherical(cameraAngleRef.current.spherical).add(target);
      cam.lookAt(target);
    }

    if (gridHelperRef.current) gridHelperRef.current.visible = config.camera.showGrid;
    if (axesHelperRef.current) axesHelperRef.current.visible = config.camera.showAxes;
  }, [config.camera]);

  // Sync Lights
  useEffect(() => {
    const l = config.lighting;

    if (ambientLightRef.current) {
      ambientLightRef.current.color.set(l.ambientLight.color);
      ambientLightRef.current.intensity = l.ambientLight.intensity;
    }

    if (keyLightRef.current) {
      keyLightRef.current.visible = l.keyLight.enabled;
      keyLightRef.current.color.set(l.keyLight.color);
      keyLightRef.current.intensity = l.keyLight.intensity;
      const radius = 6;
      keyLightRef.current.position.set(
        radius * Math.sin(l.keyLight.angleY) * Math.cos(l.keyLight.angleX),
        radius * Math.sin(l.keyLight.angleX) + 3,
        radius * Math.cos(l.keyLight.angleY) * Math.cos(l.keyLight.angleX)
      );
    }

    if (fillLightRef.current) {
      fillLightRef.current.visible = l.fillLight.enabled;
      fillLightRef.current.color.set(l.fillLight.color);
      fillLightRef.current.intensity = l.fillLight.intensity;
      const radius = 6;
      fillLightRef.current.position.set(
        radius * Math.sin(l.fillLight.angleY) * Math.cos(l.fillLight.angleX),
        radius * Math.sin(l.fillLight.angleX) + 2,
        radius * Math.cos(l.fillLight.angleY) * Math.cos(l.fillLight.angleX)
      );
    }

    if (rimLightRef.current) {
      rimLightRef.current.visible = l.rimLight.enabled;
      rimLightRef.current.color.set(l.rimLight.color);
      rimLightRef.current.intensity = l.rimLight.intensity;
      const radius = 6;
      rimLightRef.current.position.set(
        radius * Math.sin(l.rimLight.angleY) * Math.cos(l.rimLight.angleX),
        radius * Math.sin(l.rimLight.angleX) + 2,
        radius * Math.cos(l.rimLight.angleY) * Math.cos(l.rimLight.angleX)
      );
    }
  }, [config.lighting]);

  // Rebuild 3D Model when ModelType, Pose, RenderMode, Species, or Custom Image changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (currentGroupRef.current) {
      sceneRef.current.remove(currentGroupRef.current);
    }

    let newGroup = new THREE.Group();

    if (config.modelType === 'humanoid_male') {
      newGroup = buildHumanoidMannequin('male', config.pose, config.renderMode, config.selectedJoint);
    } else if (config.modelType === 'humanoid_female') {
      newGroup = buildHumanoidMannequin('female', config.pose, config.renderMode, config.selectedJoint);
    } else if (config.modelType === 'quadruped') {
      newGroup = buildQuadrupedMannequin(
        config.pose,
        config.renderMode,
        config.quadrupedSpecies,
        config.selectedJoint
      );
    } else if (config.modelType === 'prop_box') {
      const mat = getMaterialForMode(config.renderMode, 0xf59e0b, config.selectedJoint === 'prop_box');
      const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat);
      cubeMesh.position.y = 0.4;
      cubeMesh.userData = { jointName: 'prop_box', isJointPart: true };
      newGroup.add(cubeMesh);
    } else if (config.modelType === 'custom_upload' && config.reference.src) {
      buildReliefMeshFromImage(config.reference.src, config.renderMode).then((reliefGroup) => {
        if (currentGroupRef.current && sceneRef.current) {
          sceneRef.current.remove(currentGroupRef.current);
        }
        sceneRef.current?.add(reliefGroup);
        currentGroupRef.current = reliefGroup;
        if (rendererRef.current && sceneRef.current && cameraRef.current && onRendererReady) {
          onRendererReady(rendererRef.current, sceneRef.current, cameraRef.current, reliefGroup);
        }
      });
      return;
    }

    sceneRef.current.add(newGroup);
    currentGroupRef.current = newGroup;

    if (rendererRef.current && sceneRef.current && cameraRef.current && onRendererReady) {
      onRendererReady(rendererRef.current, sceneRef.current, cameraRef.current, newGroup);
    }
  }, [config.modelType, config.quadrupedSpecies, config.pose, config.renderMode, config.selectedJoint, config.reference.src]);

  // Raycasting Helper
  const raycastFromMouse = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return null;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    return raycaster;
  };

  // Mouse Down for Raycast Selection & Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    const raycaster = raycastFromMouse(e);
    if (!raycaster) return;

    // 1. Check Gizmo ring intersection first
    if (gizmoGroupRef.current && config.selectedJoint) {
      const gizmoIntersects = raycaster.intersectObjects(gizmoGroupRef.current.children, true);
      if (gizmoIntersects.length > 0) {
        const ringObj = gizmoIntersects[0].object;
        if (ringObj.userData.isGizmoRing) {
          isGizmoDraggingRef.current = true;
          activeGizmoAxisRef.current = ringObj.userData.axis;
          return;
        }
      }
    }

    // 2. Check 3D Body Joint selection
    if (currentGroupRef.current && e.button === 0) {
      const bodyIntersects = raycaster.intersectObjects(currentGroupRef.current.children, true);
      if (bodyIntersects.length > 0) {
        let foundJoint: string | null = null;
        for (const hit of bodyIntersects) {
          if (hit.object.userData && hit.object.userData.jointName) {
            foundJoint = hit.object.userData.jointName;
            break;
          }
        }
        if (foundJoint) {
          if (onSelectJoint) onSelectJoint(foundJoint);
          isDraggingRef.current = true;
          return;
        }
      }
    }

    // 3. Fallback Camera Orbit Controls
    if (e.button === 0) isDraggingRef.current = true;
    if (e.button === 2) isRightDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Hover Raycasting for Tooltip
    if (!isDraggingRef.current && !isGizmoDraggingRef.current) {
      const raycaster = raycastFromMouse(e);
      if (raycaster && currentGroupRef.current) {
        const bodyHits = raycaster.intersectObjects(currentGroupRef.current.children, true);
        if (bodyHits.length > 0 && bodyHits[0].object.userData.jointName) {
          setHoveredJoint(bodyHits[0].object.userData.jointName);
        } else {
          setHoveredJoint(null);
        }
      }
    }

    // Dragging 3D Gizmo Rings directly rotates the selected joint in real time!
    if (isGizmoDraggingRef.current && activeGizmoAxisRef.current && config.selectedJoint && onJointRotate) {
      const rotateSpeed = 0.03;
      const delta = (deltaX + deltaY) * rotateSpeed;
      onJointRotate(config.selectedJoint, activeGizmoAxisRef.current, delta);
      return;
    }

    if (!cameraRef.current) return;

    if (isDraggingRef.current) {
      const s = cameraAngleRef.current.spherical;
      s.theta -= deltaX * 0.005;
      s.phi -= deltaY * 0.005;
      s.phi = Math.max(0.01, Math.min(Math.PI - 0.01, s.phi));

      const target = cameraAngleRef.current.target;
      cameraRef.current.position.setFromSpherical(s).add(target);
      cameraRef.current.lookAt(target);
    } else if (isRightDraggingRef.current) {
      const target = cameraAngleRef.current.target;
      const panSpeed = 0.003;
      target.x -= deltaX * panSpeed;
      target.y += deltaY * panSpeed;

      const s = cameraAngleRef.current.spherical;
      cameraRef.current.position.setFromSpherical(s).add(target);
      cameraRef.current.lookAt(target);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
    isGizmoDraggingRef.current = false;
    activeGizmoAxisRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const s = cameraAngleRef.current.spherical;
    const zoomFactor = e.deltaY * 0.003;
    s.radius = Math.max(0.8, Math.min(15, s.radius + zoomFactor));

    const target = cameraAngleRef.current.target;
    cameraRef.current.position.setFromSpherical(s).add(target);
    cameraRef.current.lookAt(target);
  };

  return (
    <div className="relative w-full h-full overflow-hidden studio-glow select-none">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Reference Image Overlay Mode */}
      {config.reference.showOverlay && config.reference.src && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: config.reference.overlayOpacity }}
        >
          <img
            src={config.reference.src}
            alt="Reference Overlay"
            className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
          />
        </div>
      )}

      {/* Hovered / Selected Joint Floating Tooltip */}
      <div className="absolute top-4 left-4 glass-panel-light px-3.5 py-2 rounded-xl text-xs font-mono text-slate-200 pointer-events-none flex items-center gap-3 border border-slate-700/60 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span>視角 FOV: {config.camera.fov}°</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 capitalize">{config.renderMode}</span>
          </div>
          {hoveredJoint && (
            <div className="text-[11px] text-pink-400 mt-0.5 animate-pulse font-sans">
              ✨ 點擊選擇關節: <span className="font-bold capitalize">{hoveredJoint}</span>
            </div>
          )}
          {config.selectedJoint && (
            <div className="text-[11px] text-emerald-400 mt-0.5 font-sans font-medium">
              🎯 當前已選中: <span className="font-bold capitalize">{config.selectedJoint}</span> (拖曳 3D 旋轉環可即時擺姿)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
