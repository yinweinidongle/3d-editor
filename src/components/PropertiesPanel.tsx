import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/state/useSceneStore';
import { findObjectByEditorId } from '@/utils/scene';

const formatNumber = (value: number) => Number.parseFloat(value.toFixed(3));

const PropertiesPanel = () => {
  const scene = useSceneStore((state) => state.scene);
  const selectedId = useSceneStore((state) => state.selectedId);
  const renameSelected = useSceneStore((state) => state.renameSelected);
  const updateTransform = useSceneStore((state) => state.updateSelectedTransform);
  const setVisibility = useSceneStore((state) => state.setSelectedVisibility);
  const revision = useSceneStore((state) => state.revision);

  const selected = useMemo(() => findObjectByEditorId(scene, selectedId), [scene, selectedId, revision]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!selected) return;
    setName(selected.name || selected.type);
    setPosition([selected.position.x, selected.position.y, selected.position.z]);
    setRotation([
      THREE.MathUtils.radToDeg(selected.rotation.x),
      THREE.MathUtils.radToDeg(selected.rotation.y),
      THREE.MathUtils.radToDeg(selected.rotation.z)
    ]);
    setScale([selected.scale.x, selected.scale.y, selected.scale.z]);
    setVisible(selected.visible);
  }, [selected]);

  const handlePositionChange = (index: number, value: string) => {
    const num = Number.parseFloat(value);
    if (!Number.isFinite(num)) return;
    const next = [...position] as [number, number, number];
    next[index] = num;
    setPosition(next);
    updateTransform({ position: next });
    useSceneStore.getState().pushHistory();
  };

  const handleRotationChange = (index: number, value: string) => {
    const num = Number.parseFloat(value);
    if (!Number.isFinite(num)) return;
    const next = [...rotation] as [number, number, number];
    next[index] = num;
    setRotation(next);
    updateTransform({ rotation: next.map((deg) => THREE.MathUtils.degToRad(deg)) as [number, number, number] });
    useSceneStore.getState().pushHistory();
  };

  const handleScaleChange = (index: number, value: string) => {
    const num = Number.parseFloat(value);
    if (!Number.isFinite(num)) return;
    const next = [...scale] as [number, number, number];
    next[index] = num;
    setScale(next);
    updateTransform({ scale: next });
    useSceneStore.getState().pushHistory();
  };

  const handleNameBlur = () => {
    if (!selected) return;
    renameSelected(name);
    useSceneStore.getState().pushHistory();
  };

  const handleVisibilityToggle = (event: any) => {
    const isVisible = event.target.checked;
    setVisible(isVisible);
    setVisibility(isVisible);
    useSceneStore.getState().pushHistory();
  };

  if (!selected) {
    return (
      <section className="panel">
        <h2>Properties</h2>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Select an object to edit properties.</span>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Properties</h2>
      <div className="section">
        <label className="section-header">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={handleNameBlur}
            style={{ width: '60%', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,18,26,0.9)', color: '#fff' }}
          />
        </label>
        <div className="section-header">
          <span>Visible</span>
          <input type="checkbox" checked={visible} onChange={handleVisibilityToggle} />
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <span>Position</span>
        </div>
        <div className="property-grid">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <input
              key={axis}
              type="number"
              step={0.1}
              value={formatNumber(position[index])}
              onChange={(event) => handlePositionChange(index, event.target.value)}
            />
          ))}
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <span>Rotation (°)</span>
        </div>
        <div className="property-grid">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <input
              key={axis}
              type="number"
              step={1}
              value={formatNumber(rotation[index])}
              onChange={(event) => handleRotationChange(index, event.target.value)}
            />
          ))}
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <span>Scale</span>
        </div>
        <div className="property-grid">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <input
              key={axis}
              type="number"
              step={0.1}
              value={formatNumber(scale[index])}
              onChange={(event) => handleScaleChange(index, event.target.value)}
            />
          ))}
        </div>
      </div>
      <div className="section" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
        <div>ID: {selected.userData.editorId}</div>
        <div>Type: {selected.type}</div>
      </div>
    </section>
  );
};

export default PropertiesPanel;
