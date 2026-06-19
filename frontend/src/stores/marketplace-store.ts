import { create } from "zustand";

interface MarketplaceStore {
    refreshKey: number;

    triggerRefresh: () => void;
}

export const useMarketplaceStore = 
 create<MarketplaceStore>((set) => ({
    refreshKey: 0,

    triggerRefresh: () => set((state) => ({
        refreshKey: state.refreshKey + 1
    }))
 }))