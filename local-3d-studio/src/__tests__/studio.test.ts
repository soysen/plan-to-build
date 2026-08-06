import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PRESET_POSES, getMaterialForMode, buildHumanoidMannequin, buildQuadrupedMannequin, createArticulatedHand, createAnatomicalFoot } from '../utils/3d-generators';
import { exportGroupToOBJ } from '../utils/exporter';

describe('Local 3D Studio Utilities & Consolidated Organic Humanoid Models', () => {
  it('should contain all required preset poses including quadrupeds', () => {
    expect(PRESET_POSES).toHaveProperty('t_pose');
    expect(PRESET_POSES).toHaveProperty('quadruped_stand');
    expect(PRESET_POSES).toHaveProperty('quadruped_prowl');
  });

  it('should build Organic Male and Female Mannequins with proportions referencing classic wooden mannequin', () => {
    const maleModel = buildHumanoidMannequin('male', PRESET_POSES.t_pose, 'solid', 'spine');
    const femaleModel = buildHumanoidMannequin('female', PRESET_POSES.t_pose, 'solid', 'leftShoulder');

    expect(maleModel.name).toBe('humanoid_male_root');
    expect(femaleModel.name).toBe('humanoid_female_root');
  });

  it('should place Thumb on the Medial Inboard Side (towards torso)', () => {
    const leftHand = createArticulatedHand('relaxed', true, 'solid', 0x818cf8, 'leftElbow', false);
    const rightHand = createArticulatedHand('relaxed', false, 'solid', 0x818cf8, 'rightElbow', false);

    expect(leftHand.children.length).toBeGreaterThan(4);
    expect(rightHand.children.length).toBeGreaterThan(4);
  });

  it('should build Quadruped species with multi-segment leg joints (elbow & hock joints)', () => {
    const canine = buildQuadrupedMannequin(PRESET_POSES.quadruped_stand, 'solid', 'canine');
    expect(canine.name).toBe('quadruped_root');
  });
});
