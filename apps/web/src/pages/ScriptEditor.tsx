import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface Character {
  id: string;
  name: string;
  role: 'lead' | 'supporting' | 'extra';
  description: string;
  age: number;
  personality: string;
  background: string;
  motivation: string;
  appearance: {
    hair: string;
    eyes: string;
    style: string;
  };
}

interface Scene {
  id: string;
  title: string;
  content: string;
  background: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  mood: string;
}

interface Chapter {
  id: string;
  title: string;
  scenes: string[];
  wordCount: number;
}

const MOCK_CHARACTERS: Character[] = [
  {
    id: '1', name: '林浩', role: 'lead', description: '年轻的探险家，勇敢正直',
    age: 25, personality: '勇敢、好奇、固执', background: '来自偏远山村，从小向往外面的世界',
    motivation: '寻找失踪的父亲',
    appearance: { hair: '黑色短发', eyes: '深邃棕色', style: '休闲探险装' }
  },
  {
    id: '2', name: '小雪', role: 'supporting', description: '神秘的向导，掌握古老知识',
    age: 23, personality: '神秘、冷静、聪慧', background: '守护神庙的后裔',
    motivation: '保护神庙的秘密',
    appearance: { hair: '银色长发', eyes: '淡蓝色', style: '古风长袍' }
  },
];

const MOCK_SCENES: Scene[] = [
  { id: '1', title: '第一幕：启程', content: '林浩背着行囊，踏上了未知的旅程。清晨的阳光洒在山间小路上，薄雾缭绕，仿佛在诉说着古老的故事...',
    background: '现代', location: '山间小路', timeOfDay: '清晨', characters: ['林浩'], mood: '期待' },
  { id: '2', title: '第二幕：相遇', content: '在古老的神庙前，林浩遇见了小雪。她身着古风长袍，银色长发随风飘动，眼神中透露出神秘的光芒...',
    background: '现代/古风混合', location: '古老神庙', timeOfDay: '黄昏', characters: ['林浩', '小雪'], mood: '神秘' },
];

const MOCK_CHAPTERS: Chapter[] = [
  { id: '1', title: '第一章：启程', scenes: ['1'], wordCount: 250 },
  { id: '2', title: '第二章：相遇', scenes: ['2'], wordCount: 320 },
];

export default function ScriptEditor() {
  const [characters, setCharacters] = useState<Character[]>(MOCK_CHARACTERS);
  const [scenes, setScenes] = useState<Scene[]>(MOCK_SCENES);
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_CHAPTERS);
  const [selectedScene, setSelectedScene] = useState(scenes[0]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'scenes' | 'characters'>('scenes');
  const [aiAction, setAiAction] = useState<'continue' | 'polish' | 'generate' | null>(null);

  const handleAiAction = (action: 'continue' | 'polish' | 'generate') => {
    setAiAction(action);
  };

  const getSceneWordCount = (scene: Scene) => scene.content.length;

  return (
    <div className="h-full flex gap-lg p-lg">
      <div className="flex-1 flex flex-col gap-lg">
        <div className="flex gap-md">
          <button
            onClick={() => setActiveTab('chapters')}
            className={activeTab === 'chapters' ? 'tab-active' : 'tab-inactive'}
          >
            章节大纲
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={activeTab === 'scenes' ? 'tab-active' : 'tab-inactive'}
          >
            场景编辑
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={activeTab === 'characters' ? 'tab-active' : 'tab-inactive'}
          >
            人物设定
          </button>
        </div>

        {activeTab === 'chapters' && (
          <div className="flex-1 card flex flex-col">
            <div className="flex items-center justify-between p-md border-b border-outline">
              <h3 className="text-body-md font-semibold text-on-surface">章节列表</h3>
              <button className="btn-purple">+ 添加章节</button>
            </div>
            <div className="flex-1 overflow-y-auto p-md">
              <div className="space-y-md">
                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className="flex items-center gap-md p-md bg-secondary rounded-lg">
                    <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-body-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, title: e.target.value } : c))}
                        className="text-body-md font-medium bg-transparent border-none outline-none"
                      />
                      <p className="text-body-sm text-on-surface-variant">
                        {chapter.scenes.length} 个场景 | {chapter.wordCount} 字
                      </p>
                    </div>
                    <button className="btn-outline text-body-sm">编辑</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="flex-1 flex gap-lg">
            <div className="w-72 card flex flex-col">
              <div className="flex items-center justify-between p-md border-b border-outline">
                <h3 className="text-body-md font-semibold text-on-surface">场景列表</h3>
                <button className="btn-purple">+ 添加</button>
              </div>
              <div className="flex-1 overflow-y-auto p-md">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene)}
                    className={`w-full text-left p-md rounded-lg mb-sm transition-colors ${
                      selectedScene?.id === scene.id ? 'bg-primary text-on-primary' : 'bg-secondary hover:bg-hover'
                    }`}
                  >
                    <p className="text-body-sm font-medium">{scene.title}</p>
                    <p className="text-body-xs text-muted mt-xs truncate">{scene.location} - {scene.timeOfDay}</p>
                    <p className="text-body-xs mt-xs opacity-70">{getSceneWordCount(scene)} 字</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 card flex flex-col">
              <div className="flex items-center justify-between p-md border-b border-outline">
                <input
                  type="text"
                  value={selectedScene?.title || ''}
                  onChange={(e) => setSelectedScene({ ...selectedScene!, title: e.target.value })}
                  className="text-headline-md font-semibold bg-transparent border-none outline-none w-64"
                />
                <div className="flex items-center gap-md">
                  <button onClick={() => handleAiAction('continue')} className="btn-outline text-body-sm">AI 续写</button>
                  <button onClick={() => handleAiAction('polish')} className="btn-outline text-body-sm">AI 润色</button>
                  <button onClick={() => handleAiAction('generate')} className="btn-outline text-body-sm">AI 生成场景</button>
                  <button className="btn-secondary">保存</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-lg">
                <div className="grid grid-cols-3 gap-md mb-lg">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-sm">时代背景</label>
                    <input
                      type="text"
                      value={selectedScene?.background || ''}
                      onChange={(e) => setSelectedScene({ ...selectedScene!, background: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-sm">场景地点</label>
                    <input
                      type="text"
                      value={selectedScene?.location || ''}
                      onChange={(e) => setSelectedScene({ ...selectedScene!, location: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-sm">时间</label>
                    <select
                      value={selectedScene?.timeOfDay || ''}
                      onChange={(e) => setSelectedScene({ ...selectedScene!, timeOfDay: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="">选择时间</option>
                      <option value="清晨">清晨</option>
                      <option value="上午">上午</option>
                      <option value="中午">中午</option>
                      <option value="下午">下午</option>
                      <option value="黄昏">黄昏</option>
                      <option value="夜晚">夜晚</option>
                      <option value="深夜">深夜</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-label-md text-on-surface-variant mb-sm">出场人物</label>
                    <div className="flex flex-wrap gap-xs">
                      {characters.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => {
                            const chars = selectedScene?.characters || [];
                            const newChars = chars.includes(char.id)
                              ? chars.filter(id => id !== char.id)
                              : [...chars, char.id];
                            setSelectedScene({ ...selectedScene!, characters: newChars });
                          }}
                          className={`px-sm py-xs rounded-full text-body-sm ${
                            selectedScene?.characters.includes(char.id)
                              ? 'bg-primary text-on-primary'
                              : 'bg-secondary text-on-surface-variant hover:bg-hover'
                          }`}
                        >
                          {char.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-sm">氛围</label>
                    <input
                      type="text"
                      value={selectedScene?.mood || ''}
                      onChange={(e) => setSelectedScene({ ...selectedScene!, mood: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-sm">剧情内容</label>
                  <textarea
                    value={selectedScene?.content || ''}
                    onChange={(e) => setSelectedScene({ ...selectedScene!, content: e.target.value })}
                    className="input-field w-full h-80 resize-none font-mono text-body-sm leading-relaxed"
                    placeholder="编写场景剧情内容..."
                  />
                  <div className="flex justify-end mt-sm">
                    <span className="text-body-xs text-on-surface-variant">{getSceneWordCount(selectedScene || { content: '' })} 字</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="flex-1 flex gap-lg">
            <div className="w-72 card flex flex-col">
              <div className="flex items-center justify-between p-md border-b border-outline">
                <h3 className="text-body-md font-semibold text-on-surface">人物列表</h3>
                <button className="btn-purple">+ 添加人物</button>
              </div>
              <div className="flex-1 overflow-y-auto p-md">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className={`w-full text-left p-md rounded-lg mb-sm transition-colors ${
                      selectedCharacter?.id === char.id ? 'bg-primary text-on-primary' : 'bg-secondary hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        char.role === 'lead' ? 'bg-red-500' : char.role === 'supporting' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <p className="text-body-sm font-medium">{char.name}</p>
                    </div>
                    <p className="text-body-xs text-muted mt-xs">{char.personality}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 card flex flex-col">
              {selectedCharacter ? (
                <>
                  <div className="flex items-center justify-between p-md border-b border-outline">
                    <h3 className="text-headline-md font-semibold text-on-surface">{selectedCharacter.name}</h3>
                    <button className="btn-secondary">保存</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-lg">
                    <div className="grid grid-cols-2 gap-md mb-lg">
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-sm">角色类型</label>
                        <select
                          value={selectedCharacter.role}
                          onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, role: e.target.value as Character['role'] } : c))}
                          className="input-field w-full"
                        >
                          <option value="lead">主角</option>
                          <option value="supporting">配角</option>
                          <option value="extra">群众</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-sm">年龄</label>
                        <input
                          type="number"
                          value={selectedCharacter.age}
                          onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, age: Number(e.target.value) } : c))}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-sm">性格特点</label>
                        <input
                          type="text"
                          value={selectedCharacter.personality}
                          onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, personality: e.target.value } : c))}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-label-md text-on-surface-variant mb-sm">核心动机</label>
                        <input
                          type="text"
                          value={selectedCharacter.motivation}
                          onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, motivation: e.target.value } : c))}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    <div className="mb-lg">
                      <label className="block text-label-md text-on-surface-variant mb-sm">人物背景</label>
                      <textarea
                        value={selectedCharacter.background}
                        onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, background: e.target.value } : c))}
                        className="input-field w-full h-32 resize-none"
                        placeholder="描述人物的背景故事..."
                      />
                    </div>

                    <div className="mb-lg">
                      <label className="block text-label-md text-on-surface-variant mb-sm">人物描述</label>
                      <textarea
                        value={selectedCharacter.description}
                        onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, description: e.target.value } : c))}
                        className="input-field w-full h-32 resize-none"
                        placeholder="描述人物的外貌和性格..."
                      />
                    </div>

                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-sm">外貌特征</label>
                      <div className="grid grid-cols-3 gap-md">
                        <div>
                          <label className="block text-body-xs text-on-surface-variant mb-sm">发型</label>
                          <input
                            type="text"
                            value={selectedCharacter.appearance.hair}
                            onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, appearance: { ...c.appearance, hair: e.target.value } } : c))}
                            className="input-field w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-body-xs text-on-surface-variant mb-sm">眼睛</label>
                          <input
                            type="text"
                            value={selectedCharacter.appearance.eyes}
                            onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, appearance: { ...c.appearance, eyes: e.target.value } } : c))}
                            className="input-field w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-body-xs text-on-surface-variant mb-sm">风格</label>
                          <input
                            type="text"
                            value={selectedCharacter.appearance.style}
                            onChange={(e) => setCharacters(prev => prev.map(c => c.id === selectedCharacter!.id ? { ...c, appearance: { ...c.appearance, style: e.target.value } } : c))}
                            className="input-field w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-body-sm">选择一个人物查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-80">
        <AIPanel presetAgents={['screenwriter']} />
      </div>
    </div>
  );
}