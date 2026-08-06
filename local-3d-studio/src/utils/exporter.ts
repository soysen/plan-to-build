import * as THREE from 'three';

/**
 * Downloads a high-resolution PNG snapshot from Three.js renderer canvas
 */
export function captureStudioSnapshot(
  renderer: THREE.WebGLRenderer,
  filename: string = 'studio_pose_reference.png'
): string {
  renderer.render(renderer.getContext() as any, renderer.getContext() as any);
  const dataUrl = renderer.domElement.toDataURL('image/png');

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}

/**
 * Serializes a Three.js 3D Group into Wavefront OBJ format text string
 */
export function exportGroupToOBJ(group: THREE.Group): string {
  let output = `# Local 3D Studio - Exported OBJ Model\n`;
  output += `# Created on ${new Date().toISOString()}\n\n`;

  let vertexOffset = 1;
  let normalOffset = 1;

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);

      const posAttr = geometry.attributes.position;
      const normalAttr = geometry.attributes.normal;

      output += `o ${mesh.name || 'Object_' + mesh.id}\n`;

      // Vertices
      for (let i = 0; i < posAttr.count; i++) {
        output += `v ${posAttr.getX(i).toFixed(5)} ${posAttr.getY(i).toFixed(5)} ${posAttr.getZ(i).toFixed(5)}\n`;
      }

      // Normals
      if (normalAttr) {
        for (let i = 0; i < normalAttr.count; i++) {
          output += `vn ${normalAttr.getX(i).toFixed(5)} ${normalAttr.getY(i).toFixed(5)} ${normalAttr.getZ(i).toFixed(5)}\n`;
        }
      }

      // Faces
      const indexAttr = geometry.index;
      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const a = indexAttr.getX(i) + vertexOffset;
          const b = indexAttr.getX(i + 1) + vertexOffset;
          const c = indexAttr.getX(i + 2) + vertexOffset;

          if (normalAttr) {
            const na = indexAttr.getX(i) + normalOffset;
            const nb = indexAttr.getX(i + 1) + normalOffset;
            const nc = indexAttr.getX(i + 2) + normalOffset;
            output += `f ${a}//${na} ${b}//${nb} ${c}//${nc}\n`;
          } else {
            output += `f ${a} ${b} ${c}\n`;
          }
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const a = i + vertexOffset;
          const b = i + 1 + vertexOffset;
          const c = i + 2 + vertexOffset;
          output += `f ${a} ${b} ${c}\n`;
        }
      }

      vertexOffset += posAttr.count;
      if (normalAttr) {
        normalOffset += normalAttr.count;
      }
      output += `\n`;
    }
  });

  return output;
}

/**
 * Downloads a generated OBJ text file
 */
export function downloadOBJFile(group: THREE.Group, filename: string = 'model.obj'): void {
  const objContent = exportGroupToOBJ(group);
  const blob = new Blob([objContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
