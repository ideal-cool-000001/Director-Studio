import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface StoryboardImage {
  id: string;
  url: string;
  prompt: string;
  type: 'character' | 'costume' | 'scene' | 'storyboard';
  status: 'generated' | 'pending' | 'failed';
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  character: { label: '人物', color: 'bg-red-500' },
  costume: { label: '服装', color: 'bg-purple-500' },
  scene: { label: '场景', color: 'bg-blue-500' },
  storyboard: { label: '分镜', color: 'bg-green-500' },
};

const MOCK_IMAGES: StoryboardImage[] = [
  { id: '1', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20warrior%20portrait%20dramatic%20lighting&image_size=square_hd', prompt: '古风武士肖像，戏剧化灯光', type: 'character', status: 'generated' },
  { id: '2', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20armor%20detailed%20design&image_size=square_hd', prompt: '传统中式盔甲，精细设计', type: 'costume', status: 'generated' },
  { id: '3', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20temple%20mountains%20sunset&image_size=landscape_16_9', prompt: '古代寺庙，山间日落', type: 'scene', status: 'generated' },
  { id: '4', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20storyboard%20shot%20warrior%20walking%20temple&image_size=landscape_16_9', prompt: '电影分镜，武士走向神庙', type: 'storyboard', status: 'generated' },
];

export default function Storyboard() {
  const [images, setImages] = useState<StoryboardImage[]>(MOCK_IMAGES);
  const [selectedImage, setSelectedImage] = useState<StoryboardImage | null>(null);
  const [activeType, setActiveType] = useState<string>('all');

  const types = ['all', ...Object.keys(TYPE_MAP)];

  const filteredImages = activeType === 'all' 
    ? images 
    : images.filter(img => img.type === activeType);

  return (
    <div className="h-full flex gap-lg p-lg">
      <div className="flex-1 flex flex-col gap-lg">
        <div className="flex items-center justify-between">
          <div className="flex gap-md">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={activeType === type ? 'tab-active' : 'tab-inactive'}
              >
                {type === 'all' ? '全部' : TYPE_MAP[type].label}
              </button>
            ))}
          </div>
          <button className="btn-primary">批量生成</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-md">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`card cursor-pointer hover:shadow-card transition-all ${
                  selectedImage?.id === image.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="relative aspect-video rounded-md overflow-hidden mb-sm">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className={`absolute top-sm left-sm px-sm py-xs text-label-sm rounded-full ${TYPE_MAP[image.type].color} text-white`}>
                    {TYPE_MAP[image.type].label}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant line-clamp-2">{image.prompt}</p>
              </div>
            ))}

            <div className="card border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
              <svg className="w-8 h-8 text-on-surface-variant mb-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-body-sm text-on-surface-variant">添加图片</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-md">
          <button className="btn-secondary">上一页</button>
          <span className="text-body-md text-on-surface-variant">1 / 5</span>
          <button className="btn-secondary">下一页</button>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-lg">
        <div className="card">
          <h3 className="text-body-lg font-semibold text-on-surface mb-md">选中图片详情</h3>
          {selectedImage ? (
            <div className="space-y-md">
              <div className="aspect-video rounded-md overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">提示词</label>
                <textarea
                  value={selectedImage.prompt}
                  onChange={(e) => {
                    setImages(images.map(img => 
                      img.id === selectedImage.id ? { ...img, prompt: e.target.value } : img
                    ));
                    setSelectedImage({ ...selectedImage, prompt: e.target.value });
                  }}
                  className="input-field w-full h-24 resize-none"
                />
              </div>
              <div className="flex gap-md">
                <button className="flex-1 btn-outline">重新生成</button>
                <button className="flex-1 btn-primary">使用</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
              <svg className="w-12 h-12 mb-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-body-sm">选择一张图片查看详情</p>
            </div>
          )}
        </div>

        <AIPanel presetAgents={['character', 'art']} />
      </div>
    </div>
  );
}