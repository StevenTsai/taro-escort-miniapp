import { create } from 'zustand';

const useTabBarStore = create(set => ({
  selectedIndex: 0,
  setSelectedIndex: index => set({ selectedIndex: index }),
}));

export default useTabBarStore;
