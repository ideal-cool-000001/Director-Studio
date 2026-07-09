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
import { Studio } from './studio/Studio';

type ViewType = 'dashboard' | 'script' | 'storyboard' | 'canvas' | 'studio' | 'audio' | 'editor' | 'publish' | 'knowledge';

const NAV_ITEMS: { id: ViewType; label: string; icon: string }[] = [
  { id: 'dashboard', label: '主界面', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'script', label: '剧本编辑', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'storyboard', label: '剧情版', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'canvas', label: '无线画布', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'studio', label: '3D导演台', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'audio', label: '语音合成', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  { id: 'editor', label: '视频剪辑', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
  { id: 'publish', label: '发布', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'knowledge', label: '知识库', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
];

const PAGE_COMPONENTS: Record<ViewType, React.ComponentType> = {
  dashboard: Dashboard,
  script: ScriptEditor,
  storyboard: Storyboard,
  canvas: InfiniteCanvas,
  studio: Studio,
  audio: AudioSynthesizer,
  editor: VideoEditor,
  publish: Publish,
  knowledge: KnowledgeBase,
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const ActivePage = PAGE_COMPONENTS[activeView];

  return (
    <div className="h-screen w-screen flex bg-background">
      <aside className="w-16 bg-surface border-r border-outline flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-6">
          <span className="text-on-primary font-bold text-sm">D</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative group ${
                activeView === item.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-secondary'
              }`}
              title={item.label}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>

              <div className="absolute left-full ml-2 px-3 py-1.5 bg-primary text-on-primary text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-elevated">
                {item.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button onClick={() => setIsSettingsOpen(true)} className="w-12 h-12 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-secondary transition-colors" title="设置">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <ActivePage />
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}