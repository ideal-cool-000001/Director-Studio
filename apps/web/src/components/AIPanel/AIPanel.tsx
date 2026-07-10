import { useState, useRef, useEffect } from 'react';
import { chatService } from '@/services/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

type AIVariant = 'dashboard' | 'script' | 'storyboard' | 'canvas' | 'audio' | 'editor' | 'publish' | 'knowledge';

interface VariantConfig {
  title: string;
  subtitle: string;
  agents: string[];
  prompts: { label: string; icon: string }[];
  accent: string;
  accentLight: string;
  accentBg: string;
}

const AGENT_ICONS: Record<string, string> = {
  director: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  producer: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  screenwriter: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  character: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  art: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  voice: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  editor: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
  distributor: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
};

const AGENT_LABELS: Record<string, string> = {
  director: '导演',
  producer: '制片人',
  screenwriter: '编剧',
  character: '形象设计',
  art: '美术设计',
  voice: '配音',
  editor: '剪辑师',
  distributor: '宣发',
};

const VARIANT_CONFIGS: Record<AIVariant, VariantConfig> = {
  dashboard: {
    title: '创作助手',
    subtitle: '项目管理与创作规划',
    agents: ['director', 'producer'],
    prompts: [
      { label: '帮我规划一个短视频项目', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: '推荐热门创作主题', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { label: '生成项目时间计划', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
    accent: '#7B61FF',
    accentLight: '#F4F2FF',
    accentBg: '#EDE9FF',
  },
  script: {
    title: '剧本助手',
    subtitle: '剧本创作与角色设计',
    agents: ['screenwriter'],
    prompts: [
      { label: '帮我生成一个科幻短剧剧本', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      { label: '设计一个古风女主角形象', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label: '生成悬疑剧情大纲', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: '续写当前场景对话', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ],
    accent: '#007AFF',
    accentLight: '#E8F2FF',
    accentBg: '#D6EBFF',
  },
  storyboard: {
    title: '分镜助手',
    subtitle: '分镜设计与画面生成',
    agents: ['screenwriter', 'art'],
    prompts: [
      { label: '根据剧本生成分镜', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: '设计场景构图方案', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M9 4v16' },
      { label: '优化分镜画面描述', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    ],
    accent: '#34C759',
    accentLight: '#E9F9EE',
    accentBg: '#D4F5DD',
  },
  canvas: {
    title: '画布助手',
    subtitle: '素材编排与场景构建',
    agents: ['art', 'director'],
    prompts: [
      { label: '创建一个赛博朋克场景', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: '帮我编排素材顺序', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { label: '生成场景过渡方案', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
    ],
    accent: '#FF9500',
    accentLight: '#FFF4E6',
    accentBg: '#FFE8CC',
  },
  audio: {
    title: '语音助手',
    subtitle: '语音合成与音频处理',
    agents: ['voice'],
    prompts: [
      { label: '推荐适合的配音风格', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
      { label: '生成旁白文案', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      { label: '调整语音情感参数', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ],
    accent: '#FF3B30',
    accentLight: '#FFECEA',
    accentBg: '#FFD6D3',
  },
  editor: {
    title: '剪辑助手',
    subtitle: '视频剪辑与特效处理',
    agents: ['editor', 'director'],
    prompts: [
      { label: '推荐剪辑节奏方案', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
      { label: '生成转场效果建议', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
      { label: '优化色彩调色参数', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    ],
    accent: '#5856D6',
    accentLight: '#EDEBFF',
    accentBg: '#DDD9FF',
  },
  publish: {
    title: '发布助手',
    subtitle: '内容发布与平台适配',
    agents: ['distributor'],
    prompts: [
      { label: '生成吸引人的标题', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { label: '编写视频描述文案', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      { label: '推荐发布时间', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: '生成话题标签', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
    ],
    accent: '#AF52DE',
    accentLight: '#F5E8FF',
    accentBg: '#EBD6FF',
  },
  knowledge: {
    title: '知识助手',
    subtitle: '知识检索与学习辅助',
    agents: ['director'],
    prompts: [
      { label: '搜索创作技巧', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { label: '推荐学习资源', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { label: '查找案例分析', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
    accent: '#5AC8FA',
    accentLight: '#E6F7FE',
    accentBg: '#D0EEFC',
  },
};

interface AIPanelProps {
  presetAgents?: string[];
  variant?: AIVariant;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export default function AIPanel({ presetAgents, variant = 'dashboard', collapsible = false, defaultCollapsed = false }: AIPanelProps) {
  const config = VARIANT_CONFIGS[variant];
  const initialAgents = presetAgents || config.agents;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `你好！我是你的${config.title}。${config.subtitle}，请问有什么可以帮你的吗？`,
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initialAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim() || '(上传参考素材)',
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const sentValue = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Auto-expand if collapsed and user sends a message
    if (isCollapsed) setIsCollapsed(false);

    try {
      const response = await chatService.stream({
        message: sentValue,
        agents: selectedAgents,
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream');
      }

      const decoder = new TextDecoder();
      let content = '';
      const assistantMessageId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: content.trim() }
                    : m
                )
              );
              setIsLoading(false);
              return;
            }
            content += data;
            setMessages((prev) => {
              const existing = prev.find((m) => m.id === assistantMessageId);
              if (existing) {
                return prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: assistantMessageId,
                  content,
                  role: 'assistant' as const,
                  timestamp: new Date(),
                },
              ];
            });
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: content.trim() }
            : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '连接服务失败，请稍后重试。',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setUploadedFiles([]);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fileInputId = `file-upload-${variant}`;

  // === Collapsed compact bar ===
  if (collapsible && isCollapsed) {
    return (
      <div
        className="rounded-full flex items-center gap-sm p-xs pl-md transition-all duration-normal animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          boxShadow: 'var(--shadow-3)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* AI icon */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accent}DD 100%)`, boxShadow: `0 2px 8px -1px ${config.accent}40` }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Compact input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent border-none outline-none text-body-sm text-on-surface min-w-0"
          style={{ boxShadow: 'none' }}
          placeholder={`向${config.title}提问...`}
          disabled={isLoading}
        />
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-normal disabled:opacity-40"
          style={{ background: config.accent }}
        >
          {isLoading ? (
            <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
        {/* Expand button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-on-surface-variant hover:bg-surface-muted transition-all duration-normal"
          title="展开对话面板"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    );
  }

  // === Expanded full panel ===
  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden bg-surface" style={{ boxShadow: 'var(--shadow-1)' }}>
      {/* Header with variant accent */}
      <div className="p-md border-b border-outline" style={{ background: `linear-gradient(135deg, ${config.accentLight} 0%, transparent 100%)` }}>
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accent}DD 100%)`, boxShadow: `0 2px 8px -1px ${config.accent}40` }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-title-md font-semibold text-on-surface leading-tight">{config.title}</h3>
              <p className="text-body-xs text-on-surface-variant">{config.subtitle}</p>
            </div>
          </div>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-muted transition-all duration-normal"
              title="收起为紧凑模式"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Agent selection — compact pills with accent color */}
        <div className="mb-sm">
          <label className="block text-label-sm text-on-surface-muted mb-xs">选择 Agent</label>
          <div className="flex flex-wrap gap-xs">
            {Object.entries(AGENT_LABELS).map(([agentId, label]) => (
              <button
                key={agentId}
                onClick={() => toggleAgent(agentId)}
                className="flex items-center gap-xs px-sm py-xs rounded-full text-body-xs font-medium transition-all duration-normal"
                style={
                  selectedAgents.includes(agentId)
                    ? { background: config.accent, color: '#FFFFFF', boxShadow: `0 2px 4px -1px ${config.accent}40` }
                    : undefined
                }
                {...(!selectedAgents.includes(agentId) && { className: 'flex items-center gap-xs px-sm py-xs rounded-full text-body-xs font-medium transition-all duration-normal bg-surface-muted text-on-surface-variant hover:text-on-surface hover:bg-hover' })}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={AGENT_ICONS[agentId]} />
                </svg>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contextual preset prompts */}
        <div>
          <label className="block text-label-sm text-on-surface-muted mb-xs">快速提示词</label>
          <div className="flex flex-wrap gap-xs">
            {config.prompts.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => setInputValue(prompt.label)}
                className="flex items-center gap-xs px-sm py-xs rounded-full text-body-xs font-medium transition-all duration-normal hover:scale-105"
                style={{ background: config.accentLight, color: config.accent }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={prompt.icon} />
                </svg>
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-md space-y-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-sm animate-fade-in ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-normal"
              style={
                message.role === 'user'
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: 'var(--shadow-1)' }
                  : { background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accent}DD 100%)`, color: '#FFFFFF', boxShadow: `0 2px 4px -1px ${config.accent}30` }
              }
            >
              {message.role === 'user' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <p
                className="text-body-sm leading-relaxed px-sm py-xs rounded-xl"
                style={
                  message.role === 'user'
                    ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: '12px 12px 2px 12px', boxShadow: 'var(--shadow-1)' }
                    : { background: config.accentLight, color: 'var(--color-on-surface)', borderRadius: '12px 12px 12px 2px' }
                }
              >
                {message.content}
              </p>
              <p className="text-body-xs text-on-surface-muted mt-xs px-xs">
                {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-sm animate-fade-in">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accent}DD 100%)`, color: '#FFFFFF', boxShadow: `0 2px 4px -1px ${config.accent}30` }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="rounded-xl px-sm py-sm" style={{ background: config.accentLight, borderRadius: '12px 12px 12px 2px' }}>
              <div className="flex gap-xs items-center h-[16px]">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: config.accent, animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: config.accent, animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: config.accent, animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-md border-t border-outline">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-xs mb-sm">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-xs px-sm py-xs rounded-lg" style={{ background: config.accentLight }}>
                <svg className="w-3.5 h-3.5" style={{ color: config.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-body-xs text-on-surface">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-on-surface-muted hover:text-error transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-xs items-center">
          <button className="w-9 h-9 rounded-lg bg-surface-muted hover:bg-hover flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all duration-normal flex-shrink-0">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id={fileInputId}
            />
            <label htmlFor={fileInputId} className="cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </label>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 input-field text-body-sm"
            placeholder={`向${config.title}提问...`}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
            className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-all duration-normal"
            style={{ background: config.accent, boxShadow: `0 2px 4px -1px ${config.accent}40` }}
          >
            {isLoading ? (
              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
