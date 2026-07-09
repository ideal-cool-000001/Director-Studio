import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

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

export default function InfiniteCanvas() {
  const [timeline, setTimeline] = useState<TimelineItem[]>(MOCK_TIMELINE);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  const TYPE_COLORS: Record<string, string> = {
    image: 'bg-blue-500',
    audio: 'bg-green-500',
    text: 'bg-yellow-500',
  };

  return (
    <div className="h-full flex flex-col gap-lg p-lg">
      <div className="flex-1 flex gap-lg">
        <div className="flex-1 card flex flex-col">
          <div className="flex items-center justify-between p-md border-b border-outline">
            <h3 className="text-body-lg font-semibold text-on-surface">画布区域</h3>
            <div className="flex gap-md">
              <button className="btn-outline">缩放</button>
              <button className="btn-outline">重置视角</button>
              <button className="btn-primary">生成视频</button>
            </div>
          </div>
          <div className="flex-1 bg-secondary rounded-lg m-md flex items-center justify-center">
            <div className="text-center text-on-surface-variant">
              <svg className="w-16 h-16 mx-auto mb-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <p className="text-body-md">将图片拖拽到此处进行编排</p>
              <p className="text-body-sm mt-xs">支持图片、文字、音频的混合编排</p>
            </div>
          </div>
        </div>

        <div className="w-64 card flex flex-col">
          <div className="flex items-center justify-between p-md border-b border-outline">
            <h3 className="text-body-md font-semibold text-on-surface">素材库</h3>
            <button className="btn-purple">+ 添加</button>
          </div>
          <div className="flex-1 overflow-y-auto p-md">
            <div className="grid grid-cols-2 gap-sm">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-secondary rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <img
                    src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20scene%20${i}&image_size=square_hd`}
                    alt={`素材 ${i}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-48 card">
        <div className="flex items-center justify-between p-md border-b border-outline">
          <h3 className="text-body-md font-semibold text-on-surface">时间轴</h3>
          <div className="flex items-center gap-md">
            <span className="text-body-sm text-on-surface-variant">00:00</span>
            <input type="range" min="0" max="60" defaultValue="0" className="w-32" />
            <span className="text-body-sm text-on-surface-variant">00:30</span>
            <button className="btn-secondary text-body-sm px-md">播放</button>
          </div>
        </div>
        <div className="flex-1 p-md">
          <div className="relative h-24 bg-secondary rounded-md">
            <div className="absolute inset-y-0 left-0 w-full flex">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`absolute top-2 bottom-2 rounded cursor-pointer transition-all ${TYPE_COLORS[item.type]} hover:opacity-80 ${
                    selectedItem?.id === item.id ? 'ring-2 ring-white' : ''
                  }`}
                  style={{
                    left: `${(item.startTime / 30) * 100}%`,
                    width: `${(item.duration / 30) * 100}%`,
                  }}
                  title={item.content}
                >
                  <span className="text-xs text-white px-xs">{item.content}</span>
                </div>
              ))}
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-10" style={{ left: '0%' }} />
          </div>
        </div>
      </div>

      <div className="fixed right-lg bottom-lg w-80">
        <AIPanel presetAgents={['art', 'director']} />
      </div>
    </div>
  );
}