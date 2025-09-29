import { useLayoutStore } from '@/state/useLayoutStore';

const LayoutSettings = () => {
  const showLeft = useLayoutStore((state) => state.showLeftPanel);
  const showRight = useLayoutStore((state) => state.showRightPanel);
  const setLeft = useLayoutStore((state) => state.setLeftPanel);
  const setRight = useLayoutStore((state) => state.setRightPanel);

  return (
    <section className="panel">
      <h2>Layout</h2>
      <div className="section" style={{ gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={showLeft} onChange={(event) => setLeft(event.target.checked)} />
          Show Hierarchy
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={showRight} onChange={(event) => setRight(event.target.checked)} />
          Show Inspectors
        </label>
      </div>
    </section>
  );
};

export default LayoutSettings;
