import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useSceneStore } from '@/state/useSceneStore';
import { findObjectByEditorId, isHelper, markHelper } from '@/utils/scene';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const Viewport = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene = useSceneStore((state) => state.scene);
  const camera = useSceneStore((state) => state.camera);
  const setRenderer = useSceneStore((state) => state.setRenderer);
  const setOrbit = useSceneStore((state) => state.setOrbit);
  const setTransform = useSceneStore((state) => state.setTransform);
  const selectObject = useSceneStore((state) => state.selectObject);
  const pushHistory = useSceneStore((state) => state.pushHistory);
  const selectedId = useSceneStore((state) => state.selectedId);
  const transformMode = useSceneStore((state) => state.transformMode);
  const helpers = useSceneStore((state) => state.helpers);
  const toggleHelper = useSceneStore((state) => state.toggleHelper);
  const focusSelected = useSceneStore((state) => state.focusSelected);
  const resetCamera = useSceneStore((state) => state.resetCamera);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 120;
    controls.minDistance = 2;
    controls.target.set(0, 1, 0);
    controls.update();

    const transformControls = new TransformControls(camera, renderer.domElement);
    markHelper(transformControls);
    transformControls.setMode(transformMode);
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
      if (!event.value) {
        pushHistory();
      }
    });
    transformControls.addEventListener('objectChange', () => {
      renderer.render(scene, camera);
    });
    scene.add(transformControls);

    setRenderer(renderer);
    setOrbit(controls);
    setTransform(transformControls);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let animationFrame: number;
    const renderLoop = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const objects: THREE.Object3D[] = [];
      scene.traverseVisible((object) => {
        if (isHelper(object)) return;
        if ((object as THREE.Mesh).isMesh || (object as THREE.Light).isLight || (object as THREE.Camera).isCamera) {
          objects.push(object);
        }
      });

      const intersects = raycaster.intersectObjects(objects, true);
      if (intersects.length > 0) {
        let target: THREE.Object3D | null = intersects[0].object;
        while (target && !target.userData?.editorId && target.parent) {
          if (target.parent === scene) break;
          target = target.parent;
        }
        const editorId = target?.userData?.editorId;
        selectObject(editorId);
      } else {
        selectObject(undefined);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const onDoubleClick = () => {
      focusSelected();
    };

    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      transformControls.detach();
      scene.remove(transformControls);
      renderer.dispose();
      setRenderer(null);
      setOrbit(null);
      setTransform(null);
    };
  }, []);

  useEffect(() => {
    const transform = useSceneStore.getState().transform;
    if (!transform) return;
    transform.setMode(transformMode);
  }, [transformMode]);

  useEffect(() => {
    const transform = useSceneStore.getState().transform;
    const target = findObjectByEditorId(scene, selectedId);
    if (transform) {
      if (target) {
        transform.attach(target);
      } else {
        transform.detach();
      }
    }
  }, [scene, selectedId]);

  return (
    <div ref={containerRef} className="viewport-canvas">
      <div className="viewport-overlay">
        <div className="viewport-overlay-group">
          <button type="button" onClick={resetCamera}>
            重置视角
          </button>
          <button type="button" onClick={focusSelected} disabled={!selectedId}>
            对齐选中
          </button>
        </div>
        <div className="viewport-overlay-group">
          <button type="button" className={helpers.grid ? 'active' : ''} onClick={() => toggleHelper('grid')}>
            网格
          </button>
          <button type="button" className={helpers.axes ? 'active' : ''} onClick={() => toggleHelper('axes')}>
            坐标轴
          </button>
        </div>
      </div>
      <div className="viewport-hint">
        <span>拖拽旋转 · 右键平移 · 滚轮缩放</span>
      </div>
    </div>
  );
};

export default Viewport;
