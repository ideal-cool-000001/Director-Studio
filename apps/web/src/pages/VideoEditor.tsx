import { useState, useRef, useCallback } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text';
  url: string;
  title: string;
  duration: number;
  startTime: number;
  volume?: number;
  opacity?: number;
  filters?: string[];
}

interface Transition {
  id: string;
  type: 'fade' | 'crossfade' | 'slide' | 'zoom';
  duration: number;
  betweenClips: [string, string];
}

const MOCK_CLIPS: TimelineClip[] = [
  { id: 'v1', type: 'video', url: '', title: '场景1 - 开场', duration: 8, startTime: 0, opacity: 100 },
  { id: 'v2', type: 'video', url: '', title: '场景2 - 冲突', duration: 10, startTime: 8, opacity: 100 },
  { id: 'v3', type: 'video', url: '', title: '场景3 - 高潮', duration: 6, startTime: 18, opacity: 100 },
  { id: 'a1', type: 'audio', url: '', title: '背景音乐 - Piano Ambient', duration: 24, startTime: 0, volume: 70 },
];

const TRANSITIONS = ['淡入淡出', '交叉溶解', '滑动', '缩放', '闪白', '闪黑'];
const FILTERS = [
  { name: '原始', gradient: 'from-gray-400 to-gray-600' },
  { name: '黑白', gradient: 'from-gray-300 to-gray-700' },
  { name: '复古', gradient: 'from-amber-300 to-orange-600' },
  { name: '暖色', gradient: 'from-orange-300 to-red-500' },
  { name: '冷色', gradient: 'from-cyan-300 to-blue-600' },
  { name: '鲜艳', gradient: 'from-pink-400 to-purple-500' },
  { name: '胶片', gradient: 'from-yellow-600 to-amber-800' },
  { name: '高清', gradient: 'from-blue-400 to-indigo-600' },
  { name: '梦幻', gradient: 'from-purple-300 to-pink-400' },
];
const EFFECTS = ['模糊', '锐化', '降噪', '防抖', '色彩校正'];

export default function VideoEditor() {
  const [clips, setClips] = useState<TimelineClip[]>(MOCK_CLIPS);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activeTool, setActiveTool] = useState<'select' | 'cut' | 'split' | 'transition'>('select');
  const [showTransitionPanel, setShowTransitionPanel] = useState(false);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState('原始');
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDuration = Math.max(...clips.map(c => c.startTime + c.duration));

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setPlayheadPosition(Math.round(percentage * totalDuration));
  }, [totalDuration]);

  const handleClipClick = useCallback((clip: TimelineClip) => {
    setSelectedClip(clip);
  }, []);

  const handleSplit = useCallback(() => {
    if (!selectedClip) return;
    if (playheadPosition <= selectedClip.startTime || playheadPosition >= selectedClip.startTime + selectedClip.duration) return;

    const newClip1: TimelineClip = {
      ...selectedClip,
      id: `${selectedClip.id}-1`,
      duration: playheadPosition - selectedClip.startTime,
    };

    const newClip2: TimelineClip = {
      ...selectedClip,
      id: `${selectedClip.id}-2`,
      startTime: playheadPosition,
      duration: selectedClip.duration - (playheadPosition - selectedClip.startTime),
    };

    setClips(prev => {
      const index = prev.findIndex(c => c.id === selectedClip.id);
      return [...prev.slice(0, index), newClip1, newClip2, ...prev.slice(index + 1)];
    });
    setSelectedClip(newClip1);
    setActiveTool('select');
  }, [selectedClip, playheadPosition]);

  const handleCut = useCallback(() => {
    if (!selectedClip) return;
    setClips(prev => prev.filter(c => c.id !== selectedClip.id));
    setSelectedClip(null);
    setActiveTool('select');
  }, [selectedClip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getClipLeft = (clip: TimelineClip) => {
    return `${(clip.startTime / totalDuration) * 100}%`;
  };

  const getClipWidth = (clip: TimelineClip) => {
    return `${(clip.duration / totalDuration) * 100}%`;
  };

  const tools = [
    { id: 'select' as const, label: '选择', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { id: 'cut' as const, label: '删除', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    { id: 'split' as const, label: '分割', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'transition' as const, label: '转场', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background animate-fade-in">
      <div className="min-h-full flex flex-col p-lg gap-md">
        {/* Page header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface tracking-tight">视频剪辑</h1>
            <p className="text-body-sm text-on-surface-variant mt-xs">专业级 AI 视频编辑工作台</p>
          </div>
          <div className="flex items-center gap-sm">
            <button className="btn-ghost text-body-sm flex items-center gap-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              撤销
            </button>
            <button className="btn-ghost text-body-sm flex items-center gap-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
              重做
            </button>
            <button className="btn-primary text-body-sm flex items-center gap-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              导出视频
            </button>
          </div>
        </div>

        {/* Main workspace: left preview + controls, right sidebar */}
        <div className="flex gap-md flex-1 min-h-0">
          {/* Left: preview + color/filters */}
          <div className="flex-1 flex flex-col gap-md min-w-0">
            {/* Preview area - dark cinematic workspace */}
            <div className="flex-1 min-h-[320px] rounded-xl overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #0B0B12 0%, #15151F 100%)', boxShadow: 'var(--shadow-4)' }}>
              {/* Preview toolbar */}
              <div className="flex items-center justify-between px-md py-sm border-b border-white/5">
                <div className="flex items-center gap-sm">
                  <div className="flex items-center gap-xs px-sm py-xs rounded-full bg-white/5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-body-xs text-white/60 font-medium">预览</span>
                  </div>
                  <span className="text-body-xs text-white/40">{selectedClip?.title || '未选择片段'}</span>
                </div>
                {/* Tool buttons */}
                <div className="flex items-center gap-xs">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTool(tool.id);
                        if (tool.id === 'transition') setShowTransitionPanel(true);
                        if (tool.id === 'cut') handleCut();
                        if (tool.id === 'split') handleSplit();
                      }}
                      className={`flex items-center gap-xs px-sm py-xs rounded-lg text-body-xs font-medium transition-all duration-normal ${
                        activeTool === tool.id
                          ? 'bg-white/15 text-white'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                      </svg>
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview canvas */}
              <div className="flex-1 flex items-center justify-center relative p-lg">
                <div className="relative max-w-full max-h-full rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                  {/* Placeholder for video frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {selectedClip?.url ? (
                      <img
                        src={selectedClip.url}
                        alt="视频预览"
                        className="max-w-full max-h-full object-contain"
                        style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-sm">
                          <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-body-sm text-white/30">选择片段进行预览</p>
                      </div>
                    )}
                  </div>

                  {/* Center play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-normal hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.5 3a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 015.5 17H4a1.5 1.5 0 01-1.5-1.5v-11A1.5 1.5 0 014 3h1.5zm8.5 0a1.5 1.5 0 011.5 1.5v11a1.5 1.5 0 01-1.5 1.5H13a1.5 1.5 0 01-1.5-1.5v-11A1.5 1.5 0 0113 3h1.5z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.555 1.019A1 1 0 0110 2v16a1 1 0 01-1.445.894L5.482 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.482l3.073-6.146a1 1 0 011.072-.565z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Floating transport controls - bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-md px-md py-sm rounded-xl" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-body-xs text-white/80 font-mono">{formatTime(playheadPosition)}</span>
                    <input
                      type="range"
                      min="0"
                      max={totalDuration}
                      value={playheadPosition}
                      onChange={(e) => setPlayheadPosition(Number(e.target.value))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#7B61FF' }}
                    />
                    <span className="text-body-xs text-white/80 font-mono">{formatTime(totalDuration)}</span>
                    <div className="w-px h-4 bg-white/15" />
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-normal hover:bg-white/10"
                    >
                      {isPlaying ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5zM12 4h3v12h-3z" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
                      )}
                    </button>
                  </div>

                  {/* Top-left clip info badge */}
                  {selectedClip && (
                    <div className="absolute top-3 left-3 flex items-center gap-xs px-sm py-xs rounded-full" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedClip.type === 'video' ? '#7B61FF' : '#34C759' }} />
                      <span className="text-body-xs text-white/80 font-medium">{selectedClip.title}</span>
                      <span className="text-body-xs text-white/40">{formatTime(selectedClip.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color + Filters row */}
            <div className="flex gap-md flex-shrink-0">
              {/* Color adjustment */}
              <div className="flex-1 card p-md" style={{ boxShadow: 'var(--shadow-1)' }}>
                <div className="flex items-center gap-xs mb-md">
                  <div className="w-6 h-6 rounded-lg bg-purple-light flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  </div>
                  <h3 className="text-title-md font-semibold text-on-surface">色彩调整</h3>
                </div>
                <div className="space-y-sm">
                  {[
                    { label: '亮度', value: brightness, set: setBrightness, icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
                    { label: '对比度', value: contrast, set: setContrast, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                    { label: '饱和度', value: saturation, set: setSaturation, icon: 'M19 11H5m14-7H5m14 14H5' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-xs">
                        <span className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                          {item.label}
                        </span>
                        <span className="text-body-sm font-semibold text-on-surface font-mono">{item.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={item.value}
                        onChange={(e) => item.set(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: '#7B61FF' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
                    className="text-body-xs text-tertiary hover:text-tertiary-dark transition-all duration-normal mt-xs"
                  >
                    重置参数
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="w-[320px] card p-md flex flex-col" style={{ boxShadow: 'var(--shadow-1)' }}>
                <div className="flex items-center justify-between mb-md">
                  <div className="flex items-center gap-xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-light flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 20h18M8 12h8" /></svg>
                    </div>
                    <h3 className="text-title-md font-semibold text-on-surface">风格滤镜</h3>
                  </div>
                  <button onClick={() => setShowEffectsPanel(!showEffectsPanel)} className="text-body-xs text-tertiary hover:text-tertiary-dark transition-all duration-normal">
                    {showEffectsPanel ? '收起特效' : '展开特效'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-sm overflow-y-auto" style={{ maxHeight: showEffectsPanel ? '120px' : '180px' }}>
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => setActiveFilter(filter.name)}
                      className={`rounded-lg overflow-hidden transition-all duration-normal border-2 ${
                        activeFilter === filter.name ? 'border-tertiary scale-95' : 'border-transparent hover:border-outline-variant'
                      }`}
                    >
                      <div className={`h-8 bg-gradient-to-br ${filter.gradient}`} />
                      <div className="px-xs py-[3px] bg-surface">
                        <span className="text-body-xs text-on-surface-variant">{filter.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {showEffectsPanel && (
                  <div className="mt-sm pt-sm border-t border-outline animate-fade-in">
                    <h4 className="text-body-xs font-semibold text-on-surface-variant mb-xs uppercase tracking-wide">视频特效</h4>
                    <div className="grid grid-cols-3 gap-sm">
                      {EFFECTS.map((effect) => (
                        <button
                          key={effect}
                          className="px-xs py-sm rounded-lg bg-surface-muted hover:bg-hover text-body-xs text-on-surface-variant hover:text-on-surface transition-all duration-normal"
                        >
                          {effect}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar: properties + AI */}
          <div className="w-80 flex flex-col gap-md flex-shrink-0">
            {/* Selected clip properties */}
            {selectedClip && (
              <div className="card p-md animate-scale-in" style={{ boxShadow: 'var(--shadow-2)' }}>
                <div className="flex items-center gap-xs mb-md">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: selectedClip.type === 'video' ? 'var(--color-purple-light)' : 'var(--color-success-bg)' }}>
                    <svg className="w-3.5 h-3.5" style={{ color: selectedClip.type === 'video' ? 'var(--color-tertiary)' : 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedClip.type === 'video' ? 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' : 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z'} />
                    </svg>
                  </div>
                  <h3 className="text-title-md font-semibold text-on-surface">片段属性</h3>
                </div>
                <div className="space-y-sm">
                  <div>
                    <label className="block text-body-xs text-on-surface-variant mb-xs">名称</label>
                    <input
                      type="text"
                      value={selectedClip.title}
                      onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, title: e.target.value } : c))}
                      className="input-field w-full text-body-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div>
                      <label className="block text-body-xs text-on-surface-variant mb-xs">时长 (秒)</label>
                      <input
                        type="number"
                        value={selectedClip.duration}
                        onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, duration: Number(e.target.value) } : c))}
                        className="input-field w-full text-body-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-body-xs text-on-surface-variant mb-xs">起始 (秒)</label>
                      <input
                        type="number"
                        value={selectedClip.startTime}
                        onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, startTime: Number(e.target.value) } : c))}
                        className="input-field w-full text-body-sm"
                      />
                    </div>
                  </div>
                  {selectedClip.type === 'audio' && (
                    <div>
                      <div className="flex items-center justify-between mb-xs">
                        <label className="text-body-xs text-on-surface-variant">音量</label>
                        <span className="text-body-xs font-semibold text-on-surface font-mono">{selectedClip.volume || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.volume || 100}
                        onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, volume: Number(e.target.value) } : c))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: '#7B61FF' }}
                      />
                    </div>
                  )}
                  {selectedClip.type === 'video' && (
                    <div>
                      <div className="flex items-center justify-between mb-xs">
                        <label className="text-body-xs text-on-surface-variant">不透明度</label>
                        <span className="text-body-xs font-semibold text-on-surface font-mono">{selectedClip.opacity || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.opacity || 100}
                        onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, opacity: Number(e.target.value) } : c))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: '#7B61FF' }}
                      />
                    </div>
                  )}
                  <div className="flex gap-sm pt-xs">
                    <button onClick={handleCut} className="flex-1 px-sm py-sm rounded-lg bg-error-bg text-error text-body-sm font-medium hover:bg-error hover:text-on-primary transition-all duration-normal flex items-center justify-center gap-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      删除
                    </button>
                    <button onClick={handleSplit} className="flex-1 px-sm py-sm rounded-lg bg-surface-muted text-on-surface text-body-sm font-medium hover:bg-hover transition-all duration-normal flex items-center justify-center gap-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      分割
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transition panel */}
            {showTransitionPanel && (
              <div className="card p-md animate-scale-in" style={{ boxShadow: 'var(--shadow-2)' }}>
                <div className="flex items-center justify-between mb-md">
                  <div className="flex items-center gap-xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-light flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    </div>
                    <h3 className="text-title-md font-semibold text-on-surface">转场效果</h3>
                  </div>
                  <button onClick={() => setShowTransitionPanel(false)} className="icon-btn-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-sm mb-md">
                  {TRANSITIONS.map((transition) => (
                    <button
                      key={transition}
                      onClick={() => setShowTransitionPanel(false)}
                      className="px-sm py-sm rounded-lg bg-surface-muted hover:bg-purple-light hover:text-tertiary text-body-sm text-on-surface-variant transition-all duration-normal"
                    >
                      {transition}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-xs">
                    <label className="text-body-xs text-on-surface-variant">转场时长</label>
                    <span className="text-body-xs font-semibold text-on-surface font-mono">1.0s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    defaultValue="1"
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#7B61FF' }}
                  />
                </div>
              </div>
            )}

            {/* AI Panel */}
            <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border border-outline bg-surface" style={{ boxShadow: 'var(--shadow-1)' }}>
              <AIPanel variant="editor" presetAgents={['editor', 'director']} />
            </div>
          </div>
        </div>

        {/* Timeline - professional multi-track */}
        <div className="rounded-xl overflow-hidden flex-shrink-0 border border-outline" style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-3)' }}>
          {/* Timeline header */}
          <div className="glass flex items-center justify-between px-md py-sm border-b border-outline">
            <div className="flex items-center gap-md">
              <div className="flex items-center gap-xs">
                <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-title-md font-semibold text-on-surface">时间轴</h3>
              </div>
              <span className="text-body-xs text-on-surface-muted font-mono">{formatTime(totalDuration)} 总时长</span>
            </div>
            <div className="flex items-center gap-xs">
              <button className="icon-btn-sm text-on-surface-variant hover:text-on-surface" title="缩小">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
              </button>
              <span className="text-body-xs text-on-surface-muted font-mono px-xs">100%</span>
              <button className="icon-btn-sm text-on-surface-variant hover:text-on-surface" title="放大">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
              </button>
              <div className="w-px h-5 bg-outline mx-xs" />
              <button className="flex items-center gap-xs px-sm py-xs rounded-lg bg-surface-muted hover:bg-hover text-body-xs text-on-surface-variant hover:text-on-surface transition-all duration-normal">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                添加视频
              </button>
              <button className="flex items-center gap-xs px-sm py-xs rounded-lg bg-surface-muted hover:bg-hover text-body-xs text-on-surface-variant hover:text-on-surface transition-all duration-normal">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                添加音频
              </button>
              <button className="flex items-center gap-xs px-sm py-xs rounded-lg bg-surface-muted hover:bg-hover text-body-xs text-on-surface-variant hover:text-on-surface transition-all duration-normal">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                添加文字
              </button>
            </div>
          </div>

          {/* Timeline tracks */}
          <div className="p-md overflow-x-auto">
            {/* Ruler */}
            <div className="flex items-center mb-sm pl-[80px]">
              <div className="relative h-5 flex-1">
                {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => (
                  <div key={i} className="absolute flex flex-col items-center" style={{ left: `${(i * 5 / totalDuration) * 100}%` }}>
                    <div className="w-px h-2 bg-outline-variant" />
                    <span className="text-body-xs text-on-surface-muted font-mono mt-xs">{formatTime(i * 5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video track */}
            <div className="flex items-center gap-sm mb-sm">
              <div className="w-[72px] flex-shrink-0 flex items-center gap-xs">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-purple-light)' }}>
                  <svg className="w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-body-xs text-on-surface-variant font-medium">视频</span>
              </div>
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="flex-1 h-14 rounded-lg relative cursor-pointer overflow-hidden border border-outline bg-surface-muted"
                style={{ minWidth: '400px' }}
              >
                {/* Grid lines */}
                {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-outline/50" style={{ left: `${((i + 1) * 5 / totalDuration) * 100}%` }} />
                ))}
                {/* Video clips */}
                {clips.filter(c => c.type === 'video').map((clip) => (
                  <div
                    key={clip.id}
                    onClick={(e) => { e.stopPropagation(); handleClipClick(clip); }}
                    className={`absolute top-1.5 bottom-1.5 rounded-md cursor-pointer transition-all duration-normal overflow-hidden ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-tertiary z-10' : 'hover:opacity-90'
                    }`}
                    style={{
                      left: getClipLeft(clip),
                      width: getClipWidth(clip),
                      background: selectedClip?.id === clip.id
                        ? 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)'
                        : 'linear-gradient(135deg, #9C84FF 0%, #7B61FF 100%)',
                      boxShadow: selectedClip?.id === clip.id ? '0 0 12px rgba(123, 97, 255, 0.4)' : 'var(--shadow-1)',
                    }}
                  >
                    <div className="p-xs h-full flex flex-col justify-between">
                      <p className="text-body-xs text-white font-medium truncate">{clip.title}</p>
                      <div className="flex items-center gap-xs">
                        <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-white/40 rounded-full" style={{ width: '60%' }} />
                        </div>
                        <p className="text-body-xs text-white/60 font-mono">{formatTime(clip.duration)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
                  style={{ left: `${(playheadPosition / totalDuration) * 100}%`, background: '#FF3B30', boxShadow: '0 0 8px rgba(255, 59, 48, 0.5)' }}
                >
                  <div className="absolute -top-0 -left-1 w-2.5 h-2.5 rotate-45" style={{ background: '#FF3B30' }} />
                </div>
              </div>
            </div>

            {/* Audio track */}
            <div className="flex items-center gap-sm">
              <div className="w-[72px] flex-shrink-0 flex items-center gap-xs">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-success-bg)' }}>
                  <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                </div>
                <span className="text-body-xs text-on-surface-variant font-medium">音频</span>
              </div>
              <div
                className="flex-1 h-10 rounded-lg relative cursor-pointer overflow-hidden border border-outline bg-surface-muted"
                style={{ minWidth: '400px' }}
                onClick={handleTimelineClick}
              >
                {/* Grid lines */}
                {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-outline/50" style={{ left: `${((i + 1) * 5 / totalDuration) * 100}%` }} />
                ))}
                {/* Audio clips */}
                {clips.filter(c => c.type === 'audio').map((clip) => (
                  <div
                    key={clip.id}
                    onClick={(e) => { e.stopPropagation(); handleClipClick(clip); }}
                    className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all duration-normal overflow-hidden ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-success z-10' : 'hover:opacity-90'
                    }`}
                    style={{
                      left: getClipLeft(clip),
                      width: getClipWidth(clip),
                      background: selectedClip?.id === clip.id
                        ? 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
                        : 'linear-gradient(135deg, #4ADE80 0%, #34C759 100%)',
                      boxShadow: selectedClip?.id === clip.id ? '0 0 12px rgba(52, 199, 89, 0.4)' : 'var(--shadow-1)',
                    }}
                  >
                    {/* Waveform visualization */}
                    <div className="flex items-center gap-px h-full px-xs">
                      {Array.from({ length: 40 }).map((_, i) => {
                        const height = 20 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20;
                        return <div key={i} className="flex-1 rounded-full bg-white/30" style={{ height: `${Math.max(15, Math.min(70, height))}%` }} />;
                      })}
                    </div>
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
                  style={{ left: `${(playheadPosition / totalDuration) * 100}%`, background: '#FF3B30', boxShadow: '0 0 8px rgba(255, 59, 48, 0.5)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
