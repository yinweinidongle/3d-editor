import { useMemo } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/state/useSceneStore';
import { buildSceneGraph, getEditorId } from '@/utils/scene';

const getIcon = (object: THREE.Object3D) => {
  if ((object as THREE.Light).isLight) return '💡';
  if ((object as THREE.Camera).isCamera) return '📷';
  if ((object as THREE.Mesh).isMesh) return '🧊';
  return '📦';
};

interface NodeProps {
  node: { object: THREE.Object3D; children: NodeProps['node'][] };
  selectedId?: string;
  onSelect: (id?: string) => void;
}

const HierarchyNode = ({ node, selectedId, onSelect }: NodeProps) => {
  const id = getEditorId(node.object);
  const isSelected = id === selectedId;

  return (
    <div>
      <div className={`hierarchy-item ${isSelected ? 'active' : ''}`} onClick={() => onSelect(id)}>
        <span>{getIcon(node.object)}</span>
        <span>{node.object.name || node.object.type}</span>
      </div>
      {node.children.length > 0 && (
        <div className="hierarchy-children">
          {node.children.map((child) => (
            <HierarchyNode key={getEditorId(child.object)} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const SceneHierarchy = () => {
  const scene = useSceneStore((state) => state.scene);
  const selectedId = useSceneStore((state) => state.selectedId);
  const selectObject = useSceneStore((state) => state.selectObject);
  const revision = useSceneStore((state) => state.revision);

  const graph = useMemo(() => buildSceneGraph(scene), [scene, revision]);

  return (
    <section className="panel">
      <h2>Hierarchy</h2>
      <div className="hierarchy-tree">
        {graph.length === 0 ? (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Scene is empty</span>
        ) : (
          graph.map((node) => (
            <HierarchyNode
              key={getEditorId(node.object)}
              node={node}
              selectedId={selectedId}
              onSelect={selectObject}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default SceneHierarchy;
