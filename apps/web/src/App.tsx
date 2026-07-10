import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ScriptEditor from './pages/ScriptEditor';
import Storyboard from './pages/Storyboard';
import InfiniteCanvas from './pages/InfiniteCanvas';
import AudioSynthesizer from './pages/AudioSynthesizer';
import VideoEditor from './pages/VideoEditor';
import Publish from './pages/Publish';
import KnowledgeBase from './pages/KnowledgeBase';
import SettingsModal from './components/SettingsModal/SettingsModal';

type ViewType = 'dashboard' | 'script' | 'storyboard' | 'canvas' | 'audio' | 'editor' | 'publish' | 'knowledge';

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  badge?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: '创作工作流',
    items: [
      { id: 'dashboard', label: '主界面', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'script', label: '剧本编辑', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      { id: 'storyboard', label: '故事板', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'canvas', label: '画布', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { id: 'audio', label: '语音合成', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
      { id: 'editor', label: '视频剪辑', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
      { id: 'publish', label: '发布', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    ],
  },
  {
    title: '辅助功能',
    items: [
      { id: 'knowledge', label: '知识库', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    ],
  },
];

const PAGE_COMPONENTS: Record<ViewType, React.ComponentType> = {
  dashboard: Dashboard,
  script: ScriptEditor,
  storyboard: Storyboard,
  canvas: InfiniteCanvas,
  audio: AudioSynthesizer,
  editor: VideoEditor,
  publish: Publish,
  knowledge: KnowledgeBase,
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAnnouncementClosed, setIsAnnouncementClosed] = useState(false);

  const ActivePage = PAGE_COMPONENTS[activeView];

  return (
    <div className="h-screen w-screen flex flex-col bg-background relative">
      {/* Announcement bar — refined gradient with glassmorphism */}
      {!isAnnouncementClosed && (
        <div
          className="h-9 flex items-center justify-between px-lg text-white text-body-sm animate-slide-down relative z-10"
          style={{ background: 'linear-gradient(90deg, #5E50D6 0%, #7B61FF 50%, #007AFF 100%)' }}
        >
          <span className="flex items-center gap-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-medium">Director Studio 全新升级</span>
            <span className="text-white/70">— AI 驱动的全流程创作工作台</span>
          </span>
          <button
            onClick={() => setIsAnnouncementClosed(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-normal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar — glassmorphic with glow effects */}
        <aside
          className={`flex flex-col border-r border-outline transition-all duration-normal relative z-10 ${isSidebarExpanded ? 'w-60' : 'w-16'}`}
          style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)' }}
        >
          {/* Logo header */}
          <div className="flex items-center px-md py-lg border-b border-outline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-normal"
              style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)', boxShadow: '0 4px 12px -2px rgba(123, 97, 255, 0.35)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            {isSidebarExpanded && (
              <div className="ml-md animate-slide-left overflow-hidden">
                <span className="block text-title-md font-bold text-on-surface leading-tight tracking-tight">Director Studio</span>
                <span className="block text-body-xs text-on-surface-variant">AI 创作工作台</span>
              </div>
            )}
          </div>

          {/* Navigation — section grouped with active glow */}
          <nav className="flex-1 overflow-y-auto py-md px-sm">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-lg">
                {isSidebarExpanded && (
                  <div className="px-sm py-xs text-label-sm text-on-surface-muted font-semibold uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                <div className="space-y-xs">
                  {section.items.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`flex items-center gap-sm w-full px-sm py-[10px] rounded-lg transition-all duration-normal relative ${
                          isActive
                            ? 'text-white'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-muted'
                        }`}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #1D1D1F 0%, #2C2C2E 100%)',
                          boxShadow: '0 4px 12px -2px rgba(29, 29, 31, 0.3)',
                        } : {}}
                        title={item.label}
                      >
                        <svg
                          className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-normal ${isActive ? 'scale-110' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {isSidebarExpanded && (
                          <span className="text-body-sm font-medium">{item.label}</span>
                        )}
                        {/* Active indicator dot */}
                        {isActive && (
                          <span
                            className="absolute right-sm w-1.5 h-1.5 rounded-full"
                            style={{ background: '#7B61FF', boxShadow: '0 0 8px rgba(123, 97, 255, 0.6)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="border-t border-outline py-md px-sm space-y-xs">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="flex items-center gap-sm w-full px-sm py-[10px] rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-muted transition-all duration-normal"
              title={isSidebarExpanded ? '收起导航栏' : '展开导航栏'}
            >
              <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-normal ${isSidebarExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isSidebarExpanded && <span className="text-body-sm font-medium">收起导航栏</span>}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-sm w-full px-sm py-[10px] rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-muted transition-all duration-normal"
              title="设置"
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isSidebarExpanded && <span className="text-body-sm font-medium">设置</span>}
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden relative">
          <ActivePage />
        </main>
      </div>

      {/* Floating help button — glassmorphism + glow */}
      <button
        className="fixed right-lg bottom-lg w-12 h-12 rounded-full flex items-center justify-center transition-all duration-normal z-50 hover:scale-110"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(123, 97, 255, 0.15)',
        }}
        title="帮助"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B61FF' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
