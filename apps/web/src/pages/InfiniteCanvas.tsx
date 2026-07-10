import { useState, useRef, useEffect } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';
import { Studio } from '@/studio/Studio';

interface TimelineItem {
  id: string;
  type: 'image' | 'audio' | 'text';
  content: string;
  duration: number;
  startTime: number;
}

const MOCK_TIMELINE: TimelineItem[] = [
  { id: '1', type: 'image', content: '场景1.jpg', duration: 5, startTime: 0 },
  { id: '2', type: 'text', content: '旁白：故事开始...', duration: 3, startTime: 0 },
  { id: '3', type: 'image', content: '场景2.jpg', duration: 5, startTime: 5 },
  { id: '4', type: 'audio', content: '对话1.mp3', duration: 4, startTime: 5 },
];

type CanvasMode = 'normal' | 'studio';

export default function InfiniteCanvas() {
  const [timeline, setTimeline] = useState<TimelineItem[]>(MOCK_TIMELINE);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('normal');
  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '+' && zoom < 200) {
        setZoom((prev) => prev + 10);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-' && zoom > 50) {
        setZoom((prev) => prev - 10);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        setZoom(100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom]);

  const TYPE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    image: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info' },
    audio: { bg: 'bg-success-bg', text: 'text-success', border: 'border-success' },
    text: { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning' },
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="glass flex items-center justify-between px-lg py-md border-b border-outline" style={{ boxShadow: 'var(--shadow-1)' }}>
        <div className="flex items-center gap-lg">
          <h2 className="text-title-lg font-semibold tracking-tight text-on-surface">画布</h2>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setCanvasMode('normal')}
              className={`px-md py-sm text-label-md font-medium rounded-full transition-all duration-normal ${
                canvasMode === 'normal'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-muted text-on-surface-variant hover:text-on-surface hover:bg-hover'
              }`}
              style={canvasMode === 'normal' ? { boxShadow: 'var(--shadow-1)' } : undefined}
            >
              画布模式
            </button>
            <button
              onClick={() => setCanvasMode('studio')}
              className={`px-md py-sm text-label-md font-medium rounded-full transition-all duration-normal flex items-center gap-xs ${
                canvasMode === 'studio'
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-surface-muted text-on-surface-variant hover:text-on-surface hover:bg-hover'
              }`}
              style={canvasMode === 'studio' ? { boxShadow: 'var(--shadow-2)' } : undefined}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              3D导演台
            </button>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs">
            <button onClick={() => setZoom((prev) => Math.max(50, prev - 10))} className="icon-btn" aria-label="缩小">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-body-sm text-on-surface-variant w-16 text-center">{zoom}%</span>
            <button onClick={() => setZoom((prev) => Math.min(200, prev + 10))} className="icon-btn" aria-label="放大">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button onClick={() => setZoom(100)} className="icon-btn" aria-label="重置缩放">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-xs px-sm py-xs bg-surface-muted rounded-lg border border-outline">
            <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
            <span className="text-body-xs text-on-surface-variant">{canvasSize.width} × {canvasSize.height}</span>
          </div>
          <button className="btn-primary">生成视频</button>
        </div>
      </div>

      <div className="flex-1 relative animate-fade-in">
        {canvasMode === 'studio' ? (
          <div className="h-full">
            <Studio />
          </div>
        ) : (
          <div className="h-full flex gap-lg p-lg">
            <div className="flex-1 flex flex-col gap-lg">
              <div className="flex-1 aurora-card flex flex-col relative">
                <div className="flex items-center justify-between p-md border-b border-outline">
                  <span className="text-body-sm text-on-surface-variant">画布</span>
                  <div className="flex items-center gap-sm">
                    <button className="btn-outline text-body-xs">对齐网格</button>
                    <button className="btn-outline text-body-xs">吸附</button>
                  </div>
                </div>
                <div
                  ref={canvasRef}
                  className="flex-1 overflow-auto m-md rounded-xl relative"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, var(--color-tertiary-light) 1px, transparent 1px),
                      radial-gradient(circle, var(--color-tertiary-light) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundRepeat: 'repeat',
                  }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-xl border border-outline"
                    style={{
                      width: `${canvasSize.width * (zoom / 100)}px`,
                      height: `${canvasSize.height * (zoom / 100)}px`,
                      transform: `translate(-50%, -50%) scale(${zoom / 100})`,
                      transformOrigin: 'center center',
                      boxShadow: 'var(--shadow-3)',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-on-surface-variant">
                        <svg className="w-16 h-16 mx-auto mb-md opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <p className="text-body-lg">将图片拖拽到此处进行编排</p>
                        <p className="text-body-sm mt-sm">支持图片、文字、音频的混合编排</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-48 bg-surface border border-outline rounded-lg p-lg transition-all duration-normal" style={{ boxShadow: 'var(--shadow-2)' }}>
                <div className="flex items-center justify-between p-md border-b border-outline">
                  <h3 className="text-title-md font-semibold text-on-surface">时间轴</h3>
                  <div className="flex items-center gap-md">
                    <span className="text-body-sm text-on-surface-variant">00:00</span>
                    <input type="range" min="0" max="60" defaultValue="0" className="w-32 accent-primary" />
                    <span className="text-body-sm text-on-surface-variant">00:30</span>
                    <button className="btn-secondary text-body-sm px-md">播放</button>
                  </div>
                </div>
                <div className="flex-1 p-md">
                  <div className="relative h-24 bg-surface-muted rounded-xl">
                    <div className="absolute inset-y-0 left-0 w-full flex">
                      {timeline.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`absolute top-2 bottom-2 rounded-lg cursor-pointer transition-all duration-normal ${TYPE_CONFIG[item.type].bg} ${TYPE_CONFIG[item.type].text} hover:opacity-90 ${
                            selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                          }`}
                          style={{
                            left: `${(item.startTime / 30) * 100}%`,
                            width: `${(item.duration / 30) * 100}%`,
                          }}
                          title={item.content}
                        >
                          <span className="text-xs font-medium px-xs">{item.content}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-0 bottom-0 w-1 bg-primary z-10 rounded-full transition-all duration-slow" style={{ left: '0%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-64 flex flex-col">
              <div className="aurora-card flex flex-col flex-1">
                <div className="flex items-center justify-between p-md border-b border-outline">
                  <h3 className="text-title-md font-semibold text-on-surface">素材库</h3>
                  <button className="btn-accent text-body-sm">+ 添加</button>
                </div>
                <div className="flex-1 overflow-y-auto p-md">
                  <div className="grid grid-cols-2 gap-sm">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-surface-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-tertiary transition-all duration-normal group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <img
                          src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20scene%20${i}&image_size=square_hd`}
                          alt={`素材 ${i}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-lg card-hover p-md">
                <div className="flex items-center gap-sm mb-md">
                  <button className="flex-1 btn-primary flex items-center justify-center gap-sm text-body-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加图片
                  </button>
                  <button className="flex-1 btn-secondary flex items-center justify-center gap-sm text-body-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    添加文字
                  </button>
                </div>
                <button className="w-full btn-outline flex items-center justify-center gap-sm text-body-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  添加音频
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-10 bg-surface border-t border-outline flex items-center justify-between px-lg text-body-xs text-on-surface-variant">
        <div className="flex items-center gap-md">
          <span>画布尺寸: {canvasSize.width} × {canvasSize.height}</span>
          <span>缩放: {zoom}%</span>
        </div>
        <div className="flex items-center gap-md">
          <span>选中: 0 个元素</span>
          <span>图层: 0</span>
        </div>
      </div>

      <div className="fixed right-lg bottom-12 z-50 animate-slide-up">
        <AIPanel variant="canvas" collapsible defaultCollapsed />
      </div>
    </div>
  );
}