import { ViewMode, SceneSnapshot } from '../types';

interface TopBarProps {
  snapshot: SceneSnapshot;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSave: () => void;
  onReset: () => void;
}

export function TopBar({ snapshot, viewMode, onViewModeChange, onSave, onReset }: TopBarProps) {
  return (
    <div className="h-12 bg-panel border-b border-primary flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="text-white font-bold text-sm">3D</span>
        </div>
        <h1 className="text-primary font-semibold text-lg tracking-tight">3D 导演台</h1>
      </div>

      <div className="flex items-center gap-1.5 bg-card rounded-lg p-0.5">
        <button
          onClick={() => onViewModeChange('director')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === 'director'
              ? 'bg-accent text-black'
              : 'text-secondary hover:text-primary hover:bg-hover'
          }`}
        >
          导演视角
        </button>
        <button
          onClick={() => onViewModeChange('camera')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === 'camera'
              ? 'bg-accent text-black'
              : 'text-secondary hover:text-primary hover:bg-hover'
          }`}
        >
          机位视角
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存场景
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          清缓存重置
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          帮助
        </button>
      </div>
    </div>
  );
}