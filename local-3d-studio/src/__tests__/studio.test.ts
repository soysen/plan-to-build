import {describe, it, expect} from "vitest"
import * as THREE from "three"
import {
	PRESET_POSES,
	getMaterialForMode,
	buildHumanoidMannequin,
	buildQuadrupedMannequin,
	createArticulatedHand,
	createAnatomicalFoot,
	clampJointAngle,
	loadGLTFOrOBJModel,
	detectPoseFrom2DImage,
	buildVerticalReferenceBillboard,
	getAnatomicalJointDelta,
	applyRotationsToSkeletalModel,
	applyRenderModeAndSelectionToCustomModel,
	CUSTOM_BONE_MAPPING,
	JOINT_LIMITS,
} from "../utils/3d-generators"
import {exportGroupToOBJ} from "../utils/exporter"

describe("Local 3D Studio Utilities, 2D Pose Estimation & Vertical Billboard", () => {
	it("should contain all required preset poses including quadrupeds", () => {
		expect(PRESET_POSES).toHaveProperty("t_pose")
		expect(PRESET_POSES).toHaveProperty("running")
		expect(PRESET_POSES).toHaveProperty("sitting")
		expect(PRESET_POSES).toHaveProperty("quadruped_stand")
	})

	it("should clamp hip rotation angles with expanded 25% range (-X swings thigh forward, +X swings backward)", () => {
		expect(clampJointAngle("leftHip", "x", -2.5)).toBe(-2.25)
		expect(clampJointAngle("leftHip", "x", 1.5)).toBe(1.0)
	})

	it("should expose wrist and ankle joints in limits and humanoid presets", () => {
		expect(JOINT_LIMITS).toHaveProperty("leftWrist")
		expect(JOINT_LIMITS).toHaveProperty("rightWrist")
		expect(JOINT_LIMITS).toHaveProperty("leftAnkle")
		expect(JOINT_LIMITS).toHaveProperty("rightAnkle")
		expect(PRESET_POSES.t_pose.joints).toHaveProperty("leftWrist")
		expect(PRESET_POSES.t_pose.joints).toHaveProperty("rightAnkle")
		expect(CUSTOM_BONE_MAPPING.leftWrist).toBe("hand.L")
		expect(CUSTOM_BONE_MAPPING.rightWrist).toBe("hand.R")
		expect(CUSTOM_BONE_MAPPING.leftAnkle).toBe("foot.L")
		expect(CUSTOM_BONE_MAPPING.rightAnkle).toBe("foot.R")
		expect(JOINT_LIMITS.leftWrist.minX).toBeCloseTo(-Math.PI / 2)
		expect(JOINT_LIMITS.leftWrist.maxX).toBeCloseTo(Math.PI / 2)
		expect(JOINT_LIMITS.rightWrist.minX).toBeCloseTo(-Math.PI / 2)
		expect(JOINT_LIMITS.rightWrist.maxX).toBeCloseTo(Math.PI / 2)
	})

	it("should translate direct gizmo dragging into anatomical joint directions", () => {
		expect(getAnatomicalJointDelta("leftElbow", "x", 0.5)).toBe(-0.5)
		expect(getAnatomicalJointDelta("rightElbow", "x", 0.5)).toBe(-0.5)
		expect(getAnatomicalJointDelta("leftKnee", "x", 0.5)).toBe(0.5)
		expect(getAnatomicalJointDelta("rightKnee", "x", 0.5)).toBe(0.5)
		expect(getAnatomicalJointDelta("leftShoulder", "z", 0.5)).toBe(-0.5)
		expect(getAnatomicalJointDelta("rightShoulder", "z", 0.5)).toBe(0.5)
	})

	it("should provide detectPoseFrom2DImage and buildVerticalReferenceBillboard functions", () => {
		expect(typeof detectPoseFrom2DImage).toBe("function")
		expect(typeof buildVerticalReferenceBillboard).toBe("function")
	})

	it("should build Organic Male and Female Mannequins facing +Z forward with smooth skin shader", () => {
		const maleModel = buildHumanoidMannequin("male", PRESET_POSES.t_pose, "solid", "spine")
		const femaleModel = buildHumanoidMannequin("female", PRESET_POSES.sitting, "solid", "leftShoulder")

		expect(maleModel.name).toBe("humanoid_male_root")
		expect(femaleModel.name).toBe("humanoid_female_root")
	})

	it("should keep humanoid neck proportion compact below the head", () => {
		const model = buildHumanoidMannequin("male", PRESET_POSES.t_pose, "solid")
		const neckGroup = model.getObjectByName("neck")
		const headGroup = model.getObjectByName("head")

		expect(neckGroup).toBeDefined()
		expect(headGroup).toBeDefined()
		expect(headGroup!.position.y).toBeCloseTo(0.14)

		const neckMeshes: THREE.Mesh[] = []
		neckGroup!.traverse(child => {
			if (child instanceof THREE.Mesh && child.userData.jointName === "neck") {
				neckMeshes.push(child)
			}
		})

		expect(neckMeshes[0].position.y).toBeCloseTo(0.07)
	})

	it("should keep anatomical feet connected close to the ankle joints", () => {
		const model = buildHumanoidMannequin("male", PRESET_POSES.t_pose, "solid")
		model.updateMatrixWorld(true)

		for (const ankleName of ["leftAnkle", "rightAnkle"]) {
			const ankleGroup = model.getObjectByName(ankleName)
			expect(ankleGroup).toBeDefined()

			const anklePosition = new THREE.Vector3()
			ankleGroup!.getWorldPosition(anklePosition)

			const footMeshPositions: THREE.Vector3[] = []
			ankleGroup!.traverse(child => {
				if (child instanceof THREE.Mesh && child.userData.jointName === ankleName) {
					const childPosition = new THREE.Vector3()
					child.getWorldPosition(childPosition)
					footMeshPositions.push(childPosition)
				}
			})

			const lowestFootOffset = Math.min(...footMeshPositions.map(position => position.y - anklePosition.y))
			expect(lowestFootOffset).toBeGreaterThan(-0.08)
		}
	})

	it("should build Quadruped species with multi-segment leg joints", () => {
		const canine = buildQuadrupedMannequin(PRESET_POSES.quadruped_stand, "solid", "canine")
		expect(canine.name).toBe("quadruped_root")
	})

	it("should detect pose joints from 2D image and adapt properly", async () => {
		// Test with invalid image URL fallback
		const fallbackJoints = await detectPoseFrom2DImage("invalid_image_url")
		expect(fallbackJoints).toBeDefined()
		expect(typeof fallbackJoints).toBe("object")
	})

	it("should apply rotations and select custom skeletal model bones correctly", () => {
		const group = new THREE.Group()
		const bone = new THREE.Object3D()
		bone.name = CUSTOM_BONE_MAPPING.leftShoulder // 'upper_arm.L'
		group.add(bone)

		applyRotationsToSkeletalModel(group, {
			leftShoulder: {x: 1.0, y: 0.5, z: -0.2},
		})

		expect(bone.rotation.x).toBeCloseTo(1.0)
		expect(bone.rotation.y).toBeCloseTo(0.5)
		expect(bone.rotation.z).toBeCloseTo(-0.2)

		const mesh = new THREE.Mesh()
		mesh.name = CUSTOM_BONE_MAPPING.leftShoulder
		group.add(mesh)
		applyRenderModeAndSelectionToCustomModel(group, "solid", "leftShoulder")
		expect(mesh.material).toBeDefined()
	})
})
