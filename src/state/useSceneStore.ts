import { create } from 'zustand';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { ObjectLoader } from 'three';
import { ensureEditorId, findObjectByEditorId, markHelper, cloneWithoutHelpers } from '@/utils/scene';

const HISTORY_LIMIT = 30;

type SceneJSON = ReturnType<THREE.Scene['toJSON']>;

export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface SceneHistoryEntry {
  json: SceneJSON;
}

type HelperVisibility = {
  grid: boolean;
  axes: boolean;
};

type SceneStore = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer | null;
  orbit: OrbitControls | null;
  transform: TransformControls | null;
  selectedId?: string;
  transformMode: TransformMode;
  helpers: HelperVisibility;
  revision: number;
  history: SceneHistoryEntry[];
  historyIndex: number;
  setRenderer: (renderer: THREE.WebGLRenderer | null) => void;
  setOrbit: (orbit: OrbitControls | null) => void;
  setTransform: (transform: TransformControls | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  addPrimitive: (type: 'cube' | 'sphere' | 'plane') => void;
  addLight: (type: 'ambient' | 'directional' | 'point') => void;
  addCamera: () => void;
  removeSelected: () => void;
  selectObject: (id?: string) => void;
  renameSelected: (name: string) => void;
  updateSelectedTransform: (updates: Partial<{
    position: THREE.Vector3 | [number, number, number];
    rotation: THREE.Euler | [number, number, number];
    scale: THREE.Vector3 | [number, number, number];
  }>) => void;
  setSelectedVisibility: (visible: boolean) => void;
  updateMaterial: (updates: Partial<{
    color: string;
    metalness: number;
    roughness: number;
    emissive: string;
  }>) => void;
  toggleHelper: (helper: keyof HelperVisibility) => void;
  focusSelected: () => void;
  resetCamera: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  loadFromJSON: (json: SceneJSON) => void;
  importObject: (object: THREE.Object3D, name?: string) => void;
  exportGLTF: () => Promise<Blob>;
  serializeScene: () => SceneHistoryEntry;
  captureScreenshot: () => string | undefined;
  setBackground: (color: string) => void;
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a1a');

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(8, 6, 12);
camera.lookAt(0, 0, 0);

const gridHelper = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
markHelper(gridHelper);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
markHelper(axesHelper);
scene.add(axesHelper);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
ambient.name = 'Ambient Light';
ensureEditorId(ambient);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.7);
directional.position.set(5, 10, 7);
directional.name = 'Directional Light';
ensureEditorId(directional);
scene.add(directional);

const point = new THREE.PointLight(0xffffff, 0.5, 50);
point.position.set(-6, 6, -2);
point.name = 'Point Light';
ensureEditorId(point);
scene.add(point);

const loader = new ObjectLoader();

const createPrimitive = (type: 'cube' | 'sphere' | 'plane') => {
  let geometry: THREE.BufferGeometry;
  switch (type) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(1, 32, 32);
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(4, 4);
      break;
    case 'cube':
    default:
      geometry = new THREE.BoxGeometry(2, 2, 2);
      break;
  }
  const material = new THREE.MeshStandardMaterial({
    color: '#6c9ced',
    metalness: 0.2,
    roughness: 0.7
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.floor(Math.random() * 1000)}`;
  ensureEditorId(mesh);
  return mesh;
};

const createLight = (type: 'ambient' | 'directional' | 'point') => {
  let light: THREE.Light;
  switch (type) {
    case 'directional':
      light = new THREE.DirectionalLight(0xffffff, 0.8);
      light.position.set(6, 10, 6);
      break;
    case 'point':
      light = new THREE.PointLight(0xffffff, 0.8, 60);
      light.position.set(0, 6, 0);
      break;
    case 'ambient':
    default:
      light = new THREE.AmbientLight(0xffffff, 0.3);
      break;
  }
  light.name = `${type.charAt(0).toUpperCase() + type.slice(1)} Light`;
  ensureEditorId(light);
  return light;
};

const createEditorCamera = () => {
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  cam.position.set(0, 5, 8);
  cam.lookAt(0, 0, 0);
  cam.name = `Camera ${Math.floor(Math.random() * 1000)}`;
  ensureEditorId(cam);
  return cam;
};

const addObjectToScene = (object: THREE.Object3D) => {
  ensureEditorId(object);
  scene.add(object);
};

const extractHistoryEntry = (): SceneHistoryEntry => {
  const clone = cloneWithoutHelpers(scene);
  const json = clone.toJSON() as SceneJSON;
  return { json };
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  scene,
  camera,
  renderer: null,
  orbit: null,
  transform: null,
  selectedId: undefined,
  transformMode: 'translate',
  helpers: {
    grid: true,
    axes: true
  },
  revision: 0,
  history: [],
  historyIndex: -1,
  setRenderer: (renderer) => set({ renderer }),
  setOrbit: (orbit) => set({ orbit }),
  setTransform: (transform) => set({ transform }),
  setTransformMode: (mode) => {
    const transform = get().transform;
    if (transform) {
      transform.setMode(mode);
    }
    set({ transformMode: mode });
  },
  addPrimitive: (type) => {
    const mesh = createPrimitive(type);
    addObjectToScene(mesh);
    get().pushHistory();
    set({ revision: get().revision + 1, selectedId: mesh.userData.editorId });
  },
  addLight: (type) => {
    const light = createLight(type);
    addObjectToScene(light);
    get().pushHistory();
    set({ revision: get().revision + 1, selectedId: light.userData.editorId });
  },
  addCamera: () => {
    const cam = createEditorCamera();
    addObjectToScene(cam);
    get().pushHistory();
    set({ revision: get().revision + 1, selectedId: cam.userData.editorId });
  },
  removeSelected: () => {
    const { selectedId } = get();
    const target = findObjectByEditorId(scene, selectedId);
    if (target && target.parent) {
      target.parent.remove(target);
      const transform = get().transform;
      if (transform && transform.object === target) {
        transform.detach();
      }
      set({ selectedId: undefined });
      get().pushHistory();
      set({ revision: get().revision + 1 });
    }
  },
  renameSelected: (name) => {
    const target = findObjectByEditorId(scene, get().selectedId);
    if (!target) return;
    target.name = name;
    set({ revision: get().revision + 1 });
  },
  selectObject: (id) => {
    const transform = get().transform;
    const target = findObjectByEditorId(scene, id);
    if (transform) {
      if (target) {
        transform.attach(target);
      } else {
        transform.detach();
      }
    }
    set({ selectedId: id, revision: get().revision + 1 });
  },
  updateSelectedTransform: (updates) => {
    const { selectedId } = get();
    const target = findObjectByEditorId(scene, selectedId);
    if (!target) return;
    if (updates.position) {
      const pos = updates.position instanceof THREE.Vector3 ? updates.position : new THREE.Vector3(...updates.position);
      target.position.copy(pos);
    }
    if (updates.rotation) {
      const rot = updates.rotation instanceof THREE.Euler ? updates.rotation : new THREE.Euler(...updates.rotation);
      target.rotation.copy(rot);
    }
    if (updates.scale) {
      const scl = updates.scale instanceof THREE.Vector3 ? updates.scale : new THREE.Vector3(...updates.scale);
      target.scale.copy(scl);
    }
    const transform = get().transform;
    transform?.updateMatrixWorld(true);
    set({ revision: get().revision + 1 });
  },
  setSelectedVisibility: (visible) => {
    const target = findObjectByEditorId(scene, get().selectedId);
    if (!target) return;
    target.visible = visible;
    set({ revision: get().revision + 1 });
  },
  updateMaterial: (updates) => {
    const target = findObjectByEditorId(scene, get().selectedId);
    if (!target) return;
    if ((target as THREE.Mesh).isMesh) {
      const mesh = target as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (!material) return;
      if (updates.color) {
        material.color.set(updates.color);
      }
      if (typeof updates.metalness === 'number') {
        material.metalness = updates.metalness;
      }
      if (typeof updates.roughness === 'number') {
        material.roughness = updates.roughness;
      }
      if (updates.emissive) {
        material.emissive.set(updates.emissive);
      }
      material.needsUpdate = true;
      set({ revision: get().revision + 1 });
    }
  },
  toggleHelper: (helper) => {
    const newHelpers = { ...get().helpers, [helper]: !get().helpers[helper] };
    gridHelper.visible = newHelpers.grid;
    axesHelper.visible = newHelpers.axes;
    set({ helpers: newHelpers, revision: get().revision + 1 });
  },
  focusSelected: () => {
    const target = findObjectByEditorId(scene, get().selectedId);
    const orbit = get().orbit;
    if (!target || !orbit) return;

    const box = new THREE.Box3().setFromObject(target);
    if (box.isEmpty()) {
      orbit.target.copy(target.getWorldPosition(new THREE.Vector3()));
    } else {
      const center = box.getCenter(new THREE.Vector3());
      orbit.target.copy(center);
    }

    const camera = get().camera;
    const distance = Math.max(box.getSize(new THREE.Vector3()).length() * 0.8, 6);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, orbit.target)
      .normalize();
    camera.position.copy(orbit.target.clone().add(direction.multiplyScalar(distance)));
    camera.updateProjectionMatrix();
    orbit.update();
    set({ revision: get().revision + 1 });
  },
  resetCamera: () => {
    const orbit = get().orbit;
    const camera = get().camera;
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 0, 0);
    orbit?.target.set(0, 1, 0);
    orbit?.update();
    set({ revision: get().revision + 1 });
  },
  pushHistory: () => {
    const entry = extractHistoryEntry();
    set((state) => {
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      trimmed.push(entry);
      if (trimmed.length > HISTORY_LIMIT) {
        trimmed.shift();
      }
      const newIndex = trimmed.length - 1;
      return { history: trimmed, historyIndex: newIndex };
    });
  },
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    if (entry) {
      get().loadFromJSON(entry.json);
      set({ historyIndex: historyIndex - 1, revision: get().revision + 1 });
    }
  },
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    if (entry) {
      get().loadFromJSON(entry.json);
      set({ historyIndex: historyIndex + 1, revision: get().revision + 1 });
    }
  },
  loadFromJSON: (json) => {
    const parsed = loader.parse(json);
    const helpers = scene.children.filter((child) => child.userData?.isHelper);
    scene.clear();
    helpers.forEach((helper) => scene.add(helper));
    parsed.children.forEach((child) => {
      ensureEditorId(child);
      scene.add(child);
    });
    set({ revision: get().revision + 1 });
  },
  importObject: (object, name) => {
    ensureEditorId(object);
    if (name) object.name = name;
    scene.add(object);
    get().pushHistory();
    set({ revision: get().revision + 1, selectedId: object.userData.editorId });
  },
  exportGLTF: () => {
    const exporter = new GLTFExporter();
    const clone = cloneWithoutHelpers(scene);
    return new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        clone,
        (result) => {
          try {
            const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'model/gltf-binary' }) : new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error),
        { binary: true }
      );
    });
  },
  serializeScene: () => extractHistoryEntry(),
  captureScreenshot: () => {
    const renderer = get().renderer;
    if (!renderer) return undefined;
    return renderer.domElement.toDataURL('image/png');
  },
  setBackground: (color) => {
    scene.background = new THREE.Color(color);
    set({ revision: get().revision + 1 });
  }
}));

scene.updateMatrixWorld(true);

export type SceneStoreType = SceneStore;

useSceneStore.getState().pushHistory();
