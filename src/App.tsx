import Toolbar from './components/Toolbar';
import Viewport from './components/Viewport';
import SceneHierarchy from './components/SceneHierarchy';
import PropertiesPanel from './components/PropertiesPanel';
import MaterialEditor from './components/MaterialEditor';
import EnvironmentPanel from './components/EnvironmentPanel';
import LayoutSettings from './components/LayoutSettings';
import './styles/app.css';
import { useLayoutStore } from './state/useLayoutStore';

const App = () => {
  const showLeft = useLayoutStore((state) => state.showLeftPanel);
  const showRight = useLayoutStore((state) => state.showRightPanel);

  const columns = [
    showLeft ? 'minmax(220px, 280px)' : null,
    '1fr',
    showRight ? 'minmax(260px, 320px)' : null
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app">
      <Toolbar />
      <div className="workspace" style={{ gridTemplateColumns: columns }}>
        {showLeft && (
          <aside className="sidebar left">
            <SceneHierarchy />
            <EnvironmentPanel />
          </aside>
        )}
        <main className="viewport-panel">
          <Viewport />
        </main>
        {showRight && (
          <aside className="sidebar right">
            <PropertiesPanel />
            <MaterialEditor />
            <LayoutSettings />
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
