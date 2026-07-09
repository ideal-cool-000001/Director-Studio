import { useState, useRef } from 'react';

interface TimelineClip {
  id: string;
  type: 'video' | 'audio';
  title: string;
  url: string;
  startTime: number;
  duration: number;
  volume: number;
  opacity: number;
}

interface VideoEditorProps {
  projectId: string;
  clips: TimelineClip[];
}

export function VideoEditor({ projectId, clips }: VideoEditorProps) {
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>(clips);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [colorGrading, setColorGrading] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
  });
  const [activeTab, setActiveTab] = useState<'timeline' | 'effects' | 'export'>('timeline');

  const timelineRef = useRef<HTMLDivElement>(null);
  const playInterval = useRef<number | null>(null);

  const totalDuration = Math.max(...timelineClips.map((c) => c.startTime + c.duration), 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (isPlaying) {
      if (playInterval.current) clearInterval(playInterval.current);
    } else {
      playInterval.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            if (playInterval.current) clearInterval(playInterval.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * totalDuration;
    setCurrentTime(time);
  };

  const handleClipDrag = (clipId: string, deltaX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const deltaTime = (deltaX / rect.width) * totalDuration;

    setTimelineClips((prev) =>
      prev.map((clip) =>
        clip.id === clipId ? { ...clip, startTime: Math.max(0, clip.startTime + deltaTime) } : clip
      )
    );
  };

  const handleClipResize = (clipId: string, direction: 'start' | 'end', deltaX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const deltaTime = (deltaX / rect.width) * totalDuration;

    setTimelineClips((prev) =>
      prev.map((clip) => {
        if (clip.id !== clipId) return clip;
        if (direction === 'start') {
          const newStart = Math.max(0, clip.startTime + deltaTime);
          return {
            ...clip,
            startTime: newStart,
            duration: Math.max(0.5, clip.duration - deltaTime),
          };
        } else {
          return {
            ...clip,
            duration: Math.max(0.5, clip.duration + deltaTime),
          };
        }
      })
    );
  };

  const handleExport = () => {
    alert('导出功能开发中...');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('timeline')}
            >
              时间线
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'effects' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('effects')}
            >
              特效
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'export' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('export')}
            >
              导出
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
          <button
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onClick={() => setPlaybackSpeed(0.5)}
          >
            0.5x
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${playbackSpeed === 1 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setPlaybackSpeed(1)}
          >
            1x
          </button>
          <button
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            onClick={() => setPlaybackSpeed(2)}
          >
            2x
          </button>
          <button
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            onClick={handlePlay}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <div className="bg-black rounded-xl h-64 flex items-center justify-center mb-4">
            {selectedClip ? (
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-gray-400">{selectedClip.title}</div>
                <div className="text-sm text-gray-500">{formatTime(currentTime)}</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🎥</div>
                <div>预览区域</div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">进度条</span>
              <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
            </div>
            <div
              ref={timelineRef}
              className="relative h-6 bg-gray-700 rounded cursor-pointer overflow-hidden"
              onClick={handleTimelineClick}
            >
              <div
                className="absolute top-0 left-0 h-full bg-blue-600 rounded"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
              <div
                className="absolute top-0 h-full w-1 bg-white shadow-lg"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-400">轨道</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 rounded text-xs">视频轨</button>
                <button className="px-3 py-1 bg-green-600 rounded text-xs">音频轨</button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div
                ref={timelineRef}
                className="relative h-24 bg-gray-700 rounded overflow-auto"
                onClick={handleTimelineClick}
              >
                <div className="absolute inset-0 flex">
                  {Array.from({ length: totalDuration }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-gray-600"
                      style={{ width: `${(1 / totalDuration) * 100}%` }}
                    />
                  ))}
                </div>

                {timelineClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`absolute h-16 rounded-lg cursor-pointer transition-all ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-blue-500' : ''
                    } ${clip.type === 'video' ? 'bg-blue-600' : 'bg-green-600'}`}
                    style={{
                      left: `${(clip.startTime / totalDuration) * 100}%`,
                      width: `${(clip.duration / totalDuration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClip(clip);
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/20 cursor-e-resize" />
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 cursor-e-resize" />
                    <div className="p-2 text-xs">
                      <div className="font-medium truncate">{clip.title}</div>
                      <div className="text-white/70">{formatTime(clip.duration)}</div>
                    </div>
                  </div>
                ))}

                <div
                  className="absolute top-0 h-full w-0.5 bg-white shadow-lg z-10"
                  style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-72 bg-gray-800 border-l border-gray-700 p-4">
          {selectedClip ? (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">剪辑属性</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">名称</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm"
                    value={selectedClip.title}
                    onChange={(e) =>
                      setTimelineClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, title: e.target.value } : c))
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">开始时间</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm"
                    value={selectedClip.startTime.toFixed(1)}
                    onChange={(e) =>
                      setTimelineClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, startTime: parseFloat(e.target.value) || 0 } : c))
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">时长</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm"
                    value={selectedClip.duration.toFixed(1)}
                    onChange={(e) =>
                      setTimelineClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, duration: parseFloat(e.target.value) || 0.5 } : c))
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">音量: {selectedClip.volume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    value={selectedClip.volume}
                    onChange={(e) =>
                      setTimelineClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, volume: parseInt(e.target.value) } : c))
                      )
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">透明度: {selectedClip.opacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    value={selectedClip.opacity}
                    onChange={(e) =>
                      setTimelineClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, opacity: parseInt(e.target.value) } : c))
                      )
                    }
                  />
                </div>
                <button
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                  onClick={() =>
                    setTimelineClips((prev) => prev.filter((c) => c.id !== selectedClip.id))
                  }
                >
                  删除剪辑
                </button>
              </div>
            </>
          ) : activeTab === 'effects' ? (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">色彩调整</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">亮度: {colorGrading.brightness}</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    className="w-full"
                    value={colorGrading.brightness}
                    onChange={(e) => setColorGrading((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">对比度: {colorGrading.contrast}</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    className="w-full"
                    value={colorGrading.contrast}
                    onChange={(e) => setColorGrading((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">饱和度: {colorGrading.saturation}</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    className="w-full"
                    value={colorGrading.saturation}
                    onChange={(e) => setColorGrading((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">色相: {colorGrading.hue}</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    className="w-full"
                    value={colorGrading.hue}
                    onChange={(e) => setColorGrading((prev) => ({ ...prev, hue: parseInt(e.target.value) }))}
                  />
                </div>
                <button
                  className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                  onClick={() => setColorGrading({ brightness: 0, contrast: 0, saturation: 0, hue: 0 })}
                >
                  重置
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">风格预设</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">电影感</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">复古</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">赛博朋克</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs">日系清新</button>
                </div>
              </div>
            </>
          ) : activeTab === 'export' ? (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">导出设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">分辨率</label>
                  <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm">
                    <option>1080p (1920x1080)</option>
                    <option>720p (1280x720)</option>
                    <option>4K (3840x2160)</option>
                    <option>480p (854x480)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">帧率</label>
                  <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm">
                    <option>24fps</option>
                    <option>30fps</option>
                    <option>60fps</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">格式</label>
                  <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm">
                    <option>MP4</option>
                    <option>AVI</option>
                    <option>MKV</option>
                    <option>WebM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">编码</label>
                  <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm">
                    <option>H.264</option>
                    <option>H.265</option>
                    <option>VP9</option>
                  </select>
                </div>
                <button
                  className="w-full px-3 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                  onClick={handleExport}
                >
                  导出视频
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              选择剪辑查看属性
            </div>
          )}
        </div>
      </div>
    </div>
  );
}