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
  { id: 'v1', type: 'video', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20scene%201&image_size=landscape_16_9', title: '场景1', duration: 8, startTime: 0, opacity: 100 },
  { id: 'v2', type: 'video', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20scene%202&image_size=landscape_16_9', title: '场景2', duration: 10, startTime: 8, opacity: 100 },
  { id: 'v3', type: 'video', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20scene%203&image_size=landscape_16_9', title: '场景3', duration: 6, startTime: 18, opacity: 100 },
  { id: 'a1', type: 'audio', url: '', title: '背景音乐', duration: 24, startTime: 0, volume: 70 },
];

const TRANSITIONS = ['淡入淡出', '交叉溶解', '滑动', '缩放', '闪白', '闪黑'];
const FILTERS = ['原始', '黑白', '复古', '暖色', '冷色', '鲜艳', '胶片', '高清', '梦幻'];
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex gap-lg p-lg">
        <div className="flex-1 flex flex-col gap-lg">
          <div className="flex-1 card flex flex-col">
            <div className="flex items-center justify-between p-md border-b border-outline">
              <h3 className="text-body-lg font-semibold text-on-surface">视频预览</h3>
              <div className="flex items-center gap-md">
                <button className={`btn-outline ${activeTool === 'select' ? 'bg-primary text-on-primary' : ''}`} onClick={() => setActiveTool('select')}>
                  选择
                </button>
                <button className={`btn-outline ${activeTool === 'cut' ? 'bg-primary text-on-primary' : ''}`} onClick={() => setActiveTool('cut')}>
                  删除
                </button>
                <button className={`btn-outline ${activeTool === 'split' ? 'bg-primary text-on-primary' : ''}`} onClick={() => setActiveTool('split')}>
                  分割
                </button>
                <button className={`btn-outline ${activeTool === 'transition' ? 'bg-primary text-on-primary' : ''}`} onClick={() => {
                  setActiveTool('transition');
                  setShowTransitionPanel(true);
                }}>
                  转场
                </button>
                <button className="btn-primary">导出视频</button>
              </div>
            </div>
            <div className="flex-1 bg-secondary rounded-lg m-md flex items-center justify-center relative overflow-hidden">
              <img
                src={selectedClip?.url || clips.find(c => c.type === 'video')?.url || ''}
                alt="视频预览"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {isPlaying ? (
                      <path fillRule="evenodd" d="M5.5 3a1.5 1.5 0 011.5 1.5v11A1.5 1.5 0 015.5 17H4a1.5 1.5 0 01-1.5-1.5v-11A1.5 1.5 0 014 3h1.5zm8.5 0a1.5 1.5 0 011.5 1.5v11a1.5 1.5 0 01-1.5 1.5H13a1.5 1.5 0 01-1.5-1.5v-11A1.5 1.5 0 0113 3h1.5z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M9.555 1.019A1 1 0 0110 2v16a1 1 0 01-1.445.894L5.482 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.482l3.073-6.146a1 1 0 011.072-.565z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white text-sm">{formatTime(playheadPosition)}</span>
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  value={playheadPosition}
                  onChange={(e) => setPlayheadPosition(Number(e.target.value))}
                  className="flex-1 mx-4"
                />
                <span className="text-white text-sm">{formatTime(totalDuration)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-lg">
            <div className="flex-1 card">
              <h3 className="text-body-md font-semibold text-on-surface mb-md">色彩调整</h3>
              <div className="space-y-md">
                <div>
                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-body-sm text-on-surface-variant">亮度</span>
                    <span className="text-body-sm text-on-surface">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-body-sm text-on-surface-variant">对比度</span>
                    <span className="text-body-sm text-on-surface">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-sm">
                    <span className="text-body-sm text-on-surface-variant">饱和度</span>
                    <span className="text-body-sm text-on-surface">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="w-64 card">
              <div className="flex items-center justify-between mb-md">
                <h3 className="text-body-md font-semibold text-on-surface">风格滤镜</h3>
                <button onClick={() => setShowEffectsPanel(!showEffectsPanel)} className="text-body-sm text-on-surface-variant hover:text-on-surface">
                  {showEffectsPanel ? '隐藏特效' : '显示特效'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-sm">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    className="p-sm bg-secondary rounded-lg text-body-sm text-on-surface-variant hover:bg-hover transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              {showEffectsPanel && (
                <div className="mt-md pt-md border-t border-outline">
                  <h4 className="text-body-sm font-medium text-on-surface mb-sm">视频特效</h4>
                  <div className="grid grid-cols-3 gap-sm">
                    {EFFECTS.map((effect) => (
                      <button
                        key={effect}
                        className="p-sm bg-secondary rounded-lg text-body-sm text-on-surface-variant hover:bg-hover transition-colors"
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

        <div className="w-80 flex flex-col gap-lg">
          {selectedClip && (
            <div className="card">
              <h3 className="text-body-md font-semibold text-on-surface mb-md">选中片段</h3>
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-sm">名称</label>
                  <input
                    type="text"
                    value={selectedClip.title}
                    onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, title: e.target.value } : c))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-sm">时长 (秒)</label>
                  <input
                    type="number"
                    value={selectedClip.duration}
                    onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, duration: Number(e.target.value) } : c))}
                    className="input-field w-full"
                  />
                </div>
                {selectedClip.type === 'audio' && (
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-sm">音量</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedClip.volume || 100}
                      onChange={(e) => setClips(prev => prev.map(c => c.id === selectedClip.id ? { ...c, volume: Number(e.target.value) } : c))}
                      className="w-full"
                    />
                  </div>
                )}
                <div className="flex gap-sm">
                  <button onClick={handleCut} className="flex-1 btn-outline text-error">删除片段</button>
                  <button onClick={handleSplit} className="flex-1 btn-secondary">分割片段</button>
                </div>
              </div>
            </div>
          )}

          {showTransitionPanel && (
            <div className="card">
              <h3 className="text-body-md font-semibold text-on-surface mb-md">转场效果</h3>
              <div className="grid grid-cols-2 gap-sm">
                {TRANSITIONS.map((transition) => (
                  <button
                    key={transition}
                    onClick={() => setShowTransitionPanel(false)}
                    className="p-sm bg-secondary rounded-lg text-body-sm text-on-surface-variant hover:bg-hover transition-colors"
                  >
                    {transition}
                  </button>
                ))}
              </div>
              <div className="mt-md">
                <label className="block text-label-md text-on-surface-variant mb-sm">转场时长</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  defaultValue="1"
                  className="w-full"
                />
              </div>
            </div>
          )}

          <AIPanel presetAgents={['editor', 'director']} />
        </div>
      </div>

      <div className="h-48 card border-t border-outline">
        <div className="flex items-center justify-between p-md border-b border-outline">
          <h3 className="text-body-md font-semibold text-on-surface">时间轴</h3>
          <div className="flex items-center gap-md">
            <button className="btn-outline text-body-sm">添加视频</button>
            <button className="btn-outline text-body-sm">添加音频</button>
            <button className="btn-outline text-body-sm">添加文字</button>
          </div>
        </div>
        <div className="flex-1 p-md">
          <div className="flex items-center mb-sm">
            {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <span className="text-body-xs text-on-surface-variant w-12">{formatTime(i * 5)}</span>
                <div className="flex-1 h-px bg-outline" />
              </div>
            ))}
          </div>
          <div className="flex gap-lg">
            <div className="w-20 flex-shrink-0">
              <div className="text-body-xs text-on-surface-variant mb-sm">视频轨道</div>
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="flex-1 h-16 bg-secondary rounded-lg relative cursor-pointer overflow-hidden"
              >
                {clips.filter(c => c.type === 'video').map((clip) => (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClipClick(clip);
                    }}
                    className={`absolute top-2 bottom-2 rounded-md cursor-pointer transition-all ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: getClipLeft(clip),
                      width: getClipWidth(clip),
                      backgroundColor: clip.type === 'video' ? '#3b82f6' : clip.type === 'audio' ? '#22c55e' : '#eab308',
                    }}
                  >
                    <div className="p-sm">
                      <p className="text-xs text-white truncate">{clip.title}</p>
                      <p className="text-xs text-white/70">{formatTime(clip.duration)}</p>
                    </div>
                  </div>
                ))}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-body-xs text-on-surface-variant mb-sm">音频轨道</div>
              <div
                className="flex-1 h-12 bg-secondary rounded-lg relative"
                onClick={handleTimelineClick}
              >
                {clips.filter(c => c.type === 'audio').map((clip) => (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClipClick(clip);
                    }}
                    className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: getClipLeft(clip),
                      width: getClipWidth(clip),
                      backgroundColor: '#22c55e',
                    }}
                  >
                    <div className="p-sm">
                      <p className="text-xs text-white truncate">{clip.title}</p>
                    </div>
                  </div>
                ))}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}