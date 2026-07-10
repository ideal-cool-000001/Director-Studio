import { useState, useEffect } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';
import { projectService } from '@/services/api';

interface Project {
  project_id: string;
  name: string;
  budget: number;
  total_cost: number;
  status: 'planning' | 'writing' | 'storyboarding' | 'production' | 'editing' | 'published';
  createdAt: string;
}

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  isNew?: boolean;
  gradient: string;
}

interface FeaturedWork {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  views: number;
}

const PROJECT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  planning: { label: '规划中', bg: 'bg-info-bg', text: 'text-info' },
  writing: { label: '创作中', bg: 'bg-warning-bg', text: 'text-warning' },
  storyboarding: { label: '分镜中', bg: 'bg-purple-light', text: 'text-tertiary' },
  production: { label: '制作中', bg: 'bg-info-bg', text: 'text-accent' },
  editing: { label: '剪辑中', bg: 'bg-error-bg', text: 'text-error' },
  published: { label: '已发布', bg: 'bg-success-bg', text: 'text-success' },
};

const QUICK_TOOLS = [
  { id: 'short-video', label: '沉浸式短片', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
  { id: 'image', label: '生成图片', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'product', label: '产品推广', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'long-video', label: '智能长视频', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
];

const RECOMMENDED_TOOLS: ToolCard[] = [
  {
    id: 'sd-mini',
    title: 'SD 2.0 Mini',
    description: '首发试用 Seedance 模型，轻量级视频生成',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    isNew: true,
    gradient: 'from-tertiary-dark via-tertiary to-tertiary-light',
  },
  {
    id: 'novel-agent',
    title: '短剧 Agent 2.0',
    description: '剧本联动画布，解锁影视级风格',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    isNew: true,
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
  },
  {
    id: 'canvas',
    title: '自由画布',
    description: '无限画布，无限创意',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    gradient: 'from-green-600 via-emerald-500 to-teal-400',
  },
  {
    id: 'storyboard',
    title: '分镜脚本编写',
    description: '输入关键主题/参考图，一键扩写为分镜脚本',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    gradient: 'from-orange-500 via-amber-500 to-yellow-400',
  },
];

const FEATURED_WORKS: FeaturedWork[] = [
  { id: '1', title: '赛博朋克都市', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20city%20neon%20lights&image_size=landscape_16_9', author: 'AI创作家', views: 12580 },
  { id: '2', title: '古风仙侠', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20fantasy%20landscape&image_size=landscape_16_9', author: '影像大师', views: 8920 },
  { id: '3', title: '科幻冒险', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sci-fi%20space%20adventure&image_size=landscape_16_9', author: '未来视界', views: 15670 },
  { id: '4', title: '温馨治愈', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20cozy%20sunset%20landscape&image_size=landscape_16_9', author: '光影诗人', views: 6430 },
];

// Gradient accent strips for bento tool cards
const TOOL_ACCENTS: Record<string, { strip: string; iconBg: string; iconText: string }> = {
  'short-video': { strip: 'from-purple-500 to-indigo-500', iconBg: 'bg-purple-light', iconText: 'text-tertiary' },
  'image': { strip: 'from-blue-400 to-cyan-400', iconBg: 'bg-info-bg', iconText: 'text-info' },
  'product': { strip: 'from-emerald-400 to-teal-400', iconBg: 'bg-success-bg', iconText: 'text-success' },
  'long-video': { strip: 'from-amber-400 to-orange-400', iconBg: 'bg-warning-bg', iconText: 'text-warning' },
};

// Gradient backgrounds for featured work placeholders
const FEATURED_GRADIENTS: string[] = [
  'from-purple-600 via-pink-500 to-orange-400',
  'from-emerald-500 via-teal-500 to-cyan-400',
  'from-blue-600 via-indigo-500 to-purple-500',
  'from-amber-400 via-orange-500 to-rose-400',
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', budget: 5000 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectService.list();
      const projectData = response.data.items.map((item: any) => ({
        project_id: item.project_id,
        name: item.name,
        budget: item.budget || 0,
        total_cost: item.total_cost || 0,
        status: 'planning' as const,
        createdAt: item.created_at,
      }));
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    setIsLoading(true);
    try {
      await projectService.create({
        name: newProject.name.trim(),
        budget: newProject.budget,
      });
      await fetchProjects();
      setShowCreateModal(false);
      setNewProject({ name: '', budget: 5000 });
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex gap-lg p-lg overflow-y-auto bg-background">
      <div className="flex-1 flex flex-col gap-lg min-w-0">
        {/* ===== Hero Section — Stunning gradient with floating orbs ===== */}
        <div
          className="relative rounded-lg overflow-hidden animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #1D1D1F 0%, #2C2C2E 100%)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          {/* Decorative floating gradient orbs */}
          <div
            className="absolute -top-16 -right-8 w-72 h-72 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full blur-3xl opacity-25"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-8 right-40 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }}
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Hero content */}
          <div className="relative px-xl py-xl flex flex-col gap-lg">
            <div className="flex items-center gap-sm">
              <span className="badge badge-accent">Director Studio</span>
              <span className="text-body-xs text-white/50">v2.0</span>
            </div>
            <div>
              <h1 className="text-headline-xl font-bold text-white mb-sm leading-tight">
                <span className="gradient-text">AI</span> 驱动的创作工作台
              </h1>
              <p className="text-body-lg text-white/70 max-w-lg">
                从灵感到成片，一站式智能创作平台。和小云雀一起聊聊创作想法，释放无限创意。
              </p>
            </div>
            <div className="flex gap-md">
              <button className="btn-primary transition-all duration-normal hover:scale-105">
                立即开始创作
              </button>
              <button className="btn-secondary transition-all duration-normal hover:scale-105">
                浏览模板库
              </button>
            </div>
          </div>
        </div>

        {/* ===== Quick Tools — Bento Grid with varying card sizes ===== */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-headline-md font-semibold text-on-surface">快捷工具</h2>
            <span className="text-body-sm text-on-surface-muted">点击即可开始</span>
          </div>
          <div className="grid grid-cols-4 gap-md">
            {/* Featured wide card — short-video (spans 2 cols) */}
            <button
              className={`aurora-card col-span-2 p-lg rounded-lg text-left transition-all duration-normal hover:-translate-y-1 relative overflow-hidden group`}
              style={{ boxShadow: 'var(--shadow-2)' }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${TOOL_ACCENTS['short-video'].strip}`} />
              <div className="flex items-start gap-md">
                <div className={`w-14 h-14 rounded-full ${TOOL_ACCENTS['short-video'].iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-normal group-hover:scale-110`}>
                  <svg className={`w-7 h-7 ${TOOL_ACCENTS['short-video'].iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={QUICK_TOOLS[0].icon} />
                  </svg>
                </div>
                <div className="flex-1 pt-xs">
                  <h3 className="text-title-md font-semibold text-on-surface mb-xs">{QUICK_TOOLS[0].label}</h3>
                  <p className="text-body-sm text-on-surface-variant">沉浸式短片创作体验，AI 智能生成精彩视频内容</p>
                </div>
              </div>
            </button>

            {/* image (1 col) */}
            <button
              className="aurora-card col-span-1 p-lg rounded-lg text-left transition-all duration-normal hover:-translate-y-1 relative overflow-hidden group"
              style={{ boxShadow: 'var(--shadow-1)' }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${TOOL_ACCENTS['image'].strip}`} />
              <div className={`w-12 h-12 rounded-full ${TOOL_ACCENTS['image'].iconBg} flex items-center justify-center mb-md transition-transform duration-normal group-hover:scale-110`}>
                <svg className={`w-6 h-6 ${TOOL_ACCENTS['image'].iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={QUICK_TOOLS[1].icon} />
                </svg>
              </div>
              <h3 className="text-title-md font-semibold text-on-surface mb-xs">{QUICK_TOOLS[1].label}</h3>
              <p className="text-body-sm text-on-surface-variant">一键生成精美图片</p>
            </button>

            {/* product (1 col) */}
            <button
              className="aurora-card col-span-1 p-lg rounded-lg text-left transition-all duration-normal hover:-translate-y-1 relative overflow-hidden group"
              style={{ boxShadow: 'var(--shadow-1)' }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${TOOL_ACCENTS['product'].strip}`} />
              <div className={`w-12 h-12 rounded-full ${TOOL_ACCENTS['product'].iconBg} flex items-center justify-center mb-md transition-transform duration-normal group-hover:scale-110`}>
                <svg className={`w-6 h-6 ${TOOL_ACCENTS['product'].iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={QUICK_TOOLS[2].icon} />
                </svg>
              </div>
              <h3 className="text-title-md font-semibold text-on-surface mb-xs">{QUICK_TOOLS[2].label}</h3>
              <p className="text-body-sm text-on-surface-variant">产品推广视频制作</p>
            </button>

            {/* long-video — full width banner (spans 4 cols) */}
            <button
              className="aurora-card col-span-4 p-lg rounded-lg text-left transition-all duration-normal hover:-translate-y-1 relative overflow-hidden group"
              style={{ boxShadow: 'var(--shadow-2)' }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${TOOL_ACCENTS['long-video'].strip}`} />
              <div className="flex items-center gap-lg">
                <div className={`w-14 h-14 rounded-full ${TOOL_ACCENTS['long-video'].iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-normal group-hover:scale-110`}>
                  <svg className={`w-7 h-7 ${TOOL_ACCENTS['long-video'].iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={QUICK_TOOLS[3].icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-xs">
                    <h3 className="text-title-md font-semibold text-on-surface">{QUICK_TOOLS[3].label}</h3>
                    <span className="badge badge-success">热门</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">智能长视频生成，支持复杂叙事结构与多场景编排</p>
                </div>
                <svg className="w-6 h-6 text-on-surface-muted group-hover:text-tertiary group-hover:translate-x-1 transition-all duration-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* ===== Statistics — Premium gradient cards ===== */}
        <div className="grid grid-cols-4 gap-md animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div
            className="rounded-lg p-lg bg-gradient-to-br from-info-bg to-surface border border-outline transition-all duration-normal hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-1)' }}
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-md text-on-surface-muted">总项目数</span>
              <div className="w-10 h-10 bg-info-bg rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <p className="text-headline-xl font-bold text-on-surface">{projects.length}</p>
          </div>

          <div
            className="rounded-lg p-lg bg-gradient-to-br from-success-bg to-surface border border-outline transition-all duration-normal hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-1)' }}
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-md text-on-surface-muted">总预算</span>
              <div className="w-10 h-10 bg-success-bg rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-xl font-bold text-on-surface">¥{projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
          </div>

          <div
            className="rounded-lg p-lg bg-gradient-to-br from-warning-bg to-surface border border-outline transition-all duration-normal hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-1)' }}
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-md text-on-surface-muted">总花费</span>
              <div className="w-10 h-10 bg-warning-bg rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-xl font-bold text-on-surface">¥{projects.reduce((sum, p) => sum + p.total_cost, 0).toLocaleString()}</p>
          </div>

          <div
            className="rounded-lg p-lg bg-gradient-to-br from-purple-light to-surface border border-outline transition-all duration-normal hover:-translate-y-1"
            style={{ boxShadow: 'var(--shadow-1)' }}
          >
            <div className="flex items-center justify-between mb-md">
              <span className="text-label-md text-on-surface-muted">进行中</span>
              <div className="w-10 h-10 bg-purple-light rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-xl font-bold text-on-surface">{projects.length}</p>
          </div>
        </div>

        {/* ===== Recommended Tools — Bento Grid ===== */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-headline-md font-semibold text-on-surface">推荐工具</h2>
            <button className="text-body-sm text-tertiary hover:text-tertiary-dark transition-all duration-normal">
              查看全部 →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-md">
            {/* sd-mini — featured (2 cols) */}
            <div
              className="aurora-card col-span-2 p-0 rounded-lg overflow-hidden cursor-pointer group transition-all duration-normal hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-2)' }}
            >
              <div className={`h-28 bg-gradient-to-br ${RECOMMENDED_TOOLS[0].gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-14 h-14 text-white/90 group-hover:scale-110 transition-transform duration-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RECOMMENDED_TOOLS[0].icon} />
                  </svg>
                </div>
                {RECOMMENDED_TOOLS[0].isNew && (
                  <div className="absolute top-sm right-sm px-sm py-xs bg-success text-on-primary text-label-xs font-semibold rounded-full">New</div>
                )}
              </div>
              <div className="p-lg">
                <h3 className="text-title-md font-semibold text-on-surface mb-xs">{RECOMMENDED_TOOLS[0].title}</h3>
                <p className="text-body-sm text-on-surface-variant">{RECOMMENDED_TOOLS[0].description}</p>
              </div>
            </div>

            {/* novel-agent (1 col) */}
            <div
              className="aurora-card col-span-1 p-0 rounded-lg overflow-hidden cursor-pointer group transition-all duration-normal hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-1)' }}
            >
              <div className={`h-24 bg-gradient-to-br ${RECOMMENDED_TOOLS[1].gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform duration-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RECOMMENDED_TOOLS[1].icon} />
                  </svg>
                </div>
                {RECOMMENDED_TOOLS[1].isNew && (
                  <div className="absolute top-xs right-xs px-xs py-xs bg-success text-on-primary text-label-xs font-semibold rounded-full">New</div>
                )}
              </div>
              <div className="p-md">
                <h3 className="text-body-lg font-semibold text-on-surface mb-xs">{RECOMMENDED_TOOLS[1].title}</h3>
                <p className="text-body-xs text-on-surface-variant">{RECOMMENDED_TOOLS[1].description}</p>
              </div>
            </div>

            {/* canvas (1 col) */}
            <div
              className="aurora-card col-span-1 p-0 rounded-lg overflow-hidden cursor-pointer group transition-all duration-normal hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-1)' }}
            >
              <div className={`h-24 bg-gradient-to-br ${RECOMMENDED_TOOLS[2].gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform duration-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RECOMMENDED_TOOLS[2].icon} />
                  </svg>
                </div>
              </div>
              <div className="p-md">
                <h3 className="text-body-lg font-semibold text-on-surface mb-xs">{RECOMMENDED_TOOLS[2].title}</h3>
                <p className="text-body-xs text-on-surface-variant">{RECOMMENDED_TOOLS[2].description}</p>
              </div>
            </div>

            {/* storyboard — wide (4 cols, horizontal layout) */}
            <div
              className="aurora-card col-span-4 p-lg rounded-lg cursor-pointer group transition-all duration-normal hover:-translate-y-1 relative overflow-hidden"
              style={{ boxShadow: 'var(--shadow-2)' }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${RECOMMENDED_TOOLS[3].gradient}`} />
              <div className="flex items-center gap-lg">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${RECOMMENDED_TOOLS[3].gradient} flex items-center justify-center flex-shrink-0 transition-transform duration-normal group-hover:scale-110`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RECOMMENDED_TOOLS[3].icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-title-md font-semibold text-on-surface mb-xs">{RECOMMENDED_TOOLS[3].title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{RECOMMENDED_TOOLS[3].description}</p>
                </div>
                <svg className="w-6 h-6 text-on-surface-muted group-hover:text-tertiary group-hover:translate-x-1 transition-all duration-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Project List — Aurora card with hover lift ===== */}
        <div
          className="aurora-card p-0 rounded-lg flex flex-col animate-fade-in"
          style={{ animationDelay: '400ms', boxShadow: 'var(--shadow-2)' }}
        >
          <div className="flex items-center justify-between p-lg border-b border-outline">
            <div className="flex items-center gap-md">
              <h2 className="text-headline-md font-semibold text-on-surface">项目列表</h2>
              <span className="badge">{projects.length} 个项目</span>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary transition-all duration-normal hover:scale-105" disabled={isLoading}>
              + 新建项目
            </button>
          </div>

          <div className="p-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-xl text-on-surface-muted">
                <div className="w-16 h-16 mx-auto mb-md rounded-full bg-surface-muted flex items-center justify-center">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-body-md">暂无项目，点击上方按钮创建</p>
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                {projects.map((project, index) => (
                  <div
                    key={project.project_id}
                    className="flex items-center justify-between p-md bg-surface-muted border border-outline rounded-lg hover:bg-surface hover:border-tertiary hover:-translate-y-px transition-all duration-normal cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-md">
                      {/* Colored status dot */}
                      <div className={`w-2.5 h-2.5 rounded-full ${PROJECT_STATUS_MAP[project.status].bg} flex-shrink-0`} style={{ boxShadow: 'var(--shadow-1)' }} />
                      <div>
                        <p className="text-body-md font-medium text-on-surface group-hover:text-tertiary transition-colors">{project.name}</p>
                        <p className="text-body-sm text-on-surface-muted">{new Date(project.createdAt).toLocaleDateString('zh-CN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-md">
                      <span className="text-body-sm text-on-surface-variant">预算: ¥{project.budget.toLocaleString()}</span>
                      <span className="text-body-sm text-on-surface-variant">花费: ¥{project.total_cost.toLocaleString()}</span>
                      <span className={`px-sm py-xs rounded-full text-label-sm font-medium ${PROJECT_STATUS_MAP[project.status].bg} ${PROJECT_STATUS_MAP[project.status].text}`} title={PROJECT_STATUS_MAP[project.status].label}>
                        {PROJECT_STATUS_MAP[project.status].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== Featured Works — Horizontal scroll gallery ===== */}
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-headline-md font-semibold text-on-surface">精选作品</h2>
            <button className="text-body-sm text-tertiary hover:text-tertiary-dark transition-all duration-normal">
              查看全部 →
            </button>
          </div>
          <div className="flex gap-md overflow-x-auto pb-sm" style={{ scrollbarWidth: 'thin' }}>
            {FEATURED_WORKS.map((work, index) => (
              <div
                key={work.id}
                className="flex-shrink-0 w-64 rounded-lg overflow-hidden cursor-pointer group transition-all duration-normal hover:-translate-y-1"
                style={{ boxShadow: 'var(--shadow-2)' }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${FEATURED_GRADIENTS[index % FEATURED_GRADIENTS.length]} opacity-20 group-hover:opacity-10 transition-opacity duration-normal`} />
                </div>
                <div className="p-md bg-surface">
                  <p className="text-body-md font-medium text-on-surface mb-xs truncate">{work.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-body-xs text-on-surface-variant">{work.author}</span>
                    <span className="text-body-xs text-on-surface-muted">{(work.views / 1000).toFixed(1)}k 次浏览</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== AI Panel Sidebar ===== */}
      <div className="w-80 flex-shrink-0">
        <AIPanel variant="dashboard" presetAgents={['director', 'producer']} />
      </div>

      {/* ===== Create Project Modal ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated w-80 animate-scale-in" style={{ boxShadow: 'var(--shadow-5)' }}>
            <h3 className="text-title-lg font-semibold text-on-surface mb-lg">新建项目</h3>
            <div className="space-y-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">项目名称</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="输入项目名称"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">预算（元）</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex gap-md mt-lg">
              <button onClick={handleCreateProject} className="flex-1 btn-primary transition-all duration-normal hover:scale-105" disabled={isLoading || !newProject.name.trim()}>
                {isLoading ? '创建中...' : '创建'}
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary transition-all duration-normal hover:scale-105" disabled={isLoading}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
