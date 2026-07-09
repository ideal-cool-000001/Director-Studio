// ═══════════════════════════════════════════
// useProjectStore — 项目状态（全局配置/预算）
// ═══════════════════════════════════════════

import { create } from 'zustand';
import type { GlobalConfig, QualityLevel, StylePreset, AspectRatio } from '@director/shared-types';

interface ProjectState {
  projectId: string | null;
  title: string;
  globalConfig: GlobalConfig;
  totalCost: number;

  setProject: (id: string, title: string) => void;
  updateConfig: (config: Partial<GlobalConfig>) => void;
  setTotalCost: (cost: number) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: GlobalConfig = {
  style_preset: 'realistic' as StylePreset,
  aspect_ratio: '16:9' as AspectRatio,
  target_duration: 3,
  budget_limit: 200,
  quality_level: 'standard' as QualityLevel,
  fps: 24,
  resolution: { width: 1920, height: 1080 },
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  title: '',
  globalConfig: { ...DEFAULT_CONFIG },
  totalCost: 0,

  setProject: (id, title) => set({ projectId: id, title }),

  updateConfig: (config) =>
    set((state) => ({
      globalConfig: { ...state.globalConfig, ...config },
    })),

  setTotalCost: (cost) => set({ totalCost: cost }),

  reset: () =>
    set({
      projectId: null,
      title: '',
      globalConfig: { ...DEFAULT_CONFIG },
      totalCost: 0,
    }),
}));
