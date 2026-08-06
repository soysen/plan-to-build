import * as THREE from 'three';
import { HandGesture, ModelType, PoseState, QuadrupedSpecies, RenderMode } from '../types/studio';

export const PRESET_POSES: Record<string, PoseState> = {
  t_pose: {
    presetName: 'T-Pose (標準解剖站姿)',
    leftHandGesture: 'relaxed',
    rightHandGesture: 'relaxed',
    joints: {
      head: { x: 0, y: 0, z: 0 },
      neck: { x: 0, y: 0, z: 0 },
      spine: { x: 0, y: 0, z: 0 },
      leftShoulder: { x: 0, y: 0, z: 0 },
      leftElbow: { x: 0, y: 0, z: 0 },
      rightShoulder: { x: 0, y: 0, z: 0 },
      rightElbow: { x: 0, y: 0, z: 0 },
      leftHip: { x: 0, y: 0, z: 0 },
      leftKnee: { x: 0, y: 0, z: 0 },
      rightHip: { x: 0, y: 0, z: 0 },
      rightKnee: { x: 0, y: 0, z: 0 },
    },
  },
  running: {
    presetName: 'Running (動態跑步)',
    leftHandGesture: 'fist',
    rightHandGesture: 'fist',
    joints: {
      head: { x: 0.1, y: 0, z: 0 },
      neck: { x: 0.15, y: 0, z: 0 },
      spine: { x: 0.25, y: 0, z: 0 },
      leftShoulder: { x: 0.9, y: -0.1, z: -0.3 },
      leftElbow: { x: 0.7, y: 0, z: 0 },
      rightShoulder: { x: -0.9, y: 0.1, z: 0.3 },
      rightElbow: { x: 1.3, y: 0, z: 0 },
      leftHip: { x: -0.7, y: -0.1, z: 0 },
      leftKnee: { x: 0.4, y: 0, z: 0 },
      rightHip: { x: 0.8, y: 0.1, z: 0 },
      rightKnee: { x: 1.1, y: 0, z: 0 },
    },
  },
  sitting: {
    presetName: 'Sitting (繪圖坐姿)',
    leftHandGesture: 'relaxed',
    rightHandGesture: 'open_palm',
    joints: {
      head: { x: -0.1, y: 0, z: 0 },
      neck: { x: 0, y: 0, z: 0 },
      spine: { x: 0.15, y: 0, z: 0 },
      leftShoulder: { x: 0.3, y: -0.1, z: -0.2 },
      leftElbow: { x: 0.6, y: 0, z: 0 },
      rightShoulder: { x: 0.3, y: 0.1, z: 0.2 },
      rightElbow: { x: 0.6, y: 0, z: 0 },
      leftHip: { x: 1.45, y: -0.15, z: 0 },
      leftKnee: { x: -1.35, y: 0, z: 0 },
      rightHip: { x: 1.45, y: 0.15, z: 0 },
      rightKnee: { x: -1.35, y: 0, z: 0 },
    },
  },
  action: {
    presetName: 'Action (動漫張力姿態)',
    leftHandGesture: 'holding',
    rightHandGesture: 'pointing',
    joints: {
      head: { x: 0.1, y: -0.4, z: 0 },
      neck: { x: 0.1, y: -0.3, z: 0 },
      spine: { x: 0.25, y: -0.3, z: 0.15 },
      leftShoulder: { x: 0.6, y: -0.6, z: -0.4 },
      leftElbow: { x: 0.9, y: 0, z: 0 },
      rightShoulder: { x: -1.4, y: 0.4, z: 0.6 },
      rightElbow: { x: 1.6, y: 0, z: 0 },
      leftHip: { x: -0.5, y: -0.3, z: -0.3 },
      leftKnee: { x: 0.7, y: 0, z: 0 },
      rightHip: { x: 0.6, y: 0.3, z: 0.4 },
      rightKnee: { x: 0.9, y: 0, z: 0 },
    },
  },
  quadruped_stand: {
    presetName: 'Quadruped Stand (四足自然解剖站姿)',
    leftHandGesture: 'relaxed',
    rightHandGesture: 'relaxed',
    joints: {
      head: { x: -0.15, y: 0, z: 0 },
      neck: { x: 0.25, y: 0, z: 0 },
      spine: { x: 0, y: 0, z: 0 },
      frontLeftLeg: { x: -0.1, y: 0, z: 0 },
      frontLeftElbow: { x: 0.15, y: 0, z: 0 },
      frontRightLeg: { x: 0.1, y: 0, z: 0 },
      frontRightElbow: { x: -0.15, y: 0, z: 0 },
      backLeftLeg: { x: -0.2, y: 0, z: 0 },
      backLeftHock: { x: 0.3, y: 0, z: 0 },
      backRightLeg: { x: 0.2, y: 0, z: 0 },
      backRightHock: { x: -0.3, y: 0, z: 0 },
      tail: { x: -0.4, y: 0, z: 0 },
    },
  },
  quadruped_prowl: {
    presetName: 'Quadruped Prowl (獵豹/戰鬥潛伏動態)',
    leftHandGesture: 'relaxed',
    rightHandGesture: 'relaxed',
    joints: {
      head: { x: 0.25, y: 0.25, z: 0 },
      neck: { x: -0.2, y: 0.1, z: 0 },
      spine: { x: 0.15, y: 0, z: 0 },
      frontLeftLeg: { x: -0.6, y: 0, z: 0 },
      frontLeftElbow: { x: 0.8, y: 0, z: 0 },
      frontRightLeg: { x: 0.7, y: 0, z: 0 },
      frontRightElbow: { x: -0.5, y: 0, z: 0 },
      backLeftLeg: { x: 0.8, y: 0, z: 0 },
      backLeftHock: { x: -0.6, y: 0, z: 0 },
      backRightLeg: { x: -0.5, y: 0, z: 0 },
      backRightHock: { x: 0.7, y: 0, z: 0 },
      tail: { x: 0.5, y: 0.3, z: 0 },
    },
  },
};

export function getMaterialForMode(
  mode: RenderMode,
  colorHex: number = 0x818cf8,
  isSelected: boolean = false
): THREE.Material {
  const displayColor = isSelected ? 0x06b6d4 : colorHex;

  switch (mode) {
    case 'wireframe':
      return new THREE.MeshBasicMaterial({ color: isSelected ? 0xec4899 : 0x06b6d4, wireframe: true });
    case 'flat':
      return new THREE.MeshLambertMaterial({ color: displayColor, flatShading: true });
    case 'normals':
      return new THREE.MeshNormalMaterial();
    case 'solid':
    default:
      return new THREE.MeshStandardMaterial({
        color: displayColor,
        roughness: 0.3,
        metalness: 0.1,
      });
  }
}

/**
 * Creates a Smooth Organic Lathe Geometry with Anatomical Muscle Bulge
 */
export function createOrganicMuscleCylinder(
  rTop: number,
  rMid: number,
  rBottom: number,
  height: number,
  segments: number = 24
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = (t - 0.5) * height;
    const r = (1 - t) * (1 - t) * rBottom + 2 * (1 - t) * t * rMid + t * t * rTop;
    points.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(points, segments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an Articulated Organic Hand with THUMB ON THE MEDIAL INBOARD SIDE
 */
export function createArticulatedHand(
  gesture: HandGesture,
  isLeft: boolean,
  mode: RenderMode,
  colorHex: number,
  jointName: string,
  isSelected: boolean
): THREE.Group {
  const handGroup = new THREE.Group();
  handGroup.name = jointName;

  const mat = getMaterialForMode(mode, colorHex, isSelected);
  const detailMat = getMaterialForMode(mode, 0x38bdf8, isSelected);

  const palmGeo = new THREE.SphereGeometry(0.055, 16, 16);
  palmGeo.scale(0.8, 1.1, 0.45);
  const palmMesh = new THREE.Mesh(palmGeo, mat);
  palmMesh.position.set(0, -0.055, 0);
  palmMesh.userData = { jointName, isJointPart: true };
  handGroup.add(palmMesh);

  const addFinger = (
    posX: number,
    posZ: number,
    len1: number,
    len2: number,
    curlAngle: number,
    spreadX: number = 0
  ) => {
    const fingerGroup = new THREE.Group();
    fingerGroup.position.set(posX, -0.11, posZ);
    fingerGroup.rotation.z = spreadX;
    fingerGroup.rotation.x = curlAngle;

    const p1Geo = createOrganicMuscleCylinder(0.01, 0.013, 0.011, len1, 12);
    const p1 = new THREE.Mesh(p1Geo, mat);
    p1.position.set(0, -len1 / 2, 0);
    p1.userData = { jointName, isJointPart: true };
    fingerGroup.add(p1);

    const p2Group = new THREE.Group();
    p2Group.position.set(0, -len1, 0);
    p2Group.rotation.x = curlAngle * 0.8;
    fingerGroup.add(p2Group);

    const p2Geo = createOrganicMuscleCylinder(0.007, 0.009, 0.008, len2, 12);
    const p2 = new THREE.Mesh(p2Geo, detailMat);
    p2.position.set(0, -len2 / 2, 0);
    p2.userData = { jointName, isJointPart: true };
    p2Group.add(p2);

    handGroup.add(fingerGroup);
  };

  let indexCurl = 0.2;
  let middleCurl = 0.25;
  let ringCurl = 0.3;
  let pinkyCurl = 0.35;
  let thumbCurl = 0.3;

  switch (gesture) {
    case 'open_palm':
      indexCurl = 0;
      middleCurl = 0;
      ringCurl = 0;
      pinkyCurl = 0;
      thumbCurl = 0.1;
      break;
    case 'fist':
      indexCurl = 1.4;
      middleCurl = 1.45;
      ringCurl = 1.5;
      pinkyCurl = 1.55;
      thumbCurl = 1.2;
      break;
    case 'pointing':
      indexCurl = 0;
      middleCurl = 1.4;
      ringCurl = 1.45;
      pinkyCurl = 1.5;
      thumbCurl = 1.1;
      break;
    case 'victory':
      indexCurl = 0;
      middleCurl = 0;
      ringCurl = 1.45;
      pinkyCurl = 1.5;
      thumbCurl = 1.2;
      break;
    case 'holding':
      indexCurl = 0.8;
      middleCurl = 0.85;
      ringCurl = 0.9;
      pinkyCurl = 0.95;
      thumbCurl = 0.7;
      break;
    case 'relaxed':
    default:
      indexCurl = 0.3;
      middleCurl = 0.35;
      ringCurl = 0.4;
      pinkyCurl = 0.45;
      thumbCurl = 0.3;
      break;
  }

  const flipMedial = isLeft ? 1 : -1;
  const thumbSpread = flipMedial * 0.5;

  addFinger(0.03 * flipMedial, 0.005, 0.045, 0.035, indexCurl, 0.05 * flipMedial);
  addFinger(0.01 * flipMedial, 0.008, 0.05, 0.038, middleCurl, 0);
  addFinger(-0.01 * flipMedial, 0.005, 0.045, 0.035, ringCurl, -0.04 * flipMedial);
  addFinger(-0.03 * flipMedial, 0, 0.038, 0.03, pinkyCurl, -0.08 * flipMedial);

  const thumbGroup = new THREE.Group();
  thumbGroup.position.set(0.045 * flipMedial, -0.03, 0.01);
  thumbGroup.rotation.z = thumbSpread;
  thumbGroup.rotation.x = thumbCurl;

  const t1Geo = createOrganicMuscleCylinder(0.011, 0.014, 0.012, 0.04, 12);
  const t1 = new THREE.Mesh(t1Geo, mat);
  t1.position.set(0, -0.02, 0);
  t1.userData = { jointName, isJointPart: true };
  thumbGroup.add(t1);

  handGroup.add(thumbGroup);

  return handGroup;
}

/**
 * Creates an Anatomical 5-Toe Foot Group
 */
export function createAnatomicalFoot(
  isLeft: boolean,
  mode: RenderMode,
  colorHex: number,
  jointName: string,
  isSelected: boolean
): THREE.Group {
  const footGroup = new THREE.Group();
  const mat = getMaterialForMode(mode, colorHex, isSelected);
  const detailMat = getMaterialForMode(mode, 0x38bdf8, isSelected);

  const tagMesh = (mesh: THREE.Mesh) => {
    mesh.userData = { jointName, isJointPart: true };
  };

  const footSoleGeo = new THREE.SphereGeometry(0.08, 16, 16);
  footSoleGeo.scale(0.7, 0.5, 1.4);
  const footSole = new THREE.Mesh(footSoleGeo, mat);
  footSole.position.set(0, -0.52, 0.07);
  tagMesh(footSole);
  footGroup.add(footSole);

  const flipMedial = isLeft ? 1 : -1;

  const addToe = (posX: number, radius: number, length: number) => {
    const toeGeo = new THREE.SphereGeometry(radius, 10, 10);
    toeGeo.scale(0.9, 0.8, 1.4);
    const toe = new THREE.Mesh(toeGeo, detailMat);
    toe.position.set(posX, -0.53, 0.18 + length / 2);
    tagMesh(toe);
    footGroup.add(toe);
  };

  addToe(0.035 * flipMedial, 0.014, 0.045);
  addToe(0.015 * flipMedial, 0.012, 0.04);
  addToe(-0.005 * flipMedial, 0.011, 0.038);
  addToe(-0.025 * flipMedial, 0.01, 0.035);
  addToe(-0.04 * flipMedial, 0.008, 0.03);

  return footGroup;
}

/**
 * Builds ORGANIC SMOOTH Sculpted Humanoid Mannequin Mesh (Referencing Classic Wooden Mannequin Proportions)
 */
export function buildHumanoidMannequin(
  gender: 'male' | 'female',
  pose: PoseState,
  mode: RenderMode,
  selectedJoint: string | null = null
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = gender === 'male' ? 'humanoid_male_root' : 'humanoid_female_root';

  const bodyColor = gender === 'male' ? 0x818cf8 : 0xf472b6;
  const jointColor = 0x38bdf8;

  const tagMesh = (mesh: THREE.Mesh, jointName: string) => {
    mesh.userData = { jointName, isJointPart: true };
  };

  // 1. Pelvis Shield (下髖部 - 參照經典木偶盾形胯骨)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.name = 'pelvis';
  pelvisGroup.position.set(0, 0.95, 0);
  rootGroup.add(pelvisGroup);

  const pelvisMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'pelvis');
  const pelvisWidth = gender === 'male' ? 0.98 : 1.15;
  const pelvisGeo = new THREE.SphereGeometry(0.18, 20, 20);
  pelvisGeo.scale(pelvisWidth, 0.68, 0.75);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, pelvisMat);
  tagMesh(pelvisMesh, 'pelvis');
  pelvisGroup.add(pelvisMesh);

  // 2. Spherical Waist Joint Ball (獨立腰部關節球 - 參照經典木偶腰部過渡)
  const waistGroup = new THREE.Group();
  waistGroup.position.set(0, 0.14, 0);
  pelvisGroup.add(waistGroup);

  const waistJointMat = getMaterialForMode(mode, jointColor, selectedJoint === 'spine');
  const waistSphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), waistJointMat);
  tagMesh(waistSphere, 'spine');
  waistGroup.add(waistSphere);

  // 3. Spine & Organic Torso / Chest (倒梯形胸廓與流線胸肌)
  const spineGroup = new THREE.Group();
  spineGroup.name = 'spine';
  spineGroup.position.set(0, 0.13, 0);
  waistGroup.add(spineGroup);

  const spineMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'spine');

  const waistR = gender === 'male' ? 0.16 : 0.14;
  const absGeo = createOrganicMuscleCylinder(waistR * 1.1, waistR * 0.95, waistR * 1.05, 0.22, 20);
  const absMesh = new THREE.Mesh(absGeo, spineMat);
  absMesh.position.set(0, 0.1, 0);
  tagMesh(absMesh, 'spine');
  spineGroup.add(absMesh);

  // Organic Chest & Pectoral Muscle Contour (參照木偶倒梯形上胸)
  const chestR = gender === 'male' ? 0.25 : 0.21;
  const chestGeo = new THREE.SphereGeometry(chestR, 24, 24);
  chestGeo.scale(gender === 'male' ? 1.05 : 0.95, 0.82, 0.68);
  const chestMesh = new THREE.Mesh(chestGeo, spineMat);
  chestMesh.position.set(0, 0.35, 0);
  tagMesh(chestMesh, 'spine');
  spineGroup.add(chestMesh);

  // Pectoral / Bust Bulges
  const pecGeo = new THREE.SphereGeometry(gender === 'male' ? 0.09 : 0.08, 14, 14);
  pecGeo.scale(1.2, 0.8, 0.5);

  const leftPec = new THREE.Mesh(pecGeo, spineMat);
  leftPec.position.set(-0.09, 0.33, 0.11);
  tagMesh(leftPec, 'spine');
  spineGroup.add(leftPec);

  const rightPec = new THREE.Mesh(pecGeo, spineMat);
  rightPec.position.set(0.09, 0.33, 0.11);
  tagMesh(rightPec, 'spine');
  spineGroup.add(rightPec);

  // 4. Organic Tapered Neck
  const neckGroup = new THREE.Group();
  neckGroup.name = 'neck';
  neckGroup.position.set(0, 0.55, 0);
  spineGroup.add(neckGroup);

  const neckMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'neck');
  const neckGeo = createOrganicMuscleCylinder(0.085, 0.095, 0.115, 0.2, 20);
  const neckMesh = new THREE.Mesh(neckGeo, neckMat);
  neckMesh.position.set(0, 0.1, 0);
  tagMesh(neckMesh, 'neck');
  neckGroup.add(neckMesh);

  // 5. Head with Facial Features (無面罩蛋頭比例 + 輕量五官標記)
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 0.2, 0);
  neckGroup.add(headGroup);

  const headMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'head');
  const featureMat = getMaterialForMode(mode, jointColor, selectedJoint === 'head');

  const skullMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), headMat);
  skullMesh.scale.set(0.92, 1.2, 0.98);
  skullMesh.position.set(0, 0.17, 0);
  tagMesh(skullMesh, 'head');
  headGroup.add(skullMesh);

  const browMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.07), featureMat);
  browMesh.position.set(0, 0.22, 0.12);
  tagMesh(browMesh, 'head');
  headGroup.add(browMesh);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), featureMat);
  leftEye.position.set(-0.06, 0.19, 0.14);
  tagMesh(leftEye, 'head');
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), featureMat);
  rightEye.position.set(0.06, 0.19, 0.14);
  tagMesh(rightEye, 'head');
  headGroup.add(rightEye);

  const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 8), featureMat);
  noseTip.rotation.x = -Math.PI / 4;
  noseTip.position.set(0, 0.13, 0.15);
  tagMesh(noseTip, 'head');
  headGroup.add(noseTip);

  const chinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.08), headMat);
  chinMesh.position.set(0, 0.05, 0.11);
  tagMesh(chinMesh, 'head');
  headGroup.add(chinMesh);

  // 6. Organic Arms & Joint Spheres (Model Left = -X, Right = +X, 參照經典木偶關節球)
  const shoulderX = gender === 'male' ? 0.28 : 0.24;

  // Left Arm (-X)
  const leftShoulderGroup = new THREE.Group();
  leftShoulderGroup.name = 'leftShoulder';
  leftShoulderGroup.position.set(-shoulderX, 0.44, 0);
  spineGroup.add(leftShoulderGroup);

  const lShoulderMat = getMaterialForMode(mode, jointColor, selectedJoint === 'leftShoulder');
  const lDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), lShoulderMat);
  tagMesh(lDeltoidMesh, 'leftShoulder');
  leftShoulderGroup.add(lDeltoidMesh);

  const lUpperArmMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'leftShoulder');
  const lUpperArmGeo = createOrganicMuscleCylinder(0.065, 0.08, 0.065, 0.36, 18);
  const lUpperArm = new THREE.Mesh(lUpperArmGeo, lUpperArmMat);
  lUpperArm.position.set(0, -0.2, 0);
  tagMesh(lUpperArm, 'leftShoulder');
  leftShoulderGroup.add(lUpperArm);

  const leftElbowGroup = new THREE.Group();
  leftElbowGroup.name = 'leftElbow';
  leftElbowGroup.position.set(0, -0.4, 0);
  leftShoulderGroup.add(leftElbowGroup);

  const lElbowMat = getMaterialForMode(mode, jointColor, selectedJoint === 'leftElbow');
  const lElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), lElbowMat);
  tagMesh(lElbowJoint, 'leftElbow');
  leftElbowGroup.add(lElbowJoint);

  const lForearmMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'leftElbow');
  const lForearmGeo = createOrganicMuscleCylinder(0.05, 0.07, 0.065, 0.36, 18);
  const lForearm = new THREE.Mesh(lForearmGeo, lForearmMat);
  lForearm.position.set(0, -0.2, 0);
  tagMesh(lForearm, 'leftElbow');
  leftElbowGroup.add(lForearm);

  const leftHandGroup = createArticulatedHand(
    pose.leftHandGesture || 'relaxed',
    true,
    mode,
    bodyColor,
    'leftElbow',
    selectedJoint === 'leftElbow'
  );
  leftHandGroup.position.set(0, -0.38, 0);
  leftElbowGroup.add(leftHandGroup);

  // Right Arm (+X)
  const rightShoulderGroup = new THREE.Group();
  rightShoulderGroup.name = 'rightShoulder';
  rightShoulderGroup.position.set(shoulderX, 0.44, 0);
  spineGroup.add(rightShoulderGroup);

  const rShoulderMat = getMaterialForMode(mode, jointColor, selectedJoint === 'rightShoulder');
  const rDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), rShoulderMat);
  tagMesh(rDeltoidMesh, 'rightShoulder');
  rightShoulderGroup.add(rDeltoidMesh);

  const rUpperArmMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'rightShoulder');
  const rUpperArmGeo = createOrganicMuscleCylinder(0.065, 0.08, 0.065, 0.36, 18);
  const rUpperArm = new THREE.Mesh(rUpperArmGeo, rUpperArmMat);
  rUpperArm.position.set(0, -0.2, 0);
  tagMesh(rUpperArm, 'rightShoulder');
  rightShoulderGroup.add(rUpperArm);

  const rightElbowGroup = new THREE.Group();
  rightElbowGroup.name = 'rightElbow';
  rightElbowGroup.position.set(0, -0.4, 0);
  rightShoulderGroup.add(rightElbowGroup);

  const rElbowMat = getMaterialForMode(mode, jointColor, selectedJoint === 'rightElbow');
  const rElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), rElbowMat);
  tagMesh(rElbowJoint, 'rightElbow');
  rightElbowGroup.add(rElbowJoint);

  const rForearmMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'rightElbow');
  const rForearmGeo = createOrganicMuscleCylinder(0.05, 0.07, 0.065, 0.36, 18);
  const rForearm = new THREE.Mesh(rForearmGeo, rForearmMat);
  rForearm.position.set(0, -0.2, 0);
  tagMesh(rForearm, 'rightElbow');
  rightElbowGroup.add(rForearm);

  const rightHandGroup = createArticulatedHand(
    pose.rightHandGesture || 'relaxed',
    false,
    mode,
    bodyColor,
    'rightElbow',
    selectedJoint === 'rightElbow'
  );
  rightHandGroup.position.set(0, -0.38, 0);
  rightElbowGroup.add(rightHandGroup);

  // 7. Organic Legs & Joint Spheres (Model Left = -0.13, Right = +0.13)
  const hipX = gender === 'male' ? 0.13 : 0.14;

  // Left Leg (-X)
  const leftHipGroup = new THREE.Group();
  leftHipGroup.name = 'leftHip';
  leftHipGroup.position.set(-hipX, -0.1, 0);
  pelvisGroup.add(leftHipGroup);

  const lHipMat = getMaterialForMode(mode, jointColor, selectedJoint === 'leftHip');
  const lHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), lHipMat);
  tagMesh(lHipJoint, 'leftHip');
  leftHipGroup.add(lHipJoint);

  const lThighMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'leftHip');
  const lThighGeo = createOrganicMuscleCylinder(0.075, 0.11, 0.09, 0.46, 18);
  const lThigh = new THREE.Mesh(lThighGeo, lThighMat);
  lThigh.position.set(0, -0.25, 0);
  tagMesh(lThigh, 'leftHip');
  leftHipGroup.add(lThigh);

  const leftKneeGroup = new THREE.Group();
  leftKneeGroup.name = 'leftKnee';
  leftKneeGroup.position.set(0, -0.5, 0);
  leftHipGroup.add(leftKneeGroup);

  const lKneeMat = getMaterialForMode(mode, jointColor, selectedJoint === 'leftKnee');
  const lKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), lKneeMat);
  tagMesh(lKneeJoint, 'leftKnee');
  leftKneeGroup.add(lKneeJoint);

  const lCalfMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'leftKnee');
  const lShinGeo = createOrganicMuscleCylinder(0.055, 0.08, 0.07, 0.46, 18);
  const lShin = new THREE.Mesh(lShinGeo, lCalfMat);
  lShin.position.set(0, -0.25, 0);
  tagMesh(lShin, 'leftKnee');
  leftKneeGroup.add(lShin);

  const lFootGroup = createAnatomicalFoot(true, mode, bodyColor, 'leftKnee', selectedJoint === 'leftKnee');
  leftKneeGroup.add(lFootGroup);

  // Right Leg (+X)
  const rightHipGroup = new THREE.Group();
  rightHipGroup.name = 'rightHip';
  rightHipGroup.position.set(hipX, -0.1, 0);
  pelvisGroup.add(rightHipGroup);

  const rHipMat = getMaterialForMode(mode, jointColor, selectedJoint === 'rightHip');
  const rHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), rHipMat);
  tagMesh(rHipJoint, 'rightHip');
  rightHipGroup.add(rHipJoint);

  const rThighMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'rightHip');
  const rThighGeo = createOrganicMuscleCylinder(0.075, 0.11, 0.09, 0.46, 18);
  const rThigh = new THREE.Mesh(rThighGeo, rThighMat);
  rThigh.position.set(0, -0.25, 0);
  tagMesh(rThigh, 'rightHip');
  rightHipGroup.add(rThigh);

  const rightKneeGroup = new THREE.Group();
  rightKneeGroup.name = 'rightKnee';
  rightKneeGroup.position.set(0, -0.5, 0);
  rightHipGroup.add(rightKneeGroup);

  const rKneeMat = getMaterialForMode(mode, jointColor, selectedJoint === 'rightKnee');
  const rKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), rKneeMat);
  tagMesh(rKneeJoint, 'rightKnee');
  rightKneeGroup.add(rKneeJoint);

  const rCalfMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'rightKnee');
  const rShinGeo = createOrganicMuscleCylinder(0.055, 0.08, 0.07, 0.46, 18);
  const rShin = new THREE.Mesh(rShinGeo, rCalfMat);
  rShin.position.set(0, -0.25, 0);
  tagMesh(rShin, 'rightKnee');
  rightKneeGroup.add(rShin);

  const rFootGroup = createAnatomicalFoot(false, mode, bodyColor, 'rightKnee', selectedJoint === 'rightKnee');
  rightKneeGroup.add(rFootGroup);

  // Apply Pose rotations
  applyRotationsToGroup(rootGroup, pose.joints);

  return rootGroup;
}

/**
 * Builds an ORGANIC SMOOTH Sculpted Quadruped Mannequin Mesh
 */
export function buildQuadrupedMannequin(
  pose: PoseState,
  mode: RenderMode,
  species: QuadrupedSpecies = 'canine',
  selectedJoint: string | null = null
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'quadruped_root';

  const bodyColor = species === 'feline' ? 0xf59e0b : species === 'equine' ? 0x92400e : 0x34d399;
  const jointColor = 0xa7f3d0;

  const tagMesh = (mesh: THREE.Mesh, jointName: string) => {
    mesh.userData = { jointName, isJointPart: true };
  };

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'spine';
  bodyGroup.position.set(0, 0.85, 0);
  rootGroup.add(bodyGroup);

  const spineMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'spine');
  const chestZ = species === 'equine' ? 1.1 : species === 'canine' ? 0.85 : 0.75;

  const chestGeo = new THREE.SphereGeometry(0.26, 24, 24);
  chestGeo.scale(0.9, 0.85, 1.3);
  const chestMesh = new THREE.Mesh(chestGeo, spineMat);
  chestMesh.position.set(0, 0, chestZ * 0.22);
  tagMesh(chestMesh, 'spine');
  bodyGroup.add(chestMesh);

  const waistGeo = new THREE.SphereGeometry(0.21, 20, 20);
  waistGeo.scale(0.85, 0.8, 1.2);
  const waistMesh = new THREE.Mesh(waistGeo, spineMat);
  waistMesh.position.set(0, -0.02, -chestZ * 0.1);
  tagMesh(waistMesh, 'spine');
  bodyGroup.add(waistMesh);

  const hipGeo = new THREE.SphereGeometry(0.24, 22, 22);
  hipGeo.scale(0.92, 0.85, 1.1);
  const hipMesh = new THREE.Mesh(hipGeo, spineMat);
  hipMesh.position.set(0, 0, -chestZ * 0.35);
  tagMesh(hipMesh, 'spine');
  bodyGroup.add(hipMesh);

  const neckGroup = new THREE.Group();
  neckGroup.name = 'neck';
  neckGroup.position.set(0, 0.15, chestZ / 2 - 0.05);
  neckGroup.rotation.x = Math.PI / 4;
  bodyGroup.add(neckGroup);

  const neckMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'neck');
  const neckH = species === 'equine' ? 0.65 : species === 'canine' ? 0.45 : 0.38;
  const slimTop = species === 'equine' ? 0.12 : 0.095;
  const thickBottom = species === 'equine' ? 0.22 : 0.18;

  const neckGeo = createOrganicMuscleCylinder(slimTop, (slimTop + thickBottom) / 1.8, thickBottom, neckH, 20);
  const neckMesh = new THREE.Mesh(neckGeo, neckMat);
  neckMesh.position.set(0, neckH / 2, 0);
  tagMesh(neckMesh, 'neck');
  neckGroup.add(neckMesh);

  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, neckH, 0);
  neckGroup.add(headGroup);

  const headMat = getMaterialForMode(mode, bodyColor, selectedJoint === 'head');
  const skullMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), headMat);
  skullMesh.position.set(0, 0.08, 0.06);
  tagMesh(skullMesh, 'head');
  headGroup.add(skullMesh);

  const snoutLen = species === 'feline' ? 0.14 : species === 'equine' ? 0.38 : 0.26;
  const snoutGeo = new THREE.SphereGeometry(0.11, 16, 16);
  snoutGeo.scale(0.8, 0.75, 1.8);
  const snoutMesh = new THREE.Mesh(snoutGeo, headMat);
  snoutMesh.position.set(0, 0.03, snoutLen / 2 + 0.08);
  tagMesh(snoutMesh, 'head');
  headGroup.add(snoutMesh);

  const earH = species === 'feline' ? 0.12 : species === 'canine' ? 0.2 : 0.15;
  const earMat = getMaterialForMode(mode, jointColor, selectedJoint === 'head');
  const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, earH, 12), earMat);
  leftEar.position.set(-0.12, 0.22, 0);
  tagMesh(leftEar, 'head');
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, earH, 12), earMat);
  rightEar.position.set(0.12, 0.22, 0);
  tagMesh(rightEar, 'head');
  headGroup.add(rightEar);

  const buildFrontLeg = (legJointName: string, elbowJointName: string, posX: number, posZ: number) => {
    const legGroup = new THREE.Group();
    legGroup.name = legJointName;
    legGroup.position.set(posX, -0.1, posZ);
    bodyGroup.add(legGroup);

    const legMat = getMaterialForMode(mode, bodyColor, selectedJoint === legJointName);
    const elbowMat = getMaterialForMode(mode, jointColor, selectedJoint === elbowJointName);
    const lowerMat = getMaterialForMode(mode, bodyColor, selectedJoint === elbowJointName);

    const upperLen = species === 'equine' ? 0.38 : 0.32;
    const lowerLen = species === 'equine' ? 0.4 : 0.34;

    const upperGeo = createOrganicMuscleCylinder(0.065, 0.085, 0.065, upperLen, 16);
    const upperMesh = new THREE.Mesh(upperGeo, legMat);
    upperMesh.position.set(0, -upperLen / 2, 0);
    tagMesh(upperMesh, legJointName);
    legGroup.add(upperMesh);

    const elbowGroup = new THREE.Group();
    elbowGroup.name = elbowJointName;
    elbowGroup.position.set(0, -upperLen, 0);
    legGroup.add(elbowGroup);

    const elbowJointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), elbowMat);
    tagMesh(elbowJointSphere, elbowJointName);
    elbowGroup.add(elbowJointSphere);

    const lowerGeo = createOrganicMuscleCylinder(0.045, 0.065, 0.045, lowerLen, 16);
    const lowerMesh = new THREE.Mesh(lowerGeo, lowerMat);
    lowerMesh.position.set(0, -lowerLen / 2, 0);
    tagMesh(lowerMesh, elbowJointName);
    elbowGroup.add(lowerMesh);

    if (species === 'equine') {
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16), elbowMat);
      hoof.position.set(0, -lowerLen - 0.05, 0.02);
      tagMesh(hoof, elbowJointName);
      elbowGroup.add(hoof);
    } else {
      const pawGeo = new THREE.SphereGeometry(0.07, 14, 14);
      pawGeo.scale(0.8, 0.4, 1.1);
      const pawBase = new THREE.Mesh(pawGeo, elbowMat);
      pawBase.position.set(0, -lowerLen - 0.03, 0.03);
      tagMesh(pawBase, elbowJointName);
      elbowGroup.add(pawBase);

      for (let i = -1.5; i <= 1.5; i += 1) {
        const toePad = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), elbowMat);
        toePad.position.set(i * 0.024, -lowerLen - 0.05, 0.09);
        tagMesh(toePad, elbowJointName);
        elbowGroup.add(toePad);
      }
    }
  };

  const buildBackLeg = (legJointName: string, hockJointName: string, posX: number, posZ: number) => {
    const legGroup = new THREE.Group();
    legGroup.name = legJointName;
    legGroup.position.set(posX, -0.1, posZ);
    bodyGroup.add(legGroup);

    const legMat = getMaterialForMode(mode, bodyColor, selectedJoint === legJointName);
    const hockMat = getMaterialForMode(mode, jointColor, selectedJoint === hockJointName);
    const lowerMat = getMaterialForMode(mode, bodyColor, selectedJoint === hockJointName);

    const thighLen = species === 'equine' ? 0.42 : 0.35;
    const shinLen = species === 'equine' ? 0.42 : 0.35;

    const thighGeo = createOrganicMuscleCylinder(0.07, 0.11, 0.07, thighLen, 16);
    const thighMesh = new THREE.Mesh(thighGeo, legMat);
    thighMesh.position.set(0, -thighLen / 2, 0);
    tagMesh(thighMesh, legJointName);
    legGroup.add(thighMesh);

    const hockGroup = new THREE.Group();
    hockGroup.name = hockJointName;
    hockGroup.position.set(0, -thighLen, 0);
    legGroup.add(hockGroup);

    const hockJointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), hockMat);
    tagMesh(hockJointSphere, hockJointName);
    hockGroup.add(hockJointSphere);

    const shinGeo = createOrganicMuscleCylinder(0.045, 0.07, 0.045, shinLen, 16);
    const shinMesh = new THREE.Mesh(shinGeo, lowerMat);
    shinMesh.position.set(0, -shinLen / 2, 0);
    tagMesh(shinMesh, hockJointName);
    hockGroup.add(shinMesh);

    if (species === 'equine') {
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16), hockMat);
      hoof.position.set(0, -shinLen - 0.05, 0.02);
      tagMesh(hoof, hockJointName);
      hockGroup.add(hoof);
    } else {
      const pawGeo = new THREE.SphereGeometry(0.07, 14, 14);
      pawGeo.scale(0.8, 0.4, 1.1);
      const pawBase = new THREE.Mesh(pawGeo, hockMat);
      pawBase.position.set(0, -shinLen - 0.03, 0.03);
      tagMesh(pawBase, hockJointName);
      hockGroup.add(pawBase);

      for (let i = -1.5; i <= 1.5; i += 1) {
        const toePad = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), hockMat);
        toePad.position.set(i * 0.024, -shinLen - 0.05, 0.09);
        tagMesh(toePad, hockJointName);
        hockGroup.add(toePad);
      }
    }
  };

  buildFrontLeg('frontLeftLeg', 'frontLeftElbow', -0.22, chestZ / 2 - 0.12);
  buildFrontLeg('frontRightLeg', 'frontRightElbow', 0.22, chestZ / 2 - 0.12);
  buildBackLeg('backLeftLeg', 'backLeftHock', -0.22, -chestZ / 2 + 0.12);
  buildBackLeg('backRightLeg', 'backRightHock', 0.22, -chestZ / 2 + 0.12);

  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  tailGroup.position.set(0, 0.15, -chestZ / 2);
  bodyGroup.add(tailGroup);

  const tailMat = getMaterialForMode(mode, jointColor, selectedJoint === 'tail');
  const tailLen = species === 'feline' ? 0.65 : 0.5;
  const tailGeo = createOrganicMuscleCylinder(0.02, 0.035, 0.05, tailLen, 14);
  const tailMesh = new THREE.Mesh(tailGeo, tailMat);
  tailMesh.rotation.x = -Math.PI / 3;
  tailMesh.position.set(0, -tailLen / 3, -tailLen / 3);
  tagMesh(tailMesh, 'tail');
  tailGroup.add(tailMesh);

  // Apply Pose rotations
  applyRotationsToGroup(rootGroup, pose.joints);

  return rootGroup;
}

/**
 * Creates procedural 3D mesh based on heightmap/depth from image data URL
 */
export function buildReliefMeshFromImage(imageUrl: string, mode: RenderMode): Promise<THREE.Group> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 64;
      const height = 64;
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        resolve(new THREE.Group());
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const geometry = new THREE.PlaneGeometry(1.6, 1.6, width - 1, height - 1);
      const posAttr = geometry.attributes.position;

      for (let i = 0; i < posAttr.count; i++) {
        const u = i % width;
        const v = Math.floor(i / width);
        const idx = (v * width + u) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const alpha = data[idx + 3];

        const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const z = alpha > 20 ? (luma - 0.5) * 0.4 : 0;
        posAttr.setZ(i, z);
      }

      geometry.computeVertexNormals();

      const texture = new THREE.CanvasTexture(img);
      const mat =
        mode === 'wireframe'
          ? new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true })
          : new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 0.4,
              metalness: 0.1,
              side: THREE.DoubleSide,
            });

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.8;
      mesh.userData = { jointName: 'custom_upload', isJointPart: true };

      const group = new THREE.Group();
      group.name = 'converted_custom_mesh';
      group.add(mesh);
      resolve(group);
    };

    img.onerror = () => {
      resolve(new THREE.Group());
    };

    img.src = imageUrl;
  });
}

function applyRotationsToGroup(group: THREE.Group, joints: Record<string, { x: number; y: number; z: number }>) {
  group.traverse((obj) => {
    if (obj.name && joints[obj.name]) {
      const rot = joints[obj.name];
      obj.rotation.set(rot.x, rot.y, rot.z);
    }
  });
}
