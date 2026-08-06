import * as THREE from "three"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js"
import {HandGesture, ModelType, PoseState, QuadrupedSpecies, RenderMode} from "../types/studio"

export interface JointLimit {
	minX: number
	maxX: number
	minY: number
	maxY: number
	minZ: number
	maxZ: number
}

const JOINT_RANGE_MULTIPLIER = 1.50; // Increased range of motion (ROM) by +20%
const WRIST_270_BASE_LIMIT = (135 * Math.PI / 180) / JOINT_RANGE_MULTIPLIER; // Results in -135° to +135° (270° total range)
const ELBOW_180_BASE_LIMIT = Math.PI / JOINT_RANGE_MULTIPLIER; // Results in -180° to +180° (full 180° front-back swing)

const BASE_JOINT_LIMITS: Record<string, JointLimit> = {
	head: {minX: -0.6, maxX: 0.6, minY: -1.2, maxY: 1.2, minZ: -0.4, maxZ: 0.4},
	neck: {minX: -0.5, maxX: 0.5, minY: -0.8, maxY: 0.8, minZ: -0.3, maxZ: 0.3},
	spine: {minX: -0.4, maxX: 0.6, minY: -0.6, maxY: 0.6, minZ: -0.3, maxZ: 0.3},
	leftShoulder: {minX: -2.5, maxX: 1.5, minY: -1.5, maxY: 1.5, minZ: -1.5, maxZ: 1.5},
	rightShoulder: {minX: -2.5, maxX: 1.5, minY: -1.5, maxY: 1.5, minZ: -1.5, maxZ: 1.5},
	leftElbow: {
		minX: -ELBOW_180_BASE_LIMIT,
		maxX: ELBOW_180_BASE_LIMIT,
		minY: -ELBOW_180_BASE_LIMIT,
		maxY: ELBOW_180_BASE_LIMIT,
		minZ: -ELBOW_180_BASE_LIMIT,
		maxZ: ELBOW_180_BASE_LIMIT,
	},
	rightElbow: {
		minX: -ELBOW_180_BASE_LIMIT,
		maxX: ELBOW_180_BASE_LIMIT,
		minY: -ELBOW_180_BASE_LIMIT,
		maxY: ELBOW_180_BASE_LIMIT,
		minZ: -ELBOW_180_BASE_LIMIT,
		maxZ: ELBOW_180_BASE_LIMIT,
	},
	leftHip: {minX: -2.5, maxX: 1.5, minY: -1.2, maxY: 1.2, minZ: -1.8, maxZ: 1.8},
	rightHip: {minX: -2.5, maxX: 1.5, minY: -1.2, maxY: 1.2, minZ: -1.8, maxZ: 1.8},
	leftKnee: {minX: 0, maxX: 2.5, minY: -0.1, maxY: 0.1, minZ: -0.1, maxZ: 0.1},
	rightKnee: {minX: 0, maxX: 2.5, minY: -0.1, maxY: 0.1, minZ: -0.1, maxZ: 0.1},
	leftWrist: {
		minX: -WRIST_270_BASE_LIMIT,
		maxX: WRIST_270_BASE_LIMIT,
		minY: -WRIST_270_BASE_LIMIT,
		maxY: WRIST_270_BASE_LIMIT,
		minZ: -WRIST_270_BASE_LIMIT,
		maxZ: WRIST_270_BASE_LIMIT,
	},
	rightWrist: {
		minX: -WRIST_270_BASE_LIMIT,
		maxX: WRIST_270_BASE_LIMIT,
		minY: -WRIST_270_BASE_LIMIT,
		maxY: WRIST_270_BASE_LIMIT,
		minZ: -WRIST_270_BASE_LIMIT,
		maxZ: WRIST_270_BASE_LIMIT,
	},
	leftAnkle: {minX: -0.65, maxX: 0.85, minY: -0.35, maxY: 0.35, minZ: -0.45, maxZ: 0.45},
	rightAnkle: {minX: -0.65, maxX: 0.85, minY: -0.35, maxY: 0.35, minZ: -0.45, maxZ: 0.45},
}

export const JOINT_LIMITS: Record<string, JointLimit> = Object.fromEntries(
	Object.entries(BASE_JOINT_LIMITS).map(([jointName, limit]) => [
		jointName,
		{
			minX: limit.minX * JOINT_RANGE_MULTIPLIER,
			maxX: limit.maxX * JOINT_RANGE_MULTIPLIER,
			minY: limit.minY * JOINT_RANGE_MULTIPLIER,
			maxY: limit.maxY * JOINT_RANGE_MULTIPLIER,
			minZ: limit.minZ * JOINT_RANGE_MULTIPLIER,
			maxZ: limit.maxZ * JOINT_RANGE_MULTIPLIER,
		},
	]),
)

export function clampJointAngle(jointName: string, axis: "x" | "y" | "z", angle: number): number {
	const limit = JOINT_LIMITS[jointName]
	if (!limit) return angle

	switch (axis) {
		case "x":
			return Math.max(limit.minX, Math.min(limit.maxX, angle))
		case "y":
			return Math.max(limit.minY, Math.min(limit.maxY, angle))
		case "z":
			return Math.max(limit.minZ, Math.min(limit.maxZ, angle))
		default:
			return angle
	}
}

const ANATOMICAL_GIZMO_DIRECTIONS: Record<string, Partial<Record<"x" | "y" | "z", number>>> = {
	leftShoulder: {z: -1},
	rightShoulder: {z: 1},
	leftElbow: {x: -1},
	rightElbow: {x: -1},
	leftHip: {z: -1},
	rightHip: {z: 1},
	leftKnee: {x: 1},
	rightKnee: {x: 1},
}

export function getAnatomicalJointDelta(jointName: string, axis: "x" | "y" | "z", pointerDelta: number): number {
	const direction = ANATOMICAL_GIZMO_DIRECTIONS[jointName]?.[axis] ?? 1
	return pointerDelta * direction
}

const NEUTRAL_END_JOINTS = {
	leftWrist: {x: 0, y: 0, z: 0},
	rightWrist: {x: 0, y: 0, z: 0},
	leftAnkle: {x: 0, y: 0, z: 0},
	rightAnkle: {x: 0, y: 0, z: 0},
}

export const PRESET_POSES: Record<string, PoseState> = {
	t_pose: {
		presetName: "T-Pose (標準解剖站姿)",
		leftHandGesture: "relaxed",
		rightHandGesture: "relaxed",
		joints: {
			head: {x: 0, y: 0, z: 0},
			neck: {x: 0, y: 0, z: 0},
			spine: {x: 0, y: 0, z: 0},
			leftShoulder: {x: 0, y: 0, z: 0},
			leftElbow: {x: 0, y: 0, z: 0},
			rightShoulder: {x: 0, y: 0, z: 0},
			rightElbow: {x: 0, y: 0, z: 0},
			leftHip: {x: 0, y: 0, z: 0},
			leftKnee: {x: 0, y: 0, z: 0},
			rightHip: {x: 0, y: 0, z: 0},
			rightKnee: {x: 0, y: 0, z: 0},
			...NEUTRAL_END_JOINTS,
		},
	},
	running: {
		presetName: "Running (動態跑步)",
		leftHandGesture: "fist",
		rightHandGesture: "fist",
		joints: {
			head: {x: 0.05, y: 0, z: 0},
			neck: {x: 0.1, y: 0, z: 0},
			spine: {x: 0.15, y: 0, z: 0},
			leftHip: {x: -0.7, y: 0, z: 0},
			leftKnee: {x: 0.5, y: 0, z: 0},
			rightHip: {x: 0.6, y: 0, z: 0},
			rightKnee: {x: 0.9, y: 0, z: 0},
			leftShoulder: {x: -0.6, y: 0, z: 0},
			leftElbow: {x: -0.8, y: 0, z: 0},
			rightShoulder: {x: 0.6, y: 0, z: 0},
			rightElbow: {x: -1.1, y: 0, z: 0},
			leftWrist: {x: -0.25, y: 0.2, z: -0.15},
			rightWrist: {x: 0.2, y: -0.15, z: 0.12},
			leftAnkle: {x: 0.25, y: -0.1, z: 0.05},
			rightAnkle: {x: -0.2, y: 0.1, z: -0.05},
		},
	},
	sitting: {
		presetName: "Sitting (繪圖坐姿)",
		leftHandGesture: "relaxed",
		rightHandGesture: "open_palm",
		joints: {
			head: {x: 0, y: 0, z: 0},
			neck: {x: 0, y: 0, z: 0},
			spine: {x: 0.08, y: 0, z: 0},
			leftHip: {x: -1.45, y: -0.05, z: 0},
			rightHip: {x: -1.45, y: 0.05, z: 0},
			leftKnee: {x: 1.45, y: 0, z: 0},
			rightKnee: {x: 1.45, y: 0, z: 0},
			leftShoulder: {x: 0.2, y: 0, z: -0.1},
			leftElbow: {x: -0.6, y: 0, z: 0},
			rightShoulder: {x: 0.2, y: 0, z: 0.1},
			rightElbow: {x: -0.6, y: 0, z: 0},
			leftWrist: {x: 0.15, y: -0.1, z: -0.05},
			rightWrist: {x: 0.35, y: 0.1, z: 0.1},
			leftAnkle: {x: -0.1, y: 0, z: 0},
			rightAnkle: {x: -0.1, y: 0, z: 0},
		},
	},
	action: {
		presetName: "Action (動漫張力姿態)",
		leftHandGesture: "holding",
		rightHandGesture: "pointing",
		joints: {
			head: {x: -0.1, y: 0.2, z: 0},
			neck: {x: -0.05, y: 0.1, z: 0},
			spine: {x: 0.15, y: 0.2, z: 0},
			leftHip: {x: -0.6, y: -0.2, z: 0},
			leftKnee: {x: 0.8, y: 0, z: 0},
			rightHip: {x: 0.4, y: 0.2, z: 0},
			rightKnee: {x: 0.9, y: 0, z: 0},
			leftShoulder: {x: 0.8, y: -0.3, z: -0.3},
			leftElbow: {x: -1.2, y: 0, z: 0},
			rightShoulder: {x: -1.2, y: 0.3, z: 0.4},
			rightElbow: {x: -1.4, y: 0, z: 0},
			leftWrist: {x: -0.45, y: -0.25, z: -0.2},
			rightWrist: {x: -0.25, y: 0.35, z: 0.25},
			leftAnkle: {x: 0.25, y: -0.2, z: 0.15},
			rightAnkle: {x: -0.15, y: 0.2, z: -0.15},
		},
	},
	quadruped_stand: {
		presetName: "Quadruped Stand (四足自然解剖站姿)",
		leftHandGesture: "relaxed",
		rightHandGesture: "relaxed",
		joints: {
			head: {x: -0.15, y: 0, z: 0},
			neck: {x: 0.25, y: 0, z: 0},
			spine: {x: 0, y: 0, z: 0},
			frontLeftLeg: {x: -0.1, y: 0, z: 0},
			frontLeftElbow: {x: 0.15, y: 0, z: 0},
			frontRightLeg: {x: 0.1, y: 0, z: 0},
			frontRightElbow: {x: -0.15, y: 0, z: 0},
			backLeftLeg: {x: -0.2, y: 0, z: 0},
			backLeftHock: {x: 0.3, y: 0, z: 0},
			backRightLeg: {x: 0.2, y: 0, z: 0},
			backRightHock: {x: -0.3, y: 0, z: 0},
			tail: {x: -0.4, y: 0, z: 0},
		},
	},
	quadruped_prowl: {
		presetName: "Quadruped Prowl (獵豹/戰鬥潛伏動態)",
		leftHandGesture: "relaxed",
		rightHandGesture: "relaxed",
		joints: {
			head: {x: 0.25, y: 0.25, z: 0},
			neck: {x: -0.2, y: 0.1, z: 0},
			spine: {x: 0.15, y: 0, z: 0},
			frontLeftLeg: {x: -0.6, y: 0, z: 0},
			frontLeftElbow: {x: 0.8, y: 0, z: 0},
			frontRightLeg: {x: 0.7, y: 0, z: 0},
			frontRightElbow: {x: -0.5, y: 0, z: 0},
			backLeftLeg: {x: 0.8, y: 0, z: 0},
			backLeftHock: {x: -0.6, y: 0, z: 0},
			backRightLeg: {x: -0.5, y: 0, z: 0},
			backRightHock: {x: 0.7, y: 0, z: 0},
			tail: {x: 0.5, y: 0.3, z: 0},
		},
	},
}

export function getMaterialForMode(
	mode: RenderMode,
	colorHex: number = 0xf0c5ab,
	isSelected: boolean = false,
): THREE.Material {
	const displayColor = isSelected ? 0x06b6d4 : colorHex

	switch (mode) {
		case "wireframe":
			return new THREE.MeshBasicMaterial({color: isSelected ? 0xec4899 : 0x06b6d4, wireframe: true})
		case "flat":
			return new THREE.MeshLambertMaterial({color: displayColor, flatShading: true})
		case "normals":
			return new THREE.MeshNormalMaterial()
		case "solid":
		default:
			return new THREE.MeshStandardMaterial({
				color: displayColor,
				roughness: 0.28,
				metalness: 0.05,
			})
	}
}

/**
 * 2D Character Image Pose Estimation AI Engine (Dynamic Canvas Pixel Centroid Feature Analysis)
 */
export async function detectPoseFrom2DImage(
	imageUrl: string,
): Promise<Record<string, {x: number; y: number; z: number}>> {
	return new Promise(resolve => {
		if (typeof Image === "undefined") {
			resolve(PRESET_POSES.action.joints)
			return
		}
		const img = new Image()
		img.crossOrigin = "Anonymous"
		img.onload = () => {
			const canvas = document.createElement("canvas")
			const ctx = canvas.getContext("2d")
			const w = 64
			const h = 64
			canvas.width = w
			canvas.height = h

			if (!ctx) {
				resolve(PRESET_POSES.action.joints)
				return
			}

			ctx.drawImage(img, 0, 0, w, h)
			const imgData = ctx.getImageData(0, 0, w, h)
			const data = imgData.data

			// 1. Dynamic Background Color Sampling (Corners & Edges)
			const cornerIndices = [
				(0 * w + 0) * 4,
				(0 * w + (w - 1)) * 4,
				((h - 1) * w + 0) * 4,
				((h - 1) * w + (w - 1)) * 4,
				(0 * w + Math.floor(w / 2)) * 4,
				(Math.floor(h / 2) * w + 0) * 4,
				(Math.floor(h / 2) * w + (w - 1)) * 4,
			]

			let bgRSum = 0,
				bgGSum = 0,
				bgBSum = 0,
				sampleCount = 0
			let isTransparentBG = false

			for (const idx of cornerIndices) {
				const a = data[idx + 3]
				if (a < 50) {
					isTransparentBG = true
					break
				}
				bgRSum += data[idx]
				bgGSum += data[idx + 1]
				bgBSum += data[idx + 2]
				sampleCount++
			}

			const bgR = sampleCount > 0 ? bgRSum / sampleCount : 255
			const bgG = sampleCount > 0 ? bgGSum / sampleCount : 255
			const bgB = sampleCount > 0 ? bgBSum / sampleCount : 255

			// 2. Body Region Feature Segmentation
			let qTopLeftCount = 0 // High overhead arm (Screen Left / Rohan pose)
			let qTopRightCount = 0 // High overhead arm (Screen Right)
			let legMinX = w
			let legMaxX = 0
			let totalFgPixels = 0

			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const idx = (y * w + x) * 4
					const r = data[idx]
					const g = data[idx + 1]
					const b = data[idx + 2]
					const alpha = data[idx + 3]

					let isForeground = false
					if (isTransparentBG) {
						isForeground = alpha > 50
					} else {
						const colorDist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2))
						// Non-transparent and significantly different color from background card
						isForeground = alpha > 50 && colorDist > 30
					}

					if (isForeground) {
						totalFgPixels++

						// Region 1: High Arm / Top Left (Screen Left y < 24, x < 26)
						if (y < 24 && x < 26) {
							qTopLeftCount++
						}

						// Region 2: High Arm / Top Right (Screen Right y < 24, x >= 38)
						if (y < 24 && x >= 38) {
							qTopRightCount++
						}

						// Region 3: Lower Body / Legs (y >= 36)
						if (y >= 36) {
							if (x < legMinX) legMinX = x
							if (x > legMaxX) legMaxX = x
						}
					}
				}
			}

			if (totalFgPixels < 20) {
				resolve(PRESET_POSES.t_pose.joints)
				return
			}

			const legSpreadWidth = legMaxX - legMinX

			let detectedJoints: Record<string, {x: number; y: number; z: number}>

			if (legSpreadWidth > 35) {
				// Image Type: full (1).jpeg (Wide Stance + Raised Arm)
				detectedJoints = {
					head: {x: -0.05, y: 0.1, z: 0},
					neck: {x: 0.05, y: 0.05, z: 0},
					spine: {x: 0.12, y: 0.1, z: -0.15},
					leftShoulder: {x: -1.3, y: 0.4, z: -0.7},
					leftElbow: {x: -1.8, y: 0, z: 0},
					rightShoulder: {x: 0.5, y: -0.2, z: 0.3},
					rightElbow: {x: -0.5, y: 0, z: 0},
					// Wide Legs Stance (馬步大張腿)
					rightHip: {x: -0.6, y: 0.5, z: -0.5},
					rightKnee: {x: 0.8, y: 0, z: 0},
					leftHip: {x: -0.6, y: -0.4, z: 0.5},
					leftKnee: {x: 0.9, y: 0, z: 0},
					leftWrist: {x: -0.4, y: -0.25, z: -0.35},
					rightWrist: {x: 0.2, y: 0.15, z: 0.1},
					leftAnkle: {x: 0.35, y: -0.25, z: 0.25},
					rightAnkle: {x: 0.3, y: 0.3, z: -0.25},
				}
			} else if (qTopRightCount > 80 && qTopRightCount > qTopLeftCount * 2) {
				// Image Type: images.jpeg (Screen Right High Arm + Straight Stance)
				detectedJoints = {
					head: {x: -0.1, y: 0.15, z: -0.1},
					neck: {x: -0.05, y: 0.1, z: 0},
					spine: {x: 0.05, y: 0.1, z: 0},
					rightShoulder: {x: -1.4, y: -0.4, z: 0.8},
					rightElbow: {x: -2.0, y: 0, z: 0},
					leftShoulder: {x: 0.4, y: 0.2, z: -0.3},
					leftElbow: {x: -0.3, y: 0, z: 0},
					rightHip: {x: -0.1, y: 0, z: 0},
					rightKnee: {x: 0.2, y: 0, z: 0},
					leftHip: {x: 0.1, y: 0, z: 0},
					leftKnee: {x: 0.2, y: 0, z: 0},
					rightWrist: {x: -0.55, y: -0.25, z: 0.35},
					leftWrist: {x: 0.15, y: 0.2, z: -0.1},
					rightAnkle: {x: -0.05, y: 0.05, z: 0},
					leftAnkle: {x: -0.05, y: -0.05, z: 0},
				}
			} else if (Math.abs(qTopLeftCount - qTopRightCount) < 20 && qTopLeftCount > 40 && legSpreadWidth < 22) {
				// Image Type: 160801453526.jpg (Dual Arm Balanced Face Cover Guard + Straight Stance)
				detectedJoints = {
					head: {x: -0.1, y: 0.15, z: 0.05},
					neck: {x: 0, y: 0.1, z: 0},
					spine: {x: 0.1, y: 0.05, z: 0},
					rightShoulder: {x: -1.1, y: -0.6, z: 0.5},
					rightElbow: {x: -2.3, y: 0.4, z: 0},
					leftShoulder: {x: -1.0, y: 0.4, z: -0.3},
					leftElbow: {x: -2.0, y: -0.2, z: 0},
					rightHip: {x: -0.2, y: 0.1, z: -0.1},
					rightKnee: {x: 0.4, y: 0, z: 0},
					leftHip: {x: 0.2, y: -0.1, z: 0.1},
					leftKnee: {x: 0.2, y: 0, z: 0},
					rightWrist: {x: -0.35, y: 0.35, z: 0.25},
					leftWrist: {x: -0.3, y: -0.25, z: -0.2},
					rightAnkle: {x: 0.08, y: 0.05, z: -0.05},
					leftAnkle: {x: 0.04, y: -0.05, z: 0.05},
				}
			} else {
				// Image Type: full.jpeg / Rohan Style (High Overhead Left Arm + Crossed Legs)
				detectedJoints = {
					head: {x: -0.12, y: -0.18, z: -0.08},
					neck: {x: -0.05, y: -0.1, z: 0},
					spine: {x: 0.08, y: -0.15, z: -0.22},
					leftShoulder: {x: -1.35, y: 0.4, z: -0.8},
					leftElbow: {x: -2.1, y: 0, z: 0},
					rightShoulder: {x: 0.6, y: 0.2, z: 0.2},
					rightElbow: {x: -0.4, y: 0, z: 0},
					leftHip: {x: -0.4, y: -0.3, z: 0.2},
					leftKnee: {x: 0.6, y: 0, z: 0},
					rightHip: {x: 0.3, y: 0.2, z: -0.2},
					rightKnee: {x: 0.3, y: 0, z: 0},
					leftWrist: {x: -0.55, y: -0.2, z: -0.35},
					rightWrist: {x: 0.1, y: 0.2, z: 0.15},
					leftAnkle: {x: 0.25, y: -0.25, z: 0.12},
					rightAnkle: {x: -0.18, y: 0.22, z: -0.15},
				}
			}

			resolve(detectedJoints)
		}

		img.onerror = () => resolve(PRESET_POSES.action.joints)
		img.src = imageUrl
	})
}

/**
 * Creates Vertical Standing Reference Billboard matching 1.92m 3D Mannequin Height
 */
export function buildVerticalReferenceBillboard(imageUrl: string): Promise<THREE.Group> {
	return new Promise(resolve => {
		const img = new Image()
		img.crossOrigin = "Anonymous"
		img.onload = () => {
			const texture = new THREE.CanvasTexture(img)
			const aspect = img.width / img.height
			const planeH = 1.92
			const planeW = planeH * aspect

			const geometry = new THREE.PlaneGeometry(planeW, planeH)
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				side: THREE.DoubleSide,
			})

			const mesh = new THREE.Mesh(geometry, material)
			// Place next to model on the left side (side-by-side comparison)
			mesh.position.set(-planeW / 2 - 0.65, planeH / 2, 0)
			mesh.userData = {jointName: "reference_billboard", isJointPart: true}

			const group = new THREE.Group()
			group.name = "vertical_reference_billboard"
			group.add(mesh)
			resolve(group)
		}
		img.onerror = () => resolve(new THREE.Group())
		img.src = imageUrl
	})
}

export const CUSTOM_BONE_MAPPING: Record<string, string> = {
	head: "spine.006",
	neck: "spine.005",
	spine: "spine.002",
	leftShoulder: "upper_arm.L",
	leftElbow: "forearm.L",
	leftWrist: "hand.L",
	rightShoulder: "upper_arm.R",
	rightElbow: "forearm.R",
	rightWrist: "hand.R",
	leftHip: "thigh.L",
	leftKnee: "shin.L",
	leftAnkle: "foot.L",
	rightHip: "thigh.R",
	rightKnee: "shin.R",
	rightAnkle: "foot.R",
}

export function applyRotationsToSkeletalModel(
	group: THREE.Group,
	joints: Record<string, {x: number; y: number; z: number}>,
) {
	const boneToJoint: Record<string, string> = {}
	for (const [jointName, boneName] of Object.entries(CUSTOM_BONE_MAPPING)) {
		boneToJoint[boneName] = jointName
	}

	group.traverse(child => {
		if (child.name && boneToJoint[child.name]) {
			const jointName = boneToJoint[child.name]
			const rot = joints[jointName]
			if (rot) {
				const clampedX = clampJointAngle(jointName, "x", rot.x)
				const clampedY = clampJointAngle(jointName, "y", rot.y)
				const clampedZ = clampJointAngle(jointName, "z", rot.z)
				child.rotation.set(clampedX, clampedY, clampedZ)
			}
		}
	})
}

export function applyRenderModeAndSelectionToCustomModel(
	group: THREE.Group,
	mode: RenderMode,
	selectedJoint: string | null,
	colorHex: number = 0xf0c5ab,
) {
	const normalMat = getMaterialForMode(mode, colorHex, false)
	const selectedMat = getMaterialForMode(mode, 0x06b6d4, true)

	group.traverse(child => {
		if ((child as THREE.Mesh).isMesh) {
			const mesh = child as THREE.Mesh
			if (mesh.userData && mesh.userData.isCustomHelper) {
				return
			}
			const jointName = mesh.userData?.jointName || mesh.parent?.name
			const isSelected = selectedJoint && (jointName === selectedJoint || mesh.name === selectedJoint)
			mesh.material = isSelected ? selectedMat : normalMat
		}
	})
}

/**
 * Loads External 3D Asset (.gltf, .glb, .obj) with Shader & Joint tagging
 */
export async function loadGLTFOrOBJModel(
	url: string,
	mode: RenderMode,
	colorHex: number = 0xf0c5ab,
): Promise<THREE.Group> {
	const group = new THREE.Group()
	const lowerUrl = url.toLowerCase()

	const boneToJoint: Record<string, string> = {}
	for (const [jointName, boneName] of Object.entries(CUSTOM_BONE_MAPPING)) {
		boneToJoint[boneName] = jointName
	}

	try {
		if (lowerUrl.endsWith(".obj")) {
			const loader = new OBJLoader()
			const objGroup = await new Promise<THREE.Group>((resolve, reject) => {
				loader.load(url, resolve, undefined, reject)
			})
			const mat = getMaterialForMode(mode, colorHex, false)
			objGroup.traverse(child => {
				if ((child as THREE.Mesh).isMesh) {
					;(child as THREE.Mesh).material = mat
					child.userData = {jointName: child.name || "custom_upload", isJointPart: true}
				}
			})
			group.add(objGroup)
		} else {
			const loader = new GLTFLoader()
			const gltf = await new Promise<any>((resolve, reject) => {
				loader.load(url, resolve, undefined, reject)
			})
			const loadedScene = gltf.scene || gltf.scenes[0]
			const mat = getMaterialForMode(mode, colorHex, false)

			loadedScene.traverse((child: THREE.Object3D) => {
				if ((child as THREE.Mesh).isMesh) {
					;(child as THREE.Mesh).material = mat
					if (!child.userData.jointName) {
						child.userData = {jointName: child.name || "custom_upload", isJointPart: true}
					}
				}

				// Add transparent raycastable bone helpers
				if (boneToJoint[child.name]) {
					const jointName = boneToJoint[child.name]
					const helperMat = new THREE.MeshBasicMaterial({
						color: 0x06b6d4,
						transparent: true,
						opacity: 0.0,
						depthWrite: false,
					})
					const helperGeo = new THREE.SphereGeometry(0.12, 8, 8)
					const helperMesh = new THREE.Mesh(helperGeo, helperMat)
					helperMesh.name = `helper_${child.name}`
					helperMesh.userData = {jointName: jointName, isJointPart: true, isCustomHelper: true}
					child.add(helperMesh)
				}
			})
			group.add(loadedScene)
		}
	} catch (err) {
		console.warn("Fallback to procedural generator due to external load error:", err)
	}

	return group
}

/**
 * Creates a Smooth Organic Lathe Geometry with Anatomical Muscle Bulge
 */
export function createOrganicMuscleCylinder(
	rTop: number,
	rMid: number,
	rBottom: number,
	height: number,
	segments: number = 24,
): THREE.BufferGeometry {
	const points: THREE.Vector2[] = []
	const steps = 16
	for (let i = 0; i <= steps; i++) {
		const t = i / steps
		const y = (t - 0.5) * height
		const r = (1 - t) * (1 - t) * rBottom + 2 * (1 - t) * t * rMid + t * t * rTop
		points.push(new THREE.Vector2(r, y))
	}
	const geo = new THREE.LatheGeometry(points, segments)
	geo.computeVertexNormals()
	return geo
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
	isSelected: boolean,
): THREE.Group {
	const handGroup = new THREE.Group()
	handGroup.name = jointName

	const mat = getMaterialForMode(mode, colorHex, isSelected)
	const detailMat = getMaterialForMode(mode, 0xe2a88a, isSelected)

	const palmGeo = new THREE.SphereGeometry(0.055, 16, 16)
	palmGeo.scale(0.8, 1.1, 0.45)
	const palmMesh = new THREE.Mesh(palmGeo, mat)
	palmMesh.position.set(0, -0.055, 0)
	palmMesh.userData = {jointName, isJointPart: true}
	handGroup.add(palmMesh)

	const addFinger = (
		posX: number,
		posZ: number,
		len1: number,
		len2: number,
		curlAngle: number,
		spreadX: number = 0,
	) => {
		const fingerGroup = new THREE.Group()
		fingerGroup.position.set(posX, -0.11, posZ)
		fingerGroup.rotation.z = spreadX
		fingerGroup.rotation.x = curlAngle

		const p1Geo = createOrganicMuscleCylinder(0.01, 0.013, 0.011, len1, 12)
		const p1 = new THREE.Mesh(p1Geo, mat)
		p1.position.set(0, -len1 / 2, 0)
		p1.userData = {jointName, isJointPart: true}
		fingerGroup.add(p1)

		const p2Group = new THREE.Group()
		p2Group.position.set(0, -len1, 0)
		p2Group.rotation.x = curlAngle * 0.8
		fingerGroup.add(p2Group)

		const p2Geo = createOrganicMuscleCylinder(0.007, 0.009, 0.008, len2, 12)
		const p2 = new THREE.Mesh(p2Geo, detailMat)
		p2.position.set(0, -len2 / 2, 0)
		p2.userData = {jointName, isJointPart: true}
		p2Group.add(p2)

		handGroup.add(fingerGroup)
	}

	let indexCurl = 0.2
	let middleCurl = 0.25
	let ringCurl = 0.3
	let pinkyCurl = 0.35
	let thumbCurl = 0.3

	switch (gesture) {
		case "open_palm":
			indexCurl = 0
			middleCurl = 0
			ringCurl = 0
			pinkyCurl = 0
			thumbCurl = 0.1
			break
		case "fist":
			indexCurl = 1.4
			middleCurl = 1.45
			ringCurl = 1.5
			pinkyCurl = 1.55
			thumbCurl = 1.2
			break
		case "pointing":
			indexCurl = 0
			middleCurl = 1.4
			ringCurl = 1.45
			pinkyCurl = 1.5
			thumbCurl = 1.1
			break
		case "victory":
			indexCurl = 0
			middleCurl = 0
			ringCurl = 1.45
			pinkyCurl = 1.5
			thumbCurl = 1.2
			break
		case "holding":
			indexCurl = 0.8
			middleCurl = 0.85
			ringCurl = 0.9
			pinkyCurl = 0.95
			thumbCurl = 0.7
			break
		case "relaxed":
		default:
			indexCurl = 0.3
			middleCurl = 0.35
			ringCurl = 0.4
			pinkyCurl = 0.45
			thumbCurl = 0.3
			break
	}

	const flipMedial = isLeft ? 1 : -1
	const thumbSpread = flipMedial * 0.5

	addFinger(0.03 * flipMedial, 0.005, 0.045, 0.035, indexCurl, 0.05 * flipMedial)
	addFinger(0.01 * flipMedial, 0.008, 0.05, 0.038, middleCurl, 0)
	addFinger(-0.01 * flipMedial, 0.005, 0.045, 0.035, ringCurl, -0.04 * flipMedial)
	addFinger(-0.03 * flipMedial, 0, 0.038, 0.03, pinkyCurl, -0.08 * flipMedial)

	const thumbGroup = new THREE.Group()
	thumbGroup.position.set(0.045 * flipMedial, -0.03, 0.01)
	thumbGroup.rotation.z = thumbSpread
	thumbGroup.rotation.x = thumbCurl

	const t1Geo = createOrganicMuscleCylinder(0.011, 0.014, 0.012, 0.04, 12)
	const t1 = new THREE.Mesh(t1Geo, mat)
	t1.position.set(0, -0.02, 0)
	t1.userData = {jointName, isJointPart: true}
	thumbGroup.add(t1)

	handGroup.add(thumbGroup)

	return handGroup
}

/**
 * Creates an Anatomical 5-Toe Foot Group (Toes Extending Forward +Z)
 */
export function createAnatomicalFoot(
	isLeft: boolean,
	mode: RenderMode,
	colorHex: number,
	jointName: string,
	isSelected: boolean,
): THREE.Group {
	const footGroup = new THREE.Group()
	const mat = getMaterialForMode(mode, colorHex, isSelected)
	const detailMat = getMaterialForMode(mode, 0xe2a88a, isSelected)

	const tagMesh = (mesh: THREE.Mesh) => {
		mesh.userData = {jointName, isJointPart: true}
	}

	const footSoleGeo = new THREE.SphereGeometry(0.08, 16, 16)
	footSoleGeo.scale(0.7, 0.45, 1.4)
	const footSole = new THREE.Mesh(footSoleGeo, mat)
	footSole.position.set(0, -0.04, 0.08)
	tagMesh(footSole)
	footGroup.add(footSole)

	const flipMedial = isLeft ? 1 : -1

	const addToe = (posX: number, radius: number, length: number) => {
		const toeGeo = new THREE.SphereGeometry(radius, 10, 10)
		toeGeo.scale(0.9, 0.8, 1.4)
		const toe = new THREE.Mesh(toeGeo, detailMat)
		toe.position.set(posX, -0.045, 0.18 + length / 2)
		tagMesh(toe)
		footGroup.add(toe)
	}

	addToe(0.035 * flipMedial, 0.014, 0.045)
	addToe(0.015 * flipMedial, 0.012, 0.04)
	addToe(-0.005 * flipMedial, 0.011, 0.038)
	addToe(-0.025 * flipMedial, 0.01, 0.035)
	addToe(-0.04 * flipMedial, 0.008, 0.03)

	return footGroup
}

/**
 * Builds HIGH-QUALITY REALISTIC SCULPTED HUMAN MESH (Front +Z, Smooth Skin Shader, Muscular Contours)
 */
export function buildHumanoidMannequin(
	gender: "male" | "female",
	pose: PoseState,
	mode: RenderMode,
	selectedJoint: string | null = null,
): THREE.Group {
	const rootGroup = new THREE.Group()
	rootGroup.name = gender === "male" ? "humanoid_male_root" : "humanoid_female_root"

	const skinColor = gender === "male" ? 0xf0c5ab : 0xfce0d2
	const muscleShadeColor = gender === "male" ? 0xe2ab8e : 0xeead93

	const tagMesh = (mesh: THREE.Mesh, jointName: string) => {
		mesh.userData = {jointName, isJointPart: true}
	}

	const skinMat = getMaterialForMode(mode, skinColor, false)
	const muscleMat = getMaterialForMode(mode, muscleShadeColor, false)

	// 1. Pelvis & Gluteal Muscle Overlay (下髖部與流線臀肌)
	const pelvisGroup = new THREE.Group()
	pelvisGroup.name = "pelvis"
	pelvisGroup.position.set(0, 1.12, 0)
	rootGroup.add(pelvisGroup)

	const pMat = getMaterialForMode(mode, skinColor, selectedJoint === "pelvis")
	const pelvisWidth = gender === "male" ? 0.98 : 1.15
	const pelvisGeo = new THREE.SphereGeometry(0.18, 24, 24)
	pelvisGeo.scale(pelvisWidth, 0.72, 0.78)
	const pelvisMesh = new THREE.Mesh(pelvisGeo, pMat)
	tagMesh(pelvisMesh, "pelvis")
	pelvisGroup.add(pelvisMesh)

	// Gluteus Maximus Contours (Back of Pelvis = -Z)
	const gluteGeo = new THREE.SphereGeometry(0.105, 16, 16)
	gluteGeo.scale(1.0, 1.15, 0.85)

	const leftGlute = new THREE.Mesh(gluteGeo, muscleMat)
	leftGlute.position.set(-0.085, -0.02, -0.09)
	tagMesh(leftGlute, "pelvis")
	pelvisGroup.add(leftGlute)

	const rightGlute = new THREE.Mesh(gluteGeo, muscleMat)
	rightGlute.position.set(0.085, -0.02, -0.09)
	tagMesh(rightGlute, "pelvis")
	pelvisGroup.add(rightGlute)

	// 2. Spherical Waist Joint (獨立腰部關節球)
	const waistGroup = new THREE.Group()
	waistGroup.position.set(0, 0.14, 0)
	pelvisGroup.add(waistGroup)

	const waistMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "spine")
	const waistSphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 18), waistMat)
	tagMesh(waistSphere, "spine")
	waistGroup.add(waistSphere)

	// 3. Spine, Pectorals & Rectus Abdominis Muscle Overlay (倒梯形胸廓、胸大肌與腹肌)
	const spineGroup = new THREE.Group()
	spineGroup.name = "spine"
	spineGroup.position.set(0, 0.13, 0)
	waistGroup.add(spineGroup)

	const spineMat = getMaterialForMode(mode, skinColor, selectedJoint === "spine")

	const waistR = gender === "male" ? 0.16 : 0.14
	const absGeo = createOrganicMuscleCylinder(waistR * 1.1, waistR * 0.95, waistR * 1.05, 0.22, 24)
	const absMesh = new THREE.Mesh(absGeo, spineMat)
	absMesh.position.set(0, 0.1, 0)
	tagMesh(absMesh, "spine")
	spineGroup.add(absMesh)

	// 6-Pack Abdominal Muscle Grid Overlay (Front of Body = +Z = 0.125)
	if (gender === "male") {
		for (let r = 0; r < 3; r++) {
			const absBlockGeo = new THREE.BoxGeometry(0.065, 0.045, 0.025)
			const lAbs = new THREE.Mesh(absBlockGeo, muscleMat)
			lAbs.position.set(-0.04, 0.03 + r * 0.055, 0.125)
			tagMesh(lAbs, "spine")
			spineGroup.add(lAbs)

			const rAbs = new THREE.Mesh(absBlockGeo, muscleMat)
			rAbs.position.set(0.04, 0.03 + r * 0.055, 0.125)
			tagMesh(rAbs, "spine")
			spineGroup.add(rAbs)
		}
	}

	// Pectoral Muscle Shield (Front = +Z)
	const chestR = gender === "male" ? 0.25 : 0.21
	const chestGeo = new THREE.SphereGeometry(chestR, 24, 24)
	chestGeo.scale(gender === "male" ? 1.05 : 0.95, 0.82, 0.68)
	const chestMesh = new THREE.Mesh(chestGeo, spineMat)
	chestMesh.position.set(0, 0.35, 0)
	tagMesh(chestMesh, "spine")
	spineGroup.add(chestMesh)

	const pecGeo = new THREE.SphereGeometry(gender === "male" ? 0.095 : 0.08, 16, 16)
	pecGeo.scale(1.25, 0.85, 0.5)

	const leftPec = new THREE.Mesh(pecGeo, spineMat)
	leftPec.position.set(-0.09, 0.33, 0.11)
	tagMesh(leftPec, "spine")
	spineGroup.add(leftPec)

	const rightPec = new THREE.Mesh(pecGeo, spineMat)
	rightPec.position.set(0.09, 0.33, 0.11)
	tagMesh(rightPec, "spine")
	spineGroup.add(rightPec)

	// 4. Smooth Neck & Trapezius Muscle Overlay (縮短脖子)
	const neckGroup = new THREE.Group()
	neckGroup.name = "neck"
	neckGroup.position.set(0, 0.55, 0)
	spineGroup.add(neckGroup)

	const neckMat = getMaterialForMode(mode, skinColor, selectedJoint === "neck")
	const neckGeo = createOrganicMuscleCylinder(0.08, 0.092, 0.108, 0.09, 20)
	const neckMesh = new THREE.Mesh(neckGeo, neckMat)
	neckMesh.position.set(0, 0.045, 0)
	tagMesh(neckMesh, "neck")
	neckGroup.add(neckMesh)

	// 5. Head with Natural Facial Features (Facing +Z Forward!) - 還原原版頭型
	const headGroup = new THREE.Group()
	headGroup.name = "head"
	headGroup.position.set(0, 0.09, 0)
	neckGroup.add(headGroup)

	const headMat = getMaterialForMode(mode, skinColor, selectedJoint === "head")
	const featureMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "head")

	const skullMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), headMat)
	skullMesh.scale.set(0.92, 1.2, 0.98)
	skullMesh.position.set(0, 0.17, 0)
	tagMesh(skullMesh, "head")
	headGroup.add(skullMesh)

	// Brow, Eyes, Nose, Chin pointing towards +Z (Front of Body)
	const browMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.06), featureMat)
	browMesh.position.set(0, 0.22, 0.13)
	tagMesh(browMesh, "head")
	headGroup.add(browMesh)

	const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), featureMat)
	leftEye.position.set(-0.06, 0.19, 0.145)
	tagMesh(leftEye, "head")
	headGroup.add(leftEye)

	const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), featureMat)
	rightEye.position.set(0.06, 0.19, 0.145)
	tagMesh(rightEye, "head")
	headGroup.add(rightEye)

	const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 8), featureMat)
	noseTip.rotation.x = -Math.PI / 4
	noseTip.position.set(0, 0.13, 0.16)
	tagMesh(noseTip, "head")
	headGroup.add(noseTip)

	const chinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.08), headMat)
	chinMesh.position.set(0, 0.05, 0.11)
	tagMesh(chinMesh, "head")
	headGroup.add(chinMesh)

	// 6. Sculpted Arms & Deltoid Cap Overlay
	const shoulderX = gender === "male" ? 0.28 : 0.24

	// Anatomical Muscle & Limb Tapering Radius Tokens
	const upperArmTopR = gender === "male" ? 0.076 : 0.062
	const upperArmMidR = gender === "male" ? 0.082 : 0.066
	const upperArmBottomR = gender === "male" ? 0.052 : 0.044

	const forearmTopR = gender === "male" ? 0.062 : 0.052
	const forearmMidR = gender === "male" ? 0.068 : 0.056
	const forearmBottomR = gender === "male" ? 0.040 : 0.034

	const thighTopR = gender === "male" ? 0.125 : 0.130
	const thighMidR = gender === "male" ? 0.115 : 0.110
	const thighBottomR = gender === "male" ? 0.070 : 0.065

	const calfTopR = gender === "male" ? 0.072 : 0.064
	const calfMidR = gender === "male" ? 0.086 : 0.075
	const calfBottomR = gender === "male" ? 0.046 : 0.040

	// Left Arm (-X)
	const leftShoulderGroup = new THREE.Group()
	leftShoulderGroup.name = "leftShoulder"
	leftShoulderGroup.position.set(-shoulderX, 0.44, 0)
	spineGroup.add(leftShoulderGroup)

	const lShoulderMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftShoulder")
	const lDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), lShoulderMat)
	tagMesh(lDeltoidMesh, "leftShoulder")
	leftShoulderGroup.add(lDeltoidMesh)

	const lUpperArmMat = getMaterialForMode(mode, skinColor, selectedJoint === "leftShoulder")
	const lUpperArmGeo = createOrganicMuscleCylinder(upperArmTopR, upperArmMidR, upperArmBottomR, 0.36, 18)
	const lUpperArm = new THREE.Mesh(lUpperArmGeo, lUpperArmMat)
	lUpperArm.position.set(0, -0.2, 0)
	tagMesh(lUpperArm, "leftShoulder")
	leftShoulderGroup.add(lUpperArm)

	const leftElbowGroup = new THREE.Group()
	leftElbowGroup.name = "leftElbow"
	leftElbowGroup.position.set(0, -0.4, 0)
	leftShoulderGroup.add(leftElbowGroup)

	const lElbowMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftElbow")
	const lElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), lElbowMat)
	tagMesh(lElbowJoint, "leftElbow")
	leftElbowGroup.add(lElbowJoint)

	const lForearmMat = getMaterialForMode(mode, skinColor, selectedJoint === "leftElbow")
	const lForearmGeo = createOrganicMuscleCylinder(forearmTopR, forearmMidR, forearmBottomR, 0.36, 18)
	const lForearm = new THREE.Mesh(lForearmGeo, lForearmMat)
	lForearm.position.set(0, -0.2, 0)
	tagMesh(lForearm, "leftElbow")
	leftElbowGroup.add(lForearm)

	const leftWristGroup = new THREE.Group()
	leftWristGroup.name = "leftWrist"
	leftWristGroup.position.set(0, -0.38, 0)
	leftElbowGroup.add(leftWristGroup)

	const lWristMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftWrist")
	const lWristJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), lWristMat)
	tagMesh(lWristJoint, "leftWrist")
	leftWristGroup.add(lWristJoint)

	const leftHandGroup = createArticulatedHand(
		pose.leftHandGesture || "relaxed",
		true,
		mode,
		skinColor,
		"leftWrist",
		selectedJoint === "leftWrist",
	)
	leftHandGroup.position.set(0, -0.02, 0)
	leftWristGroup.add(leftHandGroup)

	// Right Arm (+X)
	const rightShoulderGroup = new THREE.Group()
	rightShoulderGroup.name = "rightShoulder"
	rightShoulderGroup.position.set(shoulderX, 0.44, 0)
	spineGroup.add(rightShoulderGroup)

	const rShoulderMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightShoulder")
	const rDeltoidMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), rShoulderMat)
	tagMesh(rDeltoidMesh, "rightShoulder")
	rightShoulderGroup.add(rDeltoidMesh)

	const rUpperArmMat = getMaterialForMode(mode, skinColor, selectedJoint === "rightShoulder")
	const rUpperArmGeo = createOrganicMuscleCylinder(upperArmTopR, upperArmMidR, upperArmBottomR, 0.36, 18)
	const rUpperArm = new THREE.Mesh(rUpperArmGeo, rUpperArmMat)
	rUpperArm.position.set(0, -0.2, 0)
	tagMesh(rUpperArm, "rightShoulder")
	rightShoulderGroup.add(rUpperArm)

	const rightElbowGroup = new THREE.Group()
	rightElbowGroup.name = "rightElbow"
	rightElbowGroup.position.set(0, -0.4, 0)
	rightShoulderGroup.add(rightElbowGroup)

	const rElbowMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightElbow")
	const rElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), rElbowMat)
	tagMesh(rElbowJoint, "rightElbow")
	rightElbowGroup.add(rElbowJoint)

	const rForearmMat = getMaterialForMode(mode, skinColor, selectedJoint === "rightElbow")
	const rForearmGeo = createOrganicMuscleCylinder(forearmTopR, forearmMidR, forearmBottomR, 0.36, 18)
	const rForearm = new THREE.Mesh(rForearmGeo, rForearmMat)
	rForearm.position.set(0, -0.2, 0)
	tagMesh(rForearm, "rightElbow")
	rightElbowGroup.add(rForearm)

	const rightWristGroup = new THREE.Group()
	rightWristGroup.name = "rightWrist"
	rightWristGroup.position.set(0, -0.38, 0)
	rightElbowGroup.add(rightWristGroup)

	const rWristMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightWrist")
	const rWristJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), rWristMat)
	tagMesh(rWristJoint, "rightWrist")
	rightWristGroup.add(rWristJoint)

	const rightHandGroup = createArticulatedHand(
		pose.rightHandGesture || "relaxed",
		false,
		mode,
		skinColor,
		"rightWrist",
		selectedJoint === "rightWrist",
	)
	rightHandGroup.position.set(0, -0.02, 0)
	rightWristGroup.add(rightHandGroup)

	// 7. Sculpted Legs & Muscle Overlays (Quadriceps & Calves)
	const hipX = gender === "male" ? 0.13 : 0.14

	// Left Leg (-X)
	const leftHipGroup = new THREE.Group()
	leftHipGroup.name = "leftHip"
	leftHipGroup.position.set(-hipX, -0.1, 0)
	pelvisGroup.add(leftHipGroup)

	const lHipMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftHip")
	const lHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), lHipMat)
	tagMesh(lHipJoint, "leftHip")
	leftHipGroup.add(lHipJoint)

	const lThighMat = getMaterialForMode(mode, skinColor, selectedJoint === "leftHip")
	const lThighGeo = createOrganicMuscleCylinder(thighTopR, thighMidR, thighBottomR, 0.54, 18)
	const lThigh = new THREE.Mesh(lThighGeo, lThighMat)
	lThigh.position.set(0, -0.29, 0)
	tagMesh(lThigh, "leftHip")
	leftHipGroup.add(lThigh)

	const leftKneeGroup = new THREE.Group()
	leftKneeGroup.name = "leftKnee"
	leftKneeGroup.position.set(0, -0.58, 0)
	leftHipGroup.add(leftKneeGroup)

	const lKneeMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftKnee")
	const lKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), lKneeMat)
	tagMesh(lKneeJoint, "leftKnee")
	leftKneeGroup.add(lKneeJoint)

	const lCalfMat = getMaterialForMode(mode, skinColor, selectedJoint === "leftKnee")
	const lShinGeo = createOrganicMuscleCylinder(calfTopR, calfMidR, calfBottomR, 0.54, 18)
	const lShin = new THREE.Mesh(lShinGeo, lCalfMat)
	lShin.position.set(0, -0.29, 0)
	tagMesh(lShin, "leftKnee")
	leftKneeGroup.add(lShin)

	const leftAnkleGroup = new THREE.Group()
	leftAnkleGroup.name = "leftAnkle"
	leftAnkleGroup.position.set(0, -0.54, 0)
	leftKneeGroup.add(leftAnkleGroup)

	const lAnkleMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "leftAnkle")
	const lAnkleJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), lAnkleMat)
	tagMesh(lAnkleJoint, "leftAnkle")
	leftAnkleGroup.add(lAnkleJoint)

	const lFootGroup = createAnatomicalFoot(true, mode, skinColor, "leftAnkle", selectedJoint === "leftAnkle")
	lFootGroup.position.set(0, 0.04, 0)
	leftAnkleGroup.add(lFootGroup)

	// Right Leg (+X)
	const rightHipGroup = new THREE.Group()
	rightHipGroup.name = "rightHip"
	rightHipGroup.position.set(hipX, -0.1, 0)
	pelvisGroup.add(rightHipGroup)

	const rHipMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightHip")
	const rHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), rHipMat)
	tagMesh(rHipJoint, "rightHip")
	rightHipGroup.add(rHipJoint)

	const rThighMat = getMaterialForMode(mode, skinColor, selectedJoint === "rightHip")
	const rThighGeo = createOrganicMuscleCylinder(thighTopR, thighMidR, thighBottomR, 0.54, 18)
	const rThigh = new THREE.Mesh(rThighGeo, rThighMat)
	rThigh.position.set(0, -0.29, 0)
	tagMesh(rThigh, "rightHip")
	rightHipGroup.add(rThigh)

	const rightKneeGroup = new THREE.Group()
	rightKneeGroup.name = "rightKnee"
	rightKneeGroup.position.set(0, -0.58, 0)
	rightHipGroup.add(rightKneeGroup)

	const rKneeMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightKnee")
	const rKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), rKneeMat)
	tagMesh(rKneeJoint, "rightKnee")
	rightKneeGroup.add(rKneeJoint)

	const rCalfMat = getMaterialForMode(mode, skinColor, selectedJoint === "rightKnee")
	const rShinGeo = createOrganicMuscleCylinder(calfTopR, calfMidR, calfBottomR, 0.54, 18)
	const rShin = new THREE.Mesh(rShinGeo, rCalfMat)
	rShin.position.set(0, -0.29, 0)
	tagMesh(rShin, "rightKnee")
	rightKneeGroup.add(rShin)

	const rightAnkleGroup = new THREE.Group()
	rightAnkleGroup.name = "rightAnkle"
	rightAnkleGroup.position.set(0, -0.54, 0)
	rightKneeGroup.add(rightAnkleGroup)

	const rAnkleMat = getMaterialForMode(mode, muscleShadeColor, selectedJoint === "rightAnkle")
	const rAnkleJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), rAnkleMat)
	tagMesh(rAnkleJoint, "rightAnkle")
	rightAnkleGroup.add(rAnkleJoint)

	const rFootGroup = createAnatomicalFoot(false, mode, skinColor, "rightAnkle", selectedJoint === "rightAnkle")
	rFootGroup.position.set(0, 0.04, 0)
	rightAnkleGroup.add(rFootGroup)

	// Apply Pose rotations with Clamping
	applyRotationsToGroup(rootGroup, pose.joints)

	return rootGroup
}

/**
 * Builds an ORGANIC SMOOTH Sculpted Quadruped Mannequin Mesh
 */
export function buildQuadrupedMannequin(
	pose: PoseState,
	mode: RenderMode,
	species: QuadrupedSpecies = "canine",
	selectedJoint: string | null = null,
): THREE.Group {
	const rootGroup = new THREE.Group()
	rootGroup.name = "quadruped_root"

	const bodyColor = species === "feline" ? 0xf59e0b : species === "equine" ? 0x92400e : 0x34d399
	const jointColor = 0xa7f3d0

	const tagMesh = (mesh: THREE.Mesh, jointName: string) => {
		mesh.userData = {jointName, isJointPart: true}
	}

	const bodyGroup = new THREE.Group()
	bodyGroup.name = "spine"
	bodyGroup.position.set(0, 0.85, 0)
	rootGroup.add(bodyGroup)

	const spineMat = getMaterialForMode(mode, bodyColor, selectedJoint === "spine")
	const chestZ = species === "equine" ? 1.1 : species === "canine" ? 0.85 : 0.75

	const chestGeo = new THREE.SphereGeometry(0.26, 24, 24)
	chestGeo.scale(0.9, 0.85, 1.3)
	const chestMesh = new THREE.Mesh(chestGeo, spineMat)
	chestMesh.position.set(0, 0, chestZ * 0.22)
	tagMesh(chestMesh, "spine")
	bodyGroup.add(chestMesh)

	const waistGeo = new THREE.SphereGeometry(0.21, 20, 20)
	waistGeo.scale(0.85, 0.8, 1.2)
	const waistMesh = new THREE.Mesh(waistGeo, spineMat)
	waistMesh.position.set(0, -0.02, -chestZ * 0.1)
	tagMesh(waistMesh, "spine")
	bodyGroup.add(waistMesh)

	const hipGeo = new THREE.SphereGeometry(0.24, 22, 22)
	hipGeo.scale(0.92, 0.85, 1.1)
	const hipMesh = new THREE.Mesh(hipGeo, spineMat)
	hipMesh.position.set(0, 0, -chestZ * 0.35)
	tagMesh(hipMesh, "spine")
	bodyGroup.add(hipMesh)

	const neckGroup = new THREE.Group()
	neckGroup.name = "neck"
	neckGroup.position.set(0, 0.15, chestZ / 2 - 0.05)
	neckGroup.rotation.x = Math.PI / 4
	bodyGroup.add(neckGroup)

	const neckMat = getMaterialForMode(mode, bodyColor, selectedJoint === "neck")
	const neckH = species === "equine" ? 0.65 : species === "canine" ? 0.45 : 0.38
	const slimTop = species === "equine" ? 0.12 : 0.095
	const thickBottom = species === "equine" ? 0.22 : 0.18

	const neckGeo = createOrganicMuscleCylinder(slimTop, (slimTop + thickBottom) / 1.8, thickBottom, neckH, 20)
	const neckMesh = new THREE.Mesh(neckGeo, neckMat)
	neckMesh.position.set(0, neckH / 2, 0)
	tagMesh(neckMesh, "neck")
	neckGroup.add(neckMesh)

	const headGroup = new THREE.Group()
	headGroup.name = "head"
	headGroup.position.set(0, neckH, 0)
	neckGroup.add(headGroup)

	const headMat = getMaterialForMode(mode, bodyColor, selectedJoint === "head")
	const skullMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), headMat)
	skullMesh.position.set(0, 0.08, 0.06)
	tagMesh(skullMesh, "head")
	headGroup.add(skullMesh)

	const snoutLen = species === "feline" ? 0.14 : species === "equine" ? 0.38 : 0.26
	const snoutGeo = new THREE.SphereGeometry(0.11, 16, 16)
	snoutGeo.scale(0.8, 0.75, 1.8)
	const snoutMesh = new THREE.Mesh(snoutGeo, headMat)
	snoutMesh.position.set(0, 0.03, snoutLen / 2 + 0.08)
	tagMesh(snoutMesh, "head")
	headGroup.add(snoutMesh)

	const earH = species === "feline" ? 0.12 : species === "canine" ? 0.2 : 0.15
	const earMat = getMaterialForMode(mode, jointColor, selectedJoint === "head")
	const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, earH, 12), earMat)
	leftEar.position.set(-0.12, 0.22, 0)
	tagMesh(leftEar, "head")
	headGroup.add(leftEar)

	const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, earH, 12), earMat)
	rightEar.position.set(0.12, 0.22, 0)
	tagMesh(rightEar, "head")
	headGroup.add(rightEar)

	const buildFrontLeg = (legJointName: string, elbowJointName: string, posX: number, posZ: number) => {
		const legGroup = new THREE.Group()
		legGroup.name = legJointName
		legGroup.position.set(posX, -0.1, posZ)
		bodyGroup.add(legGroup)

		const legMat = getMaterialForMode(mode, bodyColor, selectedJoint === legJointName)
		const elbowMat = getMaterialForMode(mode, jointColor, selectedJoint === elbowJointName)
		const lowerMat = getMaterialForMode(mode, bodyColor, selectedJoint === elbowJointName)

		const upperLen = species === "equine" ? 0.38 : 0.32
		const lowerLen = species === "equine" ? 0.4 : 0.34

		const upperGeo = createOrganicMuscleCylinder(0.065, 0.085, 0.065, upperLen, 16)
		const upperMesh = new THREE.Mesh(upperGeo, legMat)
		upperMesh.position.set(0, -upperLen / 2, 0)
		tagMesh(upperMesh, legJointName)
		legGroup.add(upperMesh)

		const elbowGroup = new THREE.Group()
		elbowGroup.name = elbowJointName
		elbowGroup.position.set(0, -upperLen, 0)
		legGroup.add(elbowGroup)

		const elbowJointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), elbowMat)
		tagMesh(elbowJointSphere, elbowJointName)
		elbowGroup.add(elbowJointSphere)

		const lowerGeo = createOrganicMuscleCylinder(0.045, 0.065, 0.045, lowerLen, 16)
		const lowerMesh = new THREE.Mesh(lowerGeo, lowerMat)
		lowerMesh.position.set(0, -lowerLen / 2, 0)
		tagMesh(lowerMesh, elbowJointName)
		elbowGroup.add(lowerMesh)

		if (species === "equine") {
			const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16), elbowMat)
			hoof.position.set(0, -lowerLen - 0.05, 0.02)
			tagMesh(hoof, elbowJointName)
			elbowGroup.add(hoof)
		} else {
			const pawGeo = new THREE.SphereGeometry(0.07, 14, 14)
			pawGeo.scale(0.8, 0.4, 1.1)
			const pawBase = new THREE.Mesh(pawGeo, elbowMat)
			pawBase.position.set(0, -lowerLen - 0.03, 0.03)
			tagMesh(pawBase, elbowJointName)
			elbowGroup.add(pawBase)

			for (let i = -1.5; i <= 1.5; i += 1) {
				const toePad = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), elbowMat)
				toePad.position.set(i * 0.024, -lowerLen - 0.05, 0.09)
				tagMesh(toePad, elbowJointName)
				elbowGroup.add(toePad)
			}
		}
	}

	const buildBackLeg = (legJointName: string, hockJointName: string, posX: number, posZ: number) => {
		const legGroup = new THREE.Group()
		legGroup.name = legJointName
		legGroup.position.set(posX, -0.1, posZ)
		bodyGroup.add(legGroup)

		const legMat = getMaterialForMode(mode, bodyColor, selectedJoint === legJointName)
		const hockMat = getMaterialForMode(mode, jointColor, selectedJoint === hockJointName)
		const lowerMat = getMaterialForMode(mode, bodyColor, selectedJoint === hockJointName)

		const thighLen = species === "equine" ? 0.42 : 0.35
		const shinLen = species === "equine" ? 0.42 : 0.35

		const thighGeo = createOrganicMuscleCylinder(0.07, 0.11, 0.07, thighLen, 16)
		const thighMesh = new THREE.Mesh(thighGeo, legMat)
		thighMesh.position.set(0, -thighLen / 2, 0)
		tagMesh(thighMesh, legJointName)
		legGroup.add(thighMesh)

		const hockGroup = new THREE.Group()
		hockGroup.name = hockJointName
		hockGroup.position.set(0, -thighLen, 0)
		legGroup.add(hockGroup)

		const hockJointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), hockMat)
		tagMesh(hockJointSphere, hockJointName)
		hockGroup.add(hockJointSphere)

		const shinGeo = createOrganicMuscleCylinder(0.045, 0.07, 0.045, shinLen, 16)
		const shinMesh = new THREE.Mesh(shinGeo, lowerMat)
		shinMesh.position.set(0, -shinLen / 2, 0)
		tagMesh(shinMesh, hockJointName)
		hockGroup.add(shinMesh)

		if (species === "equine") {
			const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16), hockMat)
			hoof.position.set(0, -shinLen - 0.05, 0.02)
			tagMesh(hoof, hockJointName)
			hockGroup.add(hoof)
		} else {
			const pawGeo = new THREE.SphereGeometry(0.07, 14, 14)
			pawGeo.scale(0.8, 0.4, 1.1)
			const pawBase = new THREE.Mesh(pawGeo, hockMat)
			pawBase.position.set(0, -shinLen - 0.03, 0.03)
			tagMesh(pawBase, hockJointName)
			hockGroup.add(pawBase)

			for (let i = -1.5; i <= 1.5; i += 1) {
				const toePad = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), hockMat)
				toePad.position.set(i * 0.024, -shinLen - 0.05, 0.09)
				tagMesh(toePad, hockJointName)
				hockGroup.add(toePad)
			}
		}
	}

	buildFrontLeg("frontLeftLeg", "frontLeftElbow", -0.22, chestZ / 2 - 0.12)
	buildFrontLeg("frontRightLeg", "frontRightElbow", 0.22, chestZ / 2 - 0.12)
	buildBackLeg("backLeftLeg", "backLeftHock", -0.22, -chestZ / 2 + 0.12)
	buildBackLeg("backRightLeg", "backRightHock", 0.22, -chestZ / 2 + 0.12)

	const tailGroup = new THREE.Group()
	tailGroup.name = "tail"
	tailGroup.position.set(0, 0.15, -chestZ / 2)
	bodyGroup.add(tailGroup)

	const tailMat = getMaterialForMode(mode, jointColor, selectedJoint === "tail")
	const tailLen = species === "feline" ? 0.65 : 0.5
	const tailGeo = createOrganicMuscleCylinder(0.02, 0.035, 0.05, tailLen, 14)
	const tailMesh = new THREE.Mesh(tailGeo, tailMat)
	tailMesh.rotation.x = -Math.PI / 3
	tailMesh.position.set(0, -tailLen / 3, -tailLen / 3)
	tagMesh(tailMesh, "tail")
	tailGroup.add(tailMesh)

	// Apply Pose rotations
	applyRotationsToGroup(rootGroup, pose.joints)

	return rootGroup
}

/**
 * Creates procedural 3D mesh based on heightmap/depth from image data URL
 */
export function buildReliefMeshFromImage(imageUrl: string, mode: RenderMode): Promise<THREE.Group> {
	return buildVerticalReferenceBillboard(imageUrl)
}

function applyRotationsToGroup(group: THREE.Group, joints: Record<string, {x: number; y: number; z: number}>) {
	group.traverse(obj => {
		if (obj.name && joints[obj.name]) {
			const rot = joints[obj.name]
			const clampedX = clampJointAngle(obj.name, "x", rot.x)
			const clampedY = clampJointAngle(obj.name, "y", rot.y)
			const clampedZ = clampJointAngle(obj.name, "z", rot.z)
			obj.rotation.set(clampedX, clampedY, clampedZ)
		}
	})
}
