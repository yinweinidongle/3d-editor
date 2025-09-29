import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/state/useSceneStore';
import { findObjectByEditorId } from '@/utils/scene';

const MaterialEditor = () => {
  const scene = useSceneStore((state) => state.scene);
  const selectedId = useSceneStore((state) => state.selectedId);
  const updateMaterial = useSceneStore((state) => state.updateMaterial);
  const revision = useSceneStore((state) => state.revision);

  const selected = useMemo(() => findObjectByEditorId(scene, selectedId) as THREE.Mesh | undefined, [scene, selectedId, revision]);
  const [color, setColor] = useState('#6c9ced');
  const [emissive, setEmissive] = useState('#000000');
  const [metalness, setMetalness] = useState(0.2);
  const [roughness, setRoughness] = useState(0.7);

  useEffect(() => {
    if (!selected || !(selected as THREE.Mesh).isMesh) return;
    const material = selected.material as THREE.MeshStandardMaterial;
    if (!material) return;
    setColor(`#${material.color.getHexString()}`);
    setEmissive(`#${material.emissive.getHexString()}`);
    setMetalness(material.metalness ?? 0);
    setRoughness(material.roughness ?? 1);
  }, [selected]);

  if (!selected || !(selected.material instanceof THREE.MeshStandardMaterial)) {
    return (
      <section className="panel">
        <h2>Material</h2>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Select a mesh to edit material.</span>
      </section>
    );
  }

  const handleColorChange = (event: any) => {
    const value = event.target.value;
    setColor(value);
    updateMaterial({ color: value });
    useSceneStore.getState().pushHistory();
  };

  const handleEmissiveChange = (event: any) => {
    const value = event.target.value;
    setEmissive(value);
    updateMaterial({ emissive: value });
    useSceneStore.getState().pushHistory();
  };

  const handleMetalnessChange = (event: any) => {
    const value = Number.parseFloat(event.target.value);
    setMetalness(value);
    updateMaterial({ metalness: value });
    useSceneStore.getState().pushHistory();
  };

  const handleRoughnessChange = (event: any) => {
    const value = Number.parseFloat(event.target.value);
    setRoughness(value);
    updateMaterial({ roughness: value });
    useSceneStore.getState().pushHistory();
  };

  return (
    <section className="panel">
      <h2>Material</h2>
      <div className="section">
        <div className="section-header">
          <span>Preview</span>
        </div>
        <div
          style={{
            width: '100%',
            height: 80,
            borderRadius: 10,
            background: `radial-gradient(circle at 30% 30%, ${color}, ${emissive})`,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 8px 20px rgba(0,0,0,0.35)'
          }}
        />
      </div>
      <div className="section">
        <label className="section-header" htmlFor="color-input">
          <span>Base Color</span>
        </label>
        <input id="color-input" type="color" value={color} onChange={handleColorChange} className="color-input" />
      </div>
      <div className="section">
        <label className="section-header" htmlFor="emissive-input">
          <span>Emissive</span>
        </label>
        <input id="emissive-input" type="color" value={emissive} onChange={handleEmissiveChange} className="color-input" />
      </div>
      <div className="section">
        <label className="section-header" htmlFor="metalness-range">
          <span>Metalness</span>
        </label>
        <input
          id="metalness-range"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={metalness}
          onChange={handleMetalnessChange}
        />
      </div>
      <div className="section">
        <label className="section-header" htmlFor="roughness-range">
          <span>Roughness</span>
        </label>
        <input
          id="roughness-range"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={roughness}
          onChange={handleRoughnessChange}
        />
      </div>
    </section>
  );
};

export default MaterialEditor;
