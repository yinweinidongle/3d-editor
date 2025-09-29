import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const objLoader = new OBJLoader();

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });

export const loadObjectFromFile = async (file: File): Promise<THREE.Object3D> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    throw new Error('Unsupported file format');
  }

  if (extension === 'obj') {
    const text = await readFileAsText(file);
    const object = objLoader.parse(text);
    return object;
  }

  if (extension === 'gltf' || extension === 'glb') {
    const url = URL.createObjectURL(file);
    try {
      const result = await gltfLoader.loadAsync(url);
      const root = result.scene || result.scenes[0];
      if (!root) {
        throw new Error('Invalid GLTF file');
      }
      return root;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  if (extension === 'fbx') {
    const url = URL.createObjectURL(file);
    try {
      const object = await fbxLoader.loadAsync(url);
      return object;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  throw new Error(`Unsupported file extension: ${extension}`);
};
