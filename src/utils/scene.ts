import * as THREE from 'three';
import { createEditorId } from './id';

export interface SceneNode {
  object: THREE.Object3D;
  children: SceneNode[];
}

export const ensureEditorId = (object: THREE.Object3D) => {
  if (!object.userData.editorId) {
    object.userData.editorId = createEditorId();
  }
  return object.userData.editorId as string;
};

export const getEditorId = (object: THREE.Object3D) => {
  return ensureEditorId(object);
};

export const markHelper = (object: THREE.Object3D) => {
  object.userData.isHelper = true;
};

export const isHelper = (object: THREE.Object3D) => {
  return Boolean(object.userData?.isHelper);
};

export const buildSceneGraph = (root: THREE.Object3D): SceneNode[] => {
  const children: SceneNode[] = [];
  root.children.forEach((child) => {
    if (isHelper(child)) return;
    ensureEditorId(child);
    children.push({
      object: child,
      children: buildSceneGraph(child)
    });
  });
  return children;
};

export const findObjectByEditorId = (root: THREE.Object3D, editorId?: string | null): THREE.Object3D | undefined => {
  if (!editorId) return undefined;
  const queue: THREE.Object3D[] = [...root.children];
  while (queue.length) {
    const obj = queue.shift()!;
    if (isHelper(obj)) {
      queue.push(...obj.children);
      continue;
    }
    if (obj.userData?.editorId === editorId) {
      return obj;
    }
    queue.push(...obj.children);
  }
  return undefined;
};

export const collectSerializableChildren = (scene: THREE.Scene) => {
  return scene.children.filter((child) => !isHelper(child));
};

export const cloneWithoutHelpers = (scene: THREE.Scene) => {
  const clone = new THREE.Scene();
  collectSerializableChildren(scene).forEach((child) => {
    clone.add(child.clone(true));
  });
  return clone;
};
