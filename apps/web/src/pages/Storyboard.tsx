import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface StoryboardImage {
  id: string;
  url: string;
  prompt: string;
  type: 'character' | 'costume' | 'scene' | 'storyboard';
  status: 'generated' | 'pending' | 'failed';
}

interface ScriptScene {
  id: string;
  sceneNumber: number;
  description: string;
  dialogue: string;
  cameraAngle: string;
  emotion: string;
  generated: boolean;
}

interface StoryboardPanel {
  id: string;
  shotNumber: number;
  imageUrl: string | undefined;
  prompt: string;
  cameraAngle: string;
  characterAction: string;
  emotion: string;
  dialogue: string;
  status: 'empty' | 'generating' | 'generated' | 'failed';
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  character: { label: '人物', color: 'bg-error-bg text-error' },
  costume: { label: '服装', color: 'bg-purple-light text-tertiary' },
  scene: { label: '场景', color: 'bg-info-bg text-info' },
  storyboard: { label: '分镜', color: 'bg-success-bg text-success' },
};

const SHOT_TYPES = [
  { value: 'extreme-wide', label: '极远景' },
  { value: 'wide', label: '全景' },
  { value: 'medium-wide', label: '中全景' },
  { value: 'medium', label: '中景' },
  { value: 'medium-close', label: '中近景' },
  { value: 'close', label: '近景' },
  { value: 'extreme-close', label: '特写' },
  { value: 'extreme-extreme-close', label: '大特写' },
];

const EMOTIONS = ['开心', '悲伤', '愤怒', '惊讶', '恐惧', '平静', '坚定', '迷茫', '自信', '紧张'];

const MOCK_IMAGES: StoryboardImage[] = [
  { id: '1', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20warrior%20portrait%20dramatic%20lighting&image_size=square_hd', prompt: '古风武士肖像，戏剧化灯光', type: 'character', status: 'generated' },
  { id: '2', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20armor%20detailed%20design&image_size=square_hd', prompt: '传统中式盔甲，精细设计', type: 'costume', status: 'generated' },
  { id: '3', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20temple%20mountains%20sunset&image_size=landscape_16_9', prompt: '古代寺庙，山间日落', type: 'scene', status: 'generated' },
  { id: '4', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20storyboard%20shot%20warrior%20walking%20temple&image_size=landscape_16_9', prompt: '电影分镜，武士走向神庙', type: 'storyboard', status: 'generated' },
];

type WorkflowStep = 'script' | 'storyboard' | 'generate' | 'optimize' | 'animate';

export default function Storyboard() {
  const [images, setImages] = useState<StoryboardImage[]>(MOCK_IMAGES);
  const [selectedImage, setSelectedImage] = useState<StoryboardImage | null>(null);
  const [activeType, setActiveType] = useState<string>('all');
  
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('script');
  
  const [scriptInput, setScriptInput] = useState({
    title: '',
    genre: '',
    style: '',
    synopsis: '',
    shotCount: 15,
    template: '写3分钟AI漫剧脚本，题材：重生逆袭，开篇3秒强冲突，单集15个分镜，台词口语化，每镜标注场景、动作、表情、对话',
  });
  
  const [scriptScenes, setScriptScenes] = useState<ScriptScene[]>([]);
  const [storyboardPanels, setStoryboardPanels] = useState<StoryboardPanel[]>([]);
  
  const [uploadedReferences, setUploadedReferences] = useState<{ character: string[]; scene: string[] }>({
    character: [],
    scene: [],
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const types = ['all', ...Object.keys(TYPE_MAP)];

  const filteredImages = activeType === 'all' 
    ? images 
    : images.filter(img => img.type === activeType);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenes: ScriptScene[] = [
      { id: '1', sceneNumber: 1, description: '主角站在悬崖边缘，狂风呼啸，他手握断剑，眼神坚定地望向远方', dialogue: '主角：这一次，我绝不会再输！', cameraAngle: '全景', emotion: '坚定', generated: true },
      { id: '2', sceneNumber: 2, description: '镜头拉近，主角面部特写，汗水从额头滑落，但眼神中闪烁着不屈的光芒', dialogue: '', cameraAngle: '特写', emotion: '坚定', generated: true },
      { id: '3', sceneNumber: 3, description: '回忆画面：主角被敌人击败，倒在血泊中，敌人的脚踩在他的胸口', dialogue: '敌人：你太弱了，根本不配与我为敌！', cameraAngle: '中景', emotion: '愤怒', generated: true },
      { id: '4', sceneNumber: 4, description: '主角猛然睁开眼睛，回到现实，握紧拳头，指节发白', dialogue: '主角：我...我重生了？', cameraAngle: '特写', emotion: '惊讶', generated: true },
      { id: '5', sceneNumber: 5, description: '主角站起身来，环顾四周，发现自己正站在熟悉的山顶', dialogue: '', cameraAngle: '全景', emotion: '平静', generated: true },
    ];
    
    setScriptScenes(scenes);
    setIsGenerating(false);
  };

  const handleGenerateStoryboard = () => {
    const panels: StoryboardPanel[] = scriptScenes.map((scene, index) => ({
      id: scene.id,
      shotNumber: index + 1,
      imageUrl: undefined,
      prompt: '',
      cameraAngle: scene.cameraAngle,
      characterAction: scene.description,
      emotion: scene.emotion,
      dialogue: scene.dialogue,
      status: 'empty',
    }));
    setStoryboardPanels(panels);
    setWorkflowStep('storyboard');
  };

  const handleGeneratePrompt = (panel: StoryboardPanel) => {
    const prompt = `${panel.characterAction}，${panel.cameraAngle}，表情${panel.emotion}，${panel.dialogue ? `对话：${panel.dialogue}` : ''}，风格写实，光线自然，分辨率1920x1080`;
    setStoryboardPanels(panels => panels.map(p => 
      p.id === panel.id ? { ...p, prompt } : p
    ));
  };

  const handleGenerateImage = async (panel: StoryboardPanel) => {
    setStoryboardPanels(panels => panels.map(p => 
      p.id === panel.id ? { ...p, status: 'generating' } : p
    ));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(panel.prompt || panel.characterAction)}&image_size=landscape_16_9`;
    
    setStoryboardPanels(panels => panels.map(p => 
      p.id === panel.id ? { ...p, imageUrl, status: 'generated' } : p
    ));
  };

  const handleGenerateAllImages = async () => {
    setWorkflowStep('generate');
    for (const panel of storyboardPanels) {
      if (!panel.prompt) {
        await handleGeneratePrompt(panel);
      }
      await handleGenerateImage(panel);
    }
  };

  const handleUploadReference = (type: 'character' | 'scene', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUrls = files.map(() => 
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${type === 'character' ? 'character%20reference' : 'scene%20reference'}&image_size=square_hd`
    );
    
    setUploadedReferences(prev => ({
      ...prev,
      [type]: [...prev[type], ...newUrls],
    }));
  };

  const renderScriptStep = () => (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="aurora-card mb-lg" style={{ boxShadow: 'var(--shadow-2)' }}>
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold tracking-tight text-on-surface">剧本生成</h3>
          <span className="badge-accent ml-auto">AI 智能创作</span>
        </div>
        <div className="grid grid-cols-2 gap-lg">
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">标题</label>
            <input
              type="text"
              value={scriptInput.title}
              onChange={(e) => setScriptInput(prev => ({ ...prev, title: e.target.value }))}
              className="input-field w-full"
              placeholder="输入剧本标题"
            />
          </div>
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">题材</label>
            <select
              value={scriptInput.genre}
              onChange={(e) => setScriptInput(prev => ({ ...prev, genre: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">选择题材</option>
              <option value="rebirth">重生逆袭</option>
              <option value="fantasy">玄幻仙侠</option>
              <option value="modern">都市情感</option>
              <option value="historical">历史传奇</option>
              <option value="sci-fi">科幻未来</option>
              <option value="comedy">喜剧搞笑</option>
            </select>
          </div>
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">风格</label>
            <select
              value={scriptInput.style}
              onChange={(e) => setScriptInput(prev => ({ ...prev, style: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">选择风格</option>
              <option value="realistic">写实</option>
              <option value="anime">动漫</option>
              <option value="cartoon">卡通</option>
              <option value="cyberpunk">赛博朋克</option>
              <option value="fantasy">奇幻</option>
              <option value="minimalist">极简</option>
            </select>
          </div>
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">分镜数量</label>
            <input
              type="number"
              min="5"
              max="30"
              value={scriptInput.shotCount}
              onChange={(e) => setScriptInput(prev => ({ ...prev, shotCount: parseInt(e.target.value) || 15 }))}
              className="input-field w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">故事梗概</label>
            <textarea
              value={scriptInput.synopsis}
              onChange={(e) => setScriptInput(prev => ({ ...prev, synopsis: e.target.value }))}
              className="input-field w-full h-24 resize-none"
              placeholder="简要描述故事内容..."
            />
          </div>
          <div className="col-span-2">
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">生成模板</label>
            <textarea
              value={scriptInput.template}
              onChange={(e) => setScriptInput(prev => ({ ...prev, template: e.target.value }))}
              className="input-field w-full h-16 resize-none"
              placeholder="使用此模板指导AI生成剧本..."
            />
          </div>
        </div>
        <button
          onClick={handleGenerateScript}
          disabled={isGenerating}
          className="mt-lg btn-primary w-full transition-all duration-normal"
        >
          {isGenerating ? '生成中...' : '生成剧本'}
        </button>
      </div>

      {scriptScenes.length > 0 && (
        <div className="card-elevated animate-fade-in">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center gap-md">
              <span className="w-1 h-6 rounded-full bg-tertiary" />
              <h3 className="text-title-lg font-semibold text-on-surface">生成的剧本</h3>
            </div>
            <button onClick={handleGenerateStoryboard} className="btn-accent transition-all duration-normal">
              生成分镜
            </button>
          </div>
          <div className="space-y-md">
            {scriptScenes.map((scene) => (
              <div key={scene.id} className="p-md bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="badge-accent">
                    场景 {scene.sceneNumber}
                  </span>
                  <span className="badge">
                    {scene.cameraAngle}
                  </span>
                  <span className="badge">
                    {scene.emotion}
                  </span>
                </div>
                <p className="text-body-md text-on-surface mb-sm">{scene.description}</p>
                {scene.dialogue && (
                  <p className="text-body-sm text-tertiary italic">"{scene.dialogue}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStoryboardStep = () => (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="card-elevated mb-lg">
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold text-on-surface">参考图上传</h3>
        </div>
        <div className="grid grid-cols-2 gap-lg">
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">人物参考图</label>
            <div className="border-2 border-dashed border-outline rounded-lg p-lg bg-surface-muted transition-all duration-normal hover:border-outline-focused hover:bg-purple-light">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUploadReference('character', e)}
                className="hidden"
                id="character-upload"
              />
              <label htmlFor="character-upload" className="cursor-pointer flex flex-col items-center gap-sm">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-body-sm text-on-surface-variant">点击上传人物参考图</span>
              </label>
              {uploadedReferences.character.length > 0 && (
                <div className="grid grid-cols-3 gap-sm mt-md">
                  {uploadedReferences.character.map((url, i) => (
                    <img key={i} src={url} alt={`人物参考 ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">场景参考图</label>
            <div className="border-2 border-dashed border-outline rounded-lg p-lg bg-surface-muted transition-all duration-normal hover:border-outline-focused hover:bg-purple-light">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUploadReference('scene', e)}
                className="hidden"
                id="scene-upload"
              />
              <label htmlFor="scene-upload" className="cursor-pointer flex flex-col items-center gap-sm">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
                <span className="text-body-sm text-on-surface-variant">点击上传场景参考图</span>
              </label>
              {uploadedReferences.scene.length > 0 && (
                <div className="grid grid-cols-3 gap-sm mt-md">
                  {uploadedReferences.scene.map((url, i) => (
                    <img key={i} src={url} alt={`场景参考 ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="aurora-card">
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <span className="w-1 h-6 rounded-full bg-tertiary" />
            <h3 className="text-title-lg font-semibold tracking-tight text-on-surface">分镜设计</h3>
          </div>
          <button onClick={handleGenerateAllImages} className="btn-primary transition-all duration-normal">
            一键生成所有画面
          </button>
        </div>
        <div className="grid grid-cols-2 gap-xl">
          {storyboardPanels.map((panel, index) => (
              <div key={panel.id} className="card-hover p-md animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between mb-sm">
                <span className="badge-accent">镜头 {panel.shotNumber}</span>
                <span className={`badge ${
                  panel.status === 'generated' ? 'badge-success' :
                  panel.status === 'generating' ? 'badge-warning' :
                  panel.status === 'failed' ? 'badge-error' : 'badge'
                }`}>
                  {panel.status === 'generated' ? '已生成' :
                   panel.status === 'generating' ? '生成中' :
                   panel.status === 'failed' ? '失败' : '待生成'}
                </span>
              </div>

              <div className="aspect-video bg-surface-muted rounded-lg overflow-hidden mb-sm border border-outline">
                {panel.imageUrl ? (
                  <img src={panel.imageUrl} alt={`镜头 ${panel.shotNumber}`} className="w-full h-full object-cover transition-all duration-normal" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-sm text-on-surface-muted">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-label-sm">等待生成画面</span>
                  </div>
                )}
              </div>

              <div className="space-y-sm">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">景别</label>
                  <select
                    value={panel.cameraAngle}
                    onChange={(e) => setStoryboardPanels(panels => panels.map(p => 
                      p.id === panel.id ? { ...p, cameraAngle: e.target.value } : p
                    ))}
                    className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal"
                  >
                    {SHOT_TYPES.map(shot => (
                      <option key={shot.value} value={shot.value}>{shot.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">动作描述</label>
                  <input
                    type="text"
                    value={panel.characterAction}
                    onChange={(e) => setStoryboardPanels(panels => panels.map(p => 
                      p.id === panel.id ? { ...p, characterAction: e.target.value } : p
                    ))}
                    className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal"
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">情绪</label>
                  <select
                    value={panel.emotion}
                    onChange={(e) => setStoryboardPanels(panels => panels.map(p => 
                      p.id === panel.id ? { ...p, emotion: e.target.value } : p
                    ))}
                    className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal"
                  >
                    {EMOTIONS.map(emotion => (
                      <option key={emotion} value={emotion}>{emotion}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">台词</label>
                  <input
                    type="text"
                    value={panel.dialogue}
                    onChange={(e) => setStoryboardPanels(panels => panels.map(p => 
                      p.id === panel.id ? { ...p, dialogue: e.target.value } : p
                    ))}
                    className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal"
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">提示词</label>
                  <textarea
                    value={panel.prompt}
                    onChange={(e) => setStoryboardPanels(panels => panels.map(p => 
                      p.id === panel.id ? { ...p, prompt: e.target.value } : p
                    ))}
                    className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm h-16 resize-none transition-all duration-normal"
                    placeholder="自动生成的提示词..."
                  />
                </div>
              </div>

              <div className="flex gap-sm mt-sm">
                <button
                  onClick={() => handleGeneratePrompt(panel)}
                  className="flex-1 btn-secondary text-body-sm transition-all duration-normal"
                >
                  生成提示词
                </button>
                <button
                  onClick={() => handleGenerateImage(panel)}
                  disabled={panel.status === 'generating'}
                  className="flex-1 btn-primary text-body-sm transition-all duration-normal"
                >
                  {panel.status === 'generating' ? '生成中' : '生成画面'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGenerateStep = () => (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="card-elevated">
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold text-on-surface">画面生成结果</h3>
        </div>
        <div className="grid grid-cols-3 gap-xl">
          {storyboardPanels.map((panel, index) => (
              <div key={panel.id} className="card-hover p-0 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="relative aspect-video">
                {panel.imageUrl ? (
                  <img src={panel.imageUrl} alt={`镜头 ${panel.shotNumber}`} className="w-full h-full object-cover transition-all duration-normal" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-sm text-on-surface-muted bg-surface-muted">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-label-sm">待生成</span>
                  </div>
                )}
                <span className="absolute top-sm left-sm px-sm py-xs bg-primary/70 backdrop-blur-sm text-on-primary text-label-sm rounded-full">
                  镜头 {panel.shotNumber}
                </span>
              </div>
              <div className="p-md">
                <p className="text-body-sm text-on-surface-variant line-clamp-2">{panel.prompt}</p>
                <button className="mt-sm btn-secondary text-body-sm w-full transition-all duration-normal">优化画面</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOptimizeStep = () => (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="card-elevated">
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold text-on-surface">画面优化</h3>
        </div>
        <div className="grid grid-cols-3 gap-xl">
          {storyboardPanels.filter(p => p.imageUrl).map((panel) => (
            <div key={panel.id} className="card-hover p-md animate-fade-in">
              <div className="aspect-video bg-surface-muted rounded-lg overflow-hidden mb-sm border border-outline">
                <img src={panel.imageUrl} alt={`镜头 ${panel.shotNumber}`} className="w-full h-full object-cover transition-all duration-normal" />
              </div>
              <div className="space-y-sm">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">优化方向</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="">选择优化方向</option>
                    <option value="style">风格统一</option>
                    <option value="character">角色一致性</option>
                    <option value="lighting">光影调整</option>
                    <option value="detail">细节增强</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">优化提示词</label>
                  <textarea className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm h-12 resize-none transition-all duration-normal" />
                </div>
                <button className="btn-primary text-body-sm w-full transition-all duration-normal">应用优化</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnimateStep = () => (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="card-elevated mb-lg">
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold text-on-surface">动态化处理</h3>
        </div>
        <div className="grid grid-cols-3 gap-xl">
          {storyboardPanels.filter(p => p.imageUrl).map((panel) => (
            <div key={panel.id} className="card-hover p-md animate-fade-in">
              <div className="aspect-video bg-surface-muted rounded-lg overflow-hidden mb-sm border border-outline">
                <img src={panel.imageUrl} alt={`镜头 ${panel.shotNumber}`} className="w-full h-full object-cover transition-all duration-normal" />
              </div>
              <div className="space-y-sm">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">动态化工具</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="">选择工具</option>
                    <option value="runway">Runway Gen-2</option>
                    <option value="pika">Pika</option>
                    <option value="kling">可灵</option>
                    <option value="jimeng">即梦</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">动态效果</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="">选择效果</option>
                    <option value="camera-move">镜头移动</option>
                    <option value="character-move">人物动作</option>
                    <option value="background-move">背景流动</option>
                    <option value="full-motion">全动态</option>
                  </select>
                </div>
                <button className="btn-accent text-body-sm w-full transition-all duration-normal">生成动态视频</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated">
        <div className="flex items-center gap-md mb-lg">
          <span className="w-1 h-6 rounded-full bg-tertiary" />
          <h3 className="text-title-lg font-semibold text-on-surface">配音与音效</h3>
        </div>
        <div className="grid grid-cols-2 gap-lg">
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">背景音乐</label>
            <select className="input-field w-full">
              <option value="">选择背景音乐</option>
              <option value="epic">史诗</option>
              <option value="emotional">情感</option>
              <option value="tension">紧张</option>
              <option value="peaceful">平静</option>
            </select>
          </div>
          <div>
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">音效</label>
            <select className="input-field w-full">
              <option value="">选择音效</option>
              <option value="sword">刀剑</option>
              <option value="footstep">脚步声</option>
              <option value="wind">风声</option>
              <option value="fire">火焰</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-label-md font-medium text-on-surface-variant mb-sm">角色配音</label>
            <div className="space-y-sm">
              {storyboardPanels.filter(p => p.dialogue).map((panel) => (
                <div key={panel.id} className="flex items-center gap-md p-md bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                  <span className="badge-accent">镜头 {panel.shotNumber}</span>
                  <span className="text-body-sm text-on-surface flex-1">{panel.dialogue}</span>
                  <select className="px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="">选择音色</option>
                    <option value="male-deep">深沉男声</option>
                    <option value="male-clear">清亮男声</option>
                    <option value="female-soft">柔和女声</option>
                    <option value="female-powerful">有力女声</option>
                  </select>
                  <button className="btn-secondary text-body-sm px-md transition-all duration-normal">生成配音</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button className="mt-lg btn-primary w-full transition-all duration-normal">导出完整视频</button>
      </div>
    </div>
  );

  const STEPS: { key: WorkflowStep; label: string; icon: string }[] = [
    { key: 'script', label: '剧本生成', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { key: 'storyboard', label: '分镜设计', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { key: 'generate', label: '画面生成', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { key: 'optimize', label: '画面优化', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { key: 'animate', label: '动态化', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-lg py-md bg-surface border-b border-outline">
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-sm">
            <span className="w-1 h-6 rounded-full bg-tertiary" />
            <h2 className="text-title-lg font-semibold tracking-tight text-on-surface">故事板</h2>
          </div>
          <div className="flex items-center gap-xs">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => setWorkflowStep(step.key)}
                  style={{ boxShadow: workflowStep === step.key ? 'var(--shadow-2)' : 'none' }}
                  className={`flex items-center gap-sm px-md py-sm rounded-full transition-all duration-normal ${
                    workflowStep === step.key
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-muted'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                  <span className="text-label-md font-medium">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <svg className="w-4 h-4 text-on-surface-muted ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-lg p-lg">
        {workflowStep === 'script' && renderScriptStep()}
        {workflowStep === 'storyboard' && renderStoryboardStep()}
        {workflowStep === 'generate' && renderGenerateStep()}
        {workflowStep === 'optimize' && renderOptimizeStep()}
        {workflowStep === 'animate' && renderAnimateStep()}

        <div className="w-80 flex flex-col gap-lg">
          {workflowStep === 'script' && (
            <div className="card-hover animate-fade-in">
              <div className="flex items-center gap-md mb-md">
                <span className="w-1 h-5 rounded-full bg-tertiary" />
                <h3 className="text-title-md font-semibold text-on-surface">AI 辅助创作</h3>
              </div>
              <AIPanel variant="storyboard" presetAgents={['screenwriter']} />
            </div>
          )}
          {workflowStep === 'storyboard' && (
            <div className="card-hover p-md animate-fade-in">
              <div className="flex items-center gap-md mb-md">
                <span className="w-1 h-5 rounded-full bg-tertiary" />
                <h3 className="text-title-md font-semibold text-on-surface">质量控制</h3>
              </div>
              <div className="space-y-md">
                <div className="flex items-center justify-between p-sm bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                  <span className="text-body-sm text-on-surface-variant">风格统一</span>
                  <span className="text-body-sm text-success flex items-center gap-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已启用
                  </span>
                </div>
                <div className="flex items-center justify-between p-sm bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                  <span className="text-body-sm text-on-surface-variant">角色一致性</span>
                  <span className="text-body-sm text-success flex items-center gap-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已启用
                  </span>
                </div>
                <div className="flex items-center justify-between p-sm bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                  <span className="text-body-sm text-on-surface-variant">提示词优化</span>
                  <span className="text-body-sm text-success flex items-center gap-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已启用
                  </span>
                </div>
              </div>
            </div>
          )}
          {workflowStep === 'generate' && (
            <div className="card-hover p-md animate-fade-in">
              <div className="flex items-center gap-md mb-md">
                <span className="w-1 h-5 rounded-full bg-tertiary" />
                <h3 className="text-title-md font-semibold text-on-surface">生图设置</h3>
              </div>
              <div className="space-y-sm">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">分辨率</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="1920x1080">1920 × 1080</option>
                    <option value="1280x720">1280 × 720</option>
                    <option value="2560x1440">2560 × 1440</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">风格</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="realistic">写实</option>
                    <option value="anime">动漫</option>
                    <option value="cartoon">卡通</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">光照</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="natural">自然光</option>
                    <option value="warm">暖色调</option>
                    <option value="cool">冷色调</option>
                    <option value="dramatic">戏剧化</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {workflowStep === 'optimize' && (
            <div className="card-hover p-md animate-fade-in">
              <div className="flex items-center gap-md mb-md">
                <span className="w-1 h-5 rounded-full bg-tertiary" />
                <h3 className="text-title-md font-semibold text-on-surface">优化建议</h3>
              </div>
              <ul className="space-y-sm text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-sm">
                  <span className="text-tertiary">•</span>
                  <span>检查角色特征是否在所有镜头中保持一致</span>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="text-tertiary">•</span>
                  <span>确保光线和色彩风格统一</span>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="text-tertiary">•</span>
                  <span>调整画面构图，增强视觉冲击力</span>
                </li>
              </ul>
            </div>
          )}
          {workflowStep === 'animate' && (
            <div className="card-hover p-md animate-fade-in">
              <div className="flex items-center gap-md mb-md">
                <span className="w-1 h-5 rounded-full bg-tertiary" />
                <h3 className="text-title-md font-semibold text-on-surface">动态化设置</h3>
              </div>
              <div className="space-y-sm">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">输出格式</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="mp4">MP4</option>
                    <option value="mov">MOV</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-xs">帧率</label>
                  <select className="w-full px-md py-xs bg-surface border border-outline rounded-lg text-body-sm transition-all duration-normal">
                    <option value="24">24 FPS</option>
                    <option value="30">30 FPS</option>
                    <option value="60">60 FPS</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
