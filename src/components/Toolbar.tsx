import { useRef, useState } from 'react';
import { useSceneStore } from '@/state/useSceneStore';
import { loadObjectFromFile } from '@/utils/importers';
import { saveBlob, saveText } from '@/utils/download';

const Toolbar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sceneInputRef = useRef<HTMLInputElement | null>(null);
  const [background, setBackground] = useState('#1a1a1a');

  const addPrimitive = useSceneStore((state) => state.addPrimitive);
  const addLight = useSceneStore((state) => state.addLight);
  const addCamera = useSceneStore((state) => state.addCamera);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const transformMode = useSceneStore((state) => state.transformMode);
  const removeSelected = useSceneStore((state) => state.removeSelected);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const importObject = useSceneStore((state) => state.importObject);
  const exportGLTF = useSceneStore((state) => state.exportGLTF);
  const serializeScene = useSceneStore((state) => state.serializeScene);
  const loadFromJSON = useSceneStore((state) => state.loadFromJSON);
  const captureScreenshot = useSceneStore((state) => state.captureScreenshot);
  const setBackgroundColor = useSceneStore((state) => state.setBackground);

  const handleImport = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const object = await loadObjectFromFile(file);
      importObject(object, file.name.replace(/\.[^/.]+$/, ''));
    } catch (error) {
      alert((error as Error).message);
    } finally {
      event.target.value = '';
    }
  };

  const handleSceneLoad = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      loadFromJSON(json);
    } catch (error) {
      alert('Failed to load scene JSON');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportGLTF = async () => {
    try {
      const blob = await exportGLTF();
      saveBlob(blob, `scene-${Date.now()}.glb`);
    } catch (error) {
      alert('Failed to export GLTF');
    }
  };

  const handleExportJSON = () => {
    const entry = serializeScene();
    saveText(JSON.stringify(entry.json), `scene-${Date.now()}.json`);
  };

  const handleScreenshot = () => {
    const dataUrl = captureScreenshot();
    if (!dataUrl) {
      alert('Renderer is not ready yet.');
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
  };

  const handleBackgroundChange = (event: any) => {
    const color = event.target.value;
    setBackground(color);
    setBackgroundColor(color);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-group">
        <button onClick={() => addPrimitive('cube')}>Cube</button>
        <button onClick={() => addPrimitive('sphere')}>Sphere</button>
        <button onClick={() => addPrimitive('plane')}>Plane</button>
      </div>
      <div className="toolbar-group">
        <button onClick={() => addLight('ambient')}>Ambient</button>
        <button onClick={() => addLight('directional')}>Directional</button>
        <button onClick={() => addLight('point')}>Point</button>
        <button onClick={() => addCamera()}>Camera</button>
      </div>
      <div className="toolbar-group">
        <button className={transformMode === 'translate' ? 'active' : ''} onClick={() => setTransformMode('translate')}>
          Move
        </button>
        <button className={transformMode === 'rotate' ? 'active' : ''} onClick={() => setTransformMode('rotate')}>
          Rotate
        </button>
        <button className={transformMode === 'scale' ? 'active' : ''} onClick={() => setTransformMode('scale')}>
          Scale
        </button>
        <button onClick={() => removeSelected()}>Delete</button>
      </div>
      <div className="toolbar-group">
        <button onClick={() => undo()}>Undo</button>
        <button onClick={() => redo()}>Redo</button>
      </div>
      <div className="toolbar-group">
        <button onClick={() => fileInputRef.current?.click()}>Import</button>
        <button onClick={handleExportGLTF}>Export GLB</button>
        <button onClick={() => sceneInputRef.current?.click()}>Load Scene</button>
        <button onClick={handleExportJSON}>Save Scene</button>
      </div>
      <div className="toolbar-group">
        <label>
          Background
          <input type="color" value={background} onChange={handleBackgroundChange} style={{ marginLeft: 8 }} />
        </label>
        <button onClick={handleScreenshot}>Screenshot</button>
      </div>
      <input ref={fileInputRef} type="file" accept=".gltf,.glb,.obj,.fbx" className="file-input" onChange={handleImport} />
      <input ref={sceneInputRef} type="file" accept=".json" className="file-input" onChange={handleSceneLoad} />
    </header>
  );
};

export default Toolbar;
