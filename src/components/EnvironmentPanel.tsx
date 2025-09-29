import { useMemo } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/state/useSceneStore';
import { isHelper } from '@/utils/scene';

const EnvironmentPanel = () => {
  const scene = useSceneStore((state) => state.scene);
  const helpers = useSceneStore((state) => state.helpers);
  const toggleHelper = useSceneStore((state) => state.toggleHelper);
  const revision = useSceneStore((state) => state.revision);

  const lights = useMemo(() => {
    const found: THREE.Light[] = [];
    scene.traverse((object) => {
      if (isHelper(object)) return;
      if ((object as THREE.Light).isLight) {
        found.push(object as THREE.Light);
      }
    });
    return found;
  }, [scene, revision]);

  const handleLightIntensity = (light: THREE.Light, value: number) => {
    light.intensity = value;
    useSceneStore.getState().pushHistory();
  };

  const handleLightColor = (light: THREE.Light, value: string) => {
    light.color = new THREE.Color(value);
    useSceneStore.getState().pushHistory();
  };

  return (
    <section className="panel">
      <h2>Environment</h2>
      <div className="section">
        <div className="section-header">
          <span>Helpers</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={helpers.grid} onChange={() => toggleHelper('grid')} /> Grid
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={helpers.axes} onChange={() => toggleHelper('axes')} /> Axes
        </label>
      </div>
      <div className="section">
        <div className="section-header">
          <span>Lights</span>
        </div>
        {lights.length === 0 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No lights in scene.</span>}
        {lights.map((light) => (
          <div
            key={light.uuid}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(15,20,28,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ fontSize: 13, color: '#d4e0ff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{light.name || light.type}</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 70 }}>Intensity</span>
              <input
                type="range"
                min={0}
                max={3}
                step={0.05}
                value={light.intensity}
                onChange={(event) => handleLightIntensity(light, Number.parseFloat(event.target.value))}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 70 }}>Color</span>
              <input type="color" value={`#${light.color.getHexString()}`} onChange={(event) => handleLightColor(light, event.target.value)} />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EnvironmentPanel;
