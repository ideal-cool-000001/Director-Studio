import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

const MOCK_PLATFORMS: Platform[] = [
  { id: 'douyin', name: '抖音', icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z', connected: true },
  { id: 'kuaishou', name: '快手', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z', connected: false },
  { id: 'bilibili', name: 'B站', icon: 'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.64 6.8c-.15 1.58-.8 3.1-1.75 4.26-.96 1.17-2.23 2.12-3.84 2.77v2.97h-3.65v-2.96c-1.61-.66-2.88-1.62-3.84-2.78-1.52-1.81-2.38-4.03-2.38-6.53 0-.54.05-1.08.14-1.6.06-.33.12-.57.38-.57.19 0 .5.12.74.29 1.04.77 2.36 1.21 3.84 1.21.66 0 1.32-.09 1.96-.28.64-.19 1.25-.46 1.77-.82-.57-.37-1.17-.8-1.78-1.27-.61-.47-1.29-.86-2.03-1.17-.74-.31-1.4-.47-2.11-.47-1.31 0-2.51.31-3.54.86-1.03.55-1.87 1.31-2.47 2.25-.61.95-.92 2.01-.92 3.14 0 2.52.88 4.76 2.56 6.51 1.69 1.76 3.96 2.71 6.57 2.71 2.61 0 4.88-.95 6.57-2.71 1.69-1.75 2.57-3.99 2.57-6.51 0-1.13-.31-2.19-.92-3.14-.61-.94-1.45-1.7-2.48-2.25-.33-.16-.57-.23-.57-.54 0-.28.23-.5.5-.5.34 0 .72.11 1.08.33.9.58 1.89.88 2.95.88 1.31 0 2.51-.31 3.54-.86 1.03-.55 1.87-1.31 2.47-2.25.61-.95.92-2.01.92-3.14 0-2.52-.88-4.76-2.56-6.51-1.69-1.76-3.96-2.71-6.57-2.71-2.61 0-4.88.95-6.57 2.71z', connected: true },
  { id: 'weibo', name: '微博', icon: 'M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.218-1.78.878-2.015.977-.235.099-.47-.141-.371-.429.099-.287 1.326-.876 1.671-1.109.345-.233.68-.079.515.561zm1.899-1.767c-.333.179-1.064.647-1.288.783-.224.136-.44-.136-.336-.369.104-.233.842-.646 1.159-.825.317-.179.531.017.465.411zm2.066-1.893c-.276.161-.801.58-1.008.719-.207.139-.407-.128-.322-.329.085-.201.666-.568.917-.686.251-.118.407.085.313.296zm2.37-2.141c-.285.144-.682.481-.872.611-.19.13-.369-.12-.299-.306.07-.186.521-.527.781-.625.26-.098.409.104.39.32zm.083-2.307c-.141-.028-.776-.219-1.424-.459-.649-.24-.97-.361-1.049-.361-.078 0-.429.141-1.059.371-.631.23-.893.319-.982.319-.088 0-.267-.079-.366-.179-.098-.099-.158-.24-.13-.391.028-.141.219-.776.459-1.424.24-.649.361-.97.361-1.049 0-.078-.141-.429-.371-1.059-.23-.631-.319-.893-.319-.982 0-.088.079-.267.179-.366.099-.098.24-.158.391-.13.141.028.776.219 1.424.459.649.24.97.361 1.049.361.078 0 .429-.141 1.059-.371.631-.23.893-.319.982-.319.088 0 .267.079.366.179.098.099.158.24.13.391-.028.141-.219.776-.459 1.424-.24.649-.361.97-.361 1.049 0 .078.141.429.371 1.059.23.631.319.893.319.982 0 .088-.079.267-.179.366-.099.098-.24.158-.391.13zm-.064-3.538c-.163-.081-.389-.122-.581-.104-.192.018-.407.079-.559.179-.152.1-.24.267-.231.459.009.192.081.407.181.559.1.152.267.24.459.231.192-.009.407-.081.559-.181.152-.1.24-.267.231-.459-.009-.192-.061-.408-.141-.581zm-2.978.131c-.079-.1-.122-.231-.104-.381.018-.152.079-.303.179-.422.1-.119.24-.207.391-.235.152-.028.283-.01.403.079.12.089.208.23.236.381.028.152.01.283-.079.403-.089.12-.23.208-.381.236-.152.028-.283.01-.403-.079zm2.882-2.873c-.079-.079-.178-.122-.283-.113-.104.009-.218.059-.307.139-.089.08-.139.193-.13.307.009.104.059.218.139.307.08.089.193.139.307.13.104-.009.218-.059.307-.139.089-.08.139-.193.13-.307-.009-.104-.059-.218-.139-.307z', connected: false },
];

const MOCK_VIDEOS: Video[] = [
  { id: '1', title: '科幻短剧第一集', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sci-fi%20video%20thumbnail&image_size=square_hd', duration: '05:30' },
];

export default function Publish() {
  const [platforms, setPlatforms] = useState<Platform[]>(MOCK_PLATFORMS);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['douyin', 'bilibili']);
  const [selectedVideo, setSelectedVideo] = useState(MOCK_VIDEOS[0]);

  const togglePlatform = (platformId: string) => {
    if (!platforms.find(p => p.id === platformId)?.connected) return;
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  return (
    <div className="h-full flex gap-lg p-lg">
      <div className="flex-1 flex flex-col gap-lg">
        <div className="card">
          <h3 className="text-body-lg font-semibold text-on-surface mb-md">选择发布平台</h3>
          <div className="grid grid-cols-4 gap-md">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`flex flex-col items-center p-lg rounded-xl transition-all ${
                  platform.connected
                    ? selectedPlatforms.includes(platform.id)
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary hover:bg-hover'
                    : 'bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <svg className="w-8 h-8 mb-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d={platform.icon} />
                </svg>
                <span className="text-body-sm font-medium">{platform.name}</span>
                {!platform.connected && (
                  <span className="text-body-xs mt-xs">未连接</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 card flex flex-col">
          <div className="flex items-center justify-between p-md border-b border-outline">
            <h3 className="text-body-lg font-semibold text-on-surface">发布设置</h3>
            <button className="btn-primary">一键发布</button>
          </div>
          <div className="flex-1 overflow-y-auto p-lg">
            <div className="grid grid-cols-2 gap-lg">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">选择视频</label>
                <div className="flex gap-md">
                  {MOCK_VIDEOS.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedVideo?.id === video.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">视频标题</label>
                <input
                  type="text"
                  value={selectedVideo?.title || ''}
                  onChange={(e) => setSelectedVideo({ ...selectedVideo!, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="输入视频标题"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-sm">视频描述</label>
                <textarea
                  className="input-field w-full h-32 resize-none"
                  placeholder="输入视频描述..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-label-md text-on-surface-variant mb-sm">话题标签</label>
                <div className="flex flex-wrap gap-xs">
                  {['#科幻', '#短剧', '#AI创作'].map((tag) => (
                    <span key={tag} className="badge-accent">{tag}</span>
                  ))}
                  <input
                    type="text"
                    className="input-field w-32"
                    placeholder="添加标签"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80">
        <AIPanel presetAgents={['distributor']} />
      </div>
    </div>
  );
}