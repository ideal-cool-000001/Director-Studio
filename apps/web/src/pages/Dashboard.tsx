import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface Project {
  id: string;
  name: string;
  budget: number;
  status: 'planning' | 'writing' | 'storyboarding' | 'production' | 'editing' | 'published';
  createdAt: Date;
}

const PROJECT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  planning: { label: '规划中', color: 'bg-blue-500' },
  writing: { label: '创作中', color: 'bg-yellow-500' },
  storyboarding: { label: '分镜中', color: 'bg-purple-500' },
  production: { label: '制作中', color: 'bg-orange-500' },
  editing: { label: '剪辑中', color: 'bg-pink-500' },
  published: { label: '已发布', color: 'bg-green-500' },
};

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: '科幻短剧《星际迷途》', budget: 5000, status: 'production', createdAt: new Date('2026-07-01') },
  { id: '2', name: '古风爱情故事', budget: 3000, status: 'writing', createdAt: new Date('2026-07-05') },
  { id: '3', name: '悬疑推理系列', budget: 8000, status: 'planning', createdAt: new Date('2026-07-08') },
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', budget: 5000 });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name.trim(),
      budget: newProject.budget,
      status: 'planning',
      createdAt: new Date(),
    };
    setProjects((prev) => [project, ...prev]);
    setShowCreateModal(false);
    setNewProject({ name: '', budget: 5000 });
  };

  return (
    <div className="h-full flex gap-lg p-lg">
      <div className="flex-1 flex flex-col gap-lg">
        <div className="grid grid-cols-4 gap-md">
          <div className="card">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface-variant">总项目数</span>
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <p className="text-headline-lg font-semibold text-on-surface">{projects.length}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface-variant">总预算</span>
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-lg font-semibold text-on-surface">¥{projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface-variant">进行中</span>
              <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-lg font-semibold text-on-surface">{projects.filter(p => p.status !== 'published').length}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface-variant">已发布</span>
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <p className="text-headline-lg font-semibold text-on-surface">{projects.filter(p => p.status === 'published').length}</p>
          </div>
        </div>

        <div className="flex-1 card flex flex-col">
          <div className="flex items-center justify-between p-lg border-b border-outline">
            <h2 className="text-body-lg font-semibold text-on-surface">项目列表</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + 新建项目
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-lg">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-md bg-secondary rounded-lg mb-sm hover:bg-hover transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-body-md font-medium text-on-surface">{project.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{project.createdAt.toLocaleDateString('zh-CN')}</p>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-body-sm text-on-surface-variant">¥{project.budget.toLocaleString()}</span>
                  <span className={`w-2 h-2 rounded-full ${PROJECT_STATUS_MAP[project.status].color}`} title={PROJECT_STATUS_MAP[project.status].label} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-80">
        <AIPanel presetAgents={['director', 'producer']} />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card-elevated w-80">
            <h3 className="text-body-lg font-semibold text-on-surface mb-lg">新建项目</h3>
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
              <button
                onClick={handleCreateProject}
                className="flex-1 btn-primary"
              >
                创建
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}