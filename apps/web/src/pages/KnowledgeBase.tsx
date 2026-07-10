import { useState, useCallback } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  updatedAt: Date;
  content: string;
  isPrompt?: boolean;
  promptTemplate?: string;
}

interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  items: { label: string; value: string }[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'camera',
    name: '镜头运镜',
    icon: '📷',
    items: [
      { label: '缓慢推镜', value: '缓慢推镜' },
      { label: '镜头后拉揭示空间', value: '镜头后拉揭示空间' },
      { label: '横向稳定跟拍', value: '横向稳定跟拍' },
      { label: '轨道平移', value: '轨道平移' },
      { label: '固定中景', value: '固定中景' },
      { label: '微距特写', value: '微距特写' },
      { label: '低角度仰拍', value: '低角度仰拍' },
      { label: '高角度俯拍', value: '高角度俯拍' },
      { label: '过肩镜头', value: '过肩镜头' },
      { label: '弧形绕摄', value: '弧形绕摄' },
    ],
  },
  {
    id: 'lighting',
    name: '灯光照明',
    icon: '💡',
    items: [
      { label: '柔和侧逆光', value: '柔和侧逆光' },
      { label: '暖色实用灯', value: '暖色实用灯' },
      { label: '冷色月光轮廓光', value: '冷色月光轮廓光' },
      { label: '体积光穿过薄雾', value: '体积光穿过薄雾' },
      { label: '潮湿地面反射霓虹', value: '潮湿地面反射霓虹' },
    ],
  },
  {
    id: 'motion',
    name: '动作表现',
    icon: '🎬',
    items: [
      { label: '脚步带动薄雾扩散', value: '脚步带动薄雾扩散' },
      { label: '缓慢转头并停住', value: '缓慢转头并停住' },
      { label: '衣料随动作自然摆动', value: '衣料随动作自然摆动' },
      { label: '保持上一段开放动作方向', value: '保持上一段开放动作方向' },
    ],
  },
  {
    id: 'vfx',
    name: '视觉特效',
    icon: '✨',
    items: [
      { label: '金色粒子升起后消散', value: '金色粒子升起后消散' },
      { label: '蓝色电弧沿边缘游走', value: '蓝色电弧沿边缘游走' },
      { label: '光线扫过材质表面', value: '光线扫过材质表面' },
    ],
  },
  {
    id: 'audio',
    name: '声音音效',
    icon: '🔊',
    items: [
      { label: '一句短而清晰的对白', value: '一句短而清晰的对白' },
      { label: '无配乐，仅低环境声', value: '无配乐，仅低环境声' },
      { label: '对白期间镜头固定', value: '对白期间镜头固定' },
      { label: '脚步声卡点', value: '脚步声卡点' },
    ],
  },
];

const PROMPT_TEMPLATES = [
  {
    id: '1',
    name: '紧凑模板',
    description: '适用于快速生成，简洁明了',
    template: '@Image1为参考，严格保持[主体/产品/脸部/标志]不变；仅加入[动作/光线/镜头变化]。镜头：[一个动作]。声音：[音效或环境声]。',
  },
  {
    id: '2',
    name: '时间轴模板',
    description: '适用于长视频，精确控制每个时间段',
    template: `【风格】[媒介、质感、色调，一句话]
【时间轴】0-3s：[画面+镜头+音效]；3-6s：[画面+镜头+音效]；6-10s：[画面+镜头+音效]
【声音】[对白/环境声/音效/无配乐]
【参考】@Image1 锁定主体身份；@Video1 仅参考运镜；@Audio1 仅参考节奏`,
  },
  {
    id: '3',
    name: '序列续拍模板',
    description: '适用于多段视频连续生成，保持一致性',
    template: `【风格】与上一段保持一致
【接续】以上一段尾帧为起点，从上一段真实结尾继续
【约束】不要重演上一段动作，已完成动作不得重复
【镜头】[运镜描述]
【声音】[音效或对白]`,
  },
];

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: '1', title: '科幻风格提示词指南', category: '风格', tags: ['科幻', '提示词', '教程'], updatedAt: new Date('2026-07-10'), content: '介绍如何编写高质量的科幻风格AI提示词，包括画面构图、色彩搭配、光影效果等要素。关键要素：宽幅远景、缓慢推镜、低角度暖阳、低饱和青橙调。' },
  { id: '2', title: '古风人物设计规范', category: '人物', tags: ['古风', '人物', '设计'], updatedAt: new Date('2026-07-09'), content: '详细说明古风人物的服饰、发型、妆容设计要点，以及如何通过提示词准确传达。服饰要素：飘逸长袍、精致发饰、淡雅妆容。' },
  { id: '3', title: '视频生成参数调优', category: '技术', tags: ['视频', '参数', '优化'], updatedAt: new Date('2026-07-08'), content: '深入分析视频生成模型的各项参数对输出效果的影响，提供最佳实践建议。' },
  { id: '4', title: '悬疑剧情创作技巧', category: '剧本', tags: ['悬疑', '剧情', '创作'], updatedAt: new Date('2026-07-07'), content: '分享悬疑剧情的构建方法，包括伏笔设置、节奏控制、反转设计等技巧。' },
];

const SLOP_TRAPS = [
  { original: '电影感', rewrite: '宽幅远景，缓慢推镜，低角度暖阳，低饱和青橙调' },
  { original: '氛围感', rewrite: '薄雾、逆光轮廓、湿润地面反光、低环境声' },
  { original: '高级感', rewrite: '柔和侧光、受控反光、干净背景、金属拉丝纹理' },
  { original: '大片感', rewrite: '写出物理规模：人群数量、镜头距离、建筑高度' },
  { original: '质感（单独使用）', rewrite: '指明哪种质感：磨砂玻璃、丝绒吸光、纸张纤维' },
];

const CATEGORIES = ['全部', '风格', '人物', '技术', '剧本', '其他'];

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'prompts' | 'templates'>('library');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const filteredKnowledge = knowledge.filter((item) => {
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  const handleAddToPrompt = useCallback((text: string) => {
    setCustomPrompt(prev => prev ? `${prev}，${text}` : text);
  }, []);

  return (
    <div className="h-full overflow-y-auto flex gap-lg p-lg animate-fade-in">
      <div className="flex-1 flex flex-col gap-lg min-w-0">
        {/* Main tab switcher */}
        <div className="flex gap-sm p-xs bg-surface-muted rounded-full w-fit">
          <button
            onClick={() => setActiveTab('library')}
            className={`${activeTab === 'library' ? 'tab-active' : 'tab-inactive'} transition-all duration-normal`}
          >
            知识库
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`${activeTab === 'prompts' ? 'tab-active' : 'tab-inactive'} transition-all duration-normal`}
          >
            提示词词典
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`${activeTab === 'templates' ? 'tab-active' : 'tab-inactive'} transition-all duration-normal`}
          >
            提示词模板
          </button>
        </div>

        {activeTab === 'library' && (
          <>
            {/* Filter bar + search */}
            <div className="flex items-center justify-between gap-md animate-slide-up">
              <div className="flex gap-xs flex-wrap">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`${selectedCategory === category ? 'tab-active' : 'tab-inactive'} transition-all duration-normal`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-md">
                <div className="relative">
                  <svg
                    className="absolute left-md top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-64 pl-[40px]"
                    placeholder="搜索知识..."
                  />
                </div>
                <button className="btn-secondary">搜索</button>
                <button className="btn-primary">+ 添加知识</button>
              </div>
            </div>

            {/* Knowledge card grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredKnowledge.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-muted animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-md">
                    <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-body-md font-medium text-on-surface-variant">未找到匹配的知识</p>
                  <p className="text-body-sm text-on-surface-muted mt-xs">尝试更换关键词或分类</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-lg">
                  {filteredKnowledge.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`aurora-card cursor-pointer animate-slide-up ${selectedItem?.id === item.id ? 'border-tertiary' : ''}`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        boxShadow: selectedItem?.id === item.id
                          ? '0 0 0 2px var(--color-tertiary), var(--shadow-glow)'
                          : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-sm mb-sm">
                        <h4 className="text-title-md font-semibold text-on-surface leading-snug">{item.title}</h4>
                        <span className="badge flex-shrink-0">{item.category}</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-md leading-relaxed">{item.content}</p>
                      <div className="flex items-center justify-between gap-sm">
                        <div className="flex gap-xs flex-wrap">
                          {item.tags.map((tag) => (
                            <span key={tag} className="badge-accent">{tag}</span>
                          ))}
                        </div>
                        <span className="text-body-xs text-on-surface-muted flex-shrink-0">
                          {item.updatedAt.toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'prompts' && (
          <div className="flex-1 overflow-y-auto min-h-0 animate-fade-in">
            <div className="grid grid-cols-2 gap-lg">
              {PROMPT_CATEGORIES.map((category, catIndex) => (
                <div
                  key={category.id}
                  className="card animate-slide-up"
                  style={{ animationDelay: `${catIndex * 50}ms` }}
                >
                  <div className="flex items-center gap-sm mb-md">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)' }}>
                      {category.icon}
                    </div>
                    <h4 className="text-title-md font-semibold text-on-surface">{category.name}</h4>
                  </div>
                  <div className="space-y-xs">
                    {category.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-sm p-sm bg-surface-muted rounded-lg hover:bg-hover transition-all duration-normal"
                      >
                        <span className="text-body-sm text-on-surface">{item.label}</span>
                        <div className="flex gap-xs flex-shrink-0">
                          <button
                            onClick={() => handleAddToPrompt(item.value)}
                            className="text-body-sm font-medium text-tertiary hover:bg-purple-light rounded-full px-sm py-xs transition-all duration-normal"
                          >
                            添加
                          </button>
                          <button
                            onClick={() => handleCopy(item.value, `prompt-${category.id}-${item.label}`)}
                            className="text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-muted rounded-full px-sm py-xs transition-all duration-normal"
                          >
                            {copiedId === `prompt-${category.id}-${item.label}` ? '✓' : '复制'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto min-h-0 animate-fade-in">
            <div className="grid grid-cols-2 gap-lg">
              {PROMPT_TEMPLATES.map((template, tplIndex) => (
                <div
                  key={template.id}
                  className="card animate-slide-up"
                  style={{ animationDelay: `${tplIndex * 50}ms` }}
                >
                  <div className="flex items-center justify-between gap-sm mb-md">
                    <h4 className="text-title-md font-semibold text-on-surface">{template.name}</h4>
                    <button
                      onClick={() => handleCopy(template.template, `template-${template.id}`)}
                      className={`btn-ghost text-body-sm transition-all duration-normal ${copiedId === `template-${template.id}` ? 'bg-success-bg text-success' : ''}`}
                    >
                      {copiedId === `template-${template.id}` ? '已复制' : '复制'}
                    </button>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-sm">{template.description}</p>
                  <pre className="p-md bg-surface-muted rounded-lg text-body-sm text-on-surface font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                    {template.template}
                  </pre>
                </div>
              ))}

              <div className="card animate-slide-up" style={{ animationDelay: `${PROMPT_TEMPLATES.length * 50}ms` }}>
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-9 h-9 rounded-full bg-error-bg flex items-center justify-center">
                    <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-title-md font-semibold text-on-surface">套话改写指南</h4>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-md leading-relaxed">
                  将抽象的「感觉词」拆解成制造这种感觉的物理元素——材质、光线、色彩、空气——画面立即变稳。
                </p>
                <div className="space-y-xs">
                  {SLOP_TRAPS.map((trap, index) => (
                    <div key={index} className="p-sm bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover">
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="text-body-sm text-error font-medium px-sm py-xs bg-error-bg rounded-full">{trap.original}</span>
                        <span className="text-on-surface-muted">→</span>
                      </div>
                      <span className="text-body-sm text-on-surface leading-relaxed">{trap.rewrite}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-md">
        {activeTab === 'prompts' && (
          <div className="aurora-card flex-1 flex flex-col animate-fade-in" style={{ boxShadow: 'var(--shadow-2)' }}>
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-title-md font-semibold tracking-tight text-on-surface">自定义提示词</h3>
              <button
                onClick={() => handleCopy(customPrompt, 'custom-prompt')}
                className={`btn-ghost text-body-sm transition-all duration-normal ${copiedId === 'custom-prompt' ? 'bg-success-bg text-success' : ''}`}
              >
                {copiedId === 'custom-prompt' ? '已复制' : '复制'}
              </button>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="input-field flex-1 w-full min-h-[16rem] resize-none font-mono text-body-sm"
              placeholder="点击左侧提示词添加到这里..."
            />
            <button
              onClick={() => setCustomPrompt('')}
              className="btn-outline text-body-sm mt-md w-full transition-all duration-normal"
            >
              清空
            </button>
          </div>
        )}

        {activeTab === 'library' && selectedItem && (
          <div className="aurora-card animate-scale-in" style={{ boxShadow: 'var(--shadow-3)' }}>
            <h3 className="text-title-lg font-semibold tracking-tight text-on-surface mb-md">知识详情</h3>
            <div className="space-y-md">
              <h4 className="text-headline-md font-semibold tracking-tight text-on-surface leading-tight">{selectedItem.title}</h4>
              <div className="flex items-center gap-md">
                <span className="badge">{selectedItem.category}</span>
                <span className="text-body-xs text-on-surface-muted">
                  更新于 {selectedItem.updatedAt.toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex flex-wrap gap-xs">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="badge-accent">{tag}</span>
                ))}
              </div>
              <div className="p-md bg-surface-muted rounded-lg">
                <p className="text-body-sm text-on-surface leading-relaxed">{selectedItem.content}</p>
              </div>
              <button
                onClick={() => handleCopy(selectedItem.content, `knowledge-${selectedItem.id}`)}
                className={`btn-secondary w-full transition-all duration-normal ${copiedId === `knowledge-${selectedItem.id}` ? 'bg-success-bg text-success border-transparent' : ''}`}
              >
                {copiedId === `knowledge-${selectedItem.id}` ? '已复制' : '复制内容'}
              </button>
              <div className="flex gap-md">
                <button className="flex-1 btn-outline transition-all duration-normal">编辑</button>
                <button className="flex-1 btn-outline text-error transition-all duration-normal">删除</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && !selectedItem && (
          <div className="card flex-1 flex flex-col items-center justify-center text-center animate-fade-in" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-md">
              <svg className="w-8 h-8 text-on-surface-muted opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-body-md font-medium text-on-surface-variant">选择一条知识查看详情</p>
            <p className="text-body-sm text-on-surface-muted mt-xs">点击左侧卡片即可预览完整内容</p>
          </div>
        )}
      </div>

      <div className="fixed right-lg bottom-12 z-50 animate-slide-up">
        <AIPanel variant="knowledge" collapsible defaultCollapsed />
      </div>
    </div>
  );
}
