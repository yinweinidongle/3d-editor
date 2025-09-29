import { create } from 'zustand';

type LayoutState = {
  showLeftPanel: boolean;
  showRightPanel: boolean;
  setLeftPanel: (visible: boolean) => void;
  setRightPanel: (visible: boolean) => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  showLeftPanel: true,
  showRightPanel: true,
  setLeftPanel: (visible) => set({ showLeftPanel: visible }),
  setRightPanel: (visible) => set({ showRightPanel: visible })
}));
