import { create } from 'zustand';

interface LocationModalStore {
  isOpen: boolean;
  category?: string;
  openWithCategory: (category: string) => void;
  onClose: () => void;
}

const useLocationModal = create<LocationModalStore>((set) => ({
  isOpen: false,
  category: undefined,
  openWithCategory: (category: string) => set({ isOpen: true, category }),
  onClose: () => set({ isOpen: false })
}));

export default useLocationModal;