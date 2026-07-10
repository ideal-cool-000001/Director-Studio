import { useState, useEffect } from 'react';
import { settingsService } from '@/services/api';

export interface AIServiceConfig {
  id: string;
  service_type: string;
  provider: string;
  base_url: string;
  model_name: string | null;
  api_key_set: boolean;
  enabled: boolean;
  extra_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const SERVICE_TYPES = [
  { key: 'llm', label: 'LLM 服务', providers: ['openai', 'deepseek', 'qwen', 'volcengine'] },
  { key: 'image', label: '图像生成', providers: ['flux2', 'dalle3', 'stable_diffusion', 'midjourney'] },
  { key: 'video', label: '视频生成', providers: ['kling3', 'seedance', 'runway', 'pika'] },
  { key: 'audio', label: '语音合成', providers: ['volcengine', 'aliyun', 'baidu', 'openai'] },
  { key: 'bgm', label: '背景音乐', providers: ['stable_audio'] },
  { key: 'publish', label: '发布平台', providers: ['douyin', 'kuaishou', 'bilibili', 'xiaohongshu', 'youtube', 'tiktok'] },
];

const DEFAULT_URLS: Record<string, string> = {
  openai: 'https://api.openai.com',
  deepseek: 'https://api.deepseek.com',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  volcengine: 'https://spark-api.xf-yun.com/v3',
  flux2: 'https://api.runwayml.com',
  dalle3: 'https://api.openai.com',
  stable_diffusion: 'https://api.stability.ai',
  midjourney: 'https://api.midjourney.com',
  kling3: 'https://api.klingai.com',
  seedance: 'https://api.seedance.ai',
  runway: 'https://api.runwayml.com',
  pika: 'https://api.pika.art',
  aliyun: 'https://nlsapi.cn-shanghai.aliyuncs.com',
  baidu: 'https://vop.baidu.com',
  stable_audio: 'https://api.stability.ai',
  douyin: 'https://open.douyin.com',
  kuaishou: 'https://open.kuaishou.com',
  bilibili: 'https://api.bilibili.com',
  xiaohongshu: 'https://api.xiaohongshu.com',
  youtube: 'https://www.googleapis.com',
  tiktok: 'https://open-api.tiktok.com',
};

const MODEL_NAMES: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-r1'],
  qwen: ['qwen2-7b-chat', 'qwen2-72b-chat', 'qwen2.5-7b-chat', 'qwen2.5-32b-chat'],
  volcengine: ['Spark-3.5', 'Spark-3.0'],
  flux2: ['flux2', 'flux2-dev'],
  dalle3: ['dall-e-3', 'dall-e-2'],
  stable_diffusion: ['sd3', 'sd2.1', 'sd1.5'],
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  qwen: '通义千问',
  volcengine: '火山引擎',
  flux2: 'Flux.1',
  dalle3: 'DALL-E 3',
  stable_diffusion: 'Stable Diffusion',
  midjourney: 'MidJourney',
  kling3: '可灵',
  seedance: '即梦',
  runway: 'Runway',
  pika: 'Pika',
  aliyun: '阿里云',
  baidu: '百度',
  stable_audio: 'Stable Audio',
  douyin: '抖音',
  kuaishou: '快手',
  bilibili: 'B站',
  xiaohongshu: '小红书',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('llm');
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIServiceConfig | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    if (isOpen) {
      loadConfigs();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    setApiKeyInput('');
  }, [editingConfig]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await settingsService.listAIServices(activeTab);
      setConfigs(res.data);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      const data = {
        provider: editingConfig.provider,
        base_url: editingConfig.base_url,
        model_name: editingConfig.model_name || undefined,
        api_key: apiKeyInput || undefined,
        enabled: editingConfig.enabled,
      };

      if (editingConfig.id) {
        await settingsService.updateAIService(editingConfig.id, data);
      } else {
        await settingsService.createAIService({ ...data, service_type: activeTab });
      }

      setEditingConfig(null);
      setApiKeyInput('');
      loadConfigs();
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('保存失败');
    }
  };

  const handleToggle = async (configId: string, enabled: boolean) => {
    try {
      await settingsService.toggleAIService(configId, enabled);
      loadConfigs();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  const handleTestConnection = async (serviceType: string, provider: string) => {
    setTestResults((prev) => ({ ...prev, [`${serviceType}-${provider}`]: { success: false, message: '测试中...' } }));
    try {
      const res = await settingsService.testConnection(serviceType, provider);
      setTestResults((prev) => ({
        ...prev,
        [`${serviceType}-${provider}`]: { success: res.data.success, message: res.data.message },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [`${serviceType}-${provider}`]: { success: false, message: '连接异常' },
      }));
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    try {
      await settingsService.deleteAIService(configId);
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAddConfig = (provider: string) => {
    setEditingConfig({
      id: '',
      service_type: activeTab,
      provider,
      base_url: DEFAULT_URLS[provider] || '',
      model_name: MODEL_NAMES[provider]?.[0] || '',
      api_key_set: false,
      enabled: false,
      extra_config: {},
      created_at: '',
      updated_at: '',
    });
    setApiKeyInput('');
  };

  if (!isOpen) return null;

  const currentServiceType = SERVICE_TYPES.find((t) => t.key === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] bg-surface rounded-2xl border border-outline shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-outline">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-accent rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h2 className="text-headline-md font-semibold text-on-surface">AI 服务配置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg text-on-surface-variant hover:text-on-surface transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-outline bg-secondary/50">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => {
                setActiveTab(type.key);
                setEditingConfig(null);
              }}
              className={`px-5 py-3 text-sm font-medium transition-all relative ${
                activeTab === type.key
                  ? 'text-on-surface bg-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {type.label}
              {activeTab === type.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <div className="w-8 h-8 border-2 border-purple-accent border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-body-sm">加载配置中...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {editingConfig && (
                <div className="bg-surface rounded-xl border border-outline p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-body-lg font-semibold text-on-surface">
                      {editingConfig.id ? '编辑配置' : '新建配置'}
                    </h3>
                    <span className="px-3 py-1 bg-purple-light text-purple-accent text-label-sm font-medium rounded-full">
                      {PROVIDER_LABELS[editingConfig.provider] || editingConfig.provider}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-label-md font-medium text-on-surface-variant">API 地址</label>
                      <input
                        type="text"
                        defaultValue={editingConfig.base_url}
                        className="w-full px-4 py-2.5 bg-secondary border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-purple-accent focus:ring-2 focus:ring-purple-accent/10 transition-all"
                        onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, base_url: e.target.value } : null)}
                        placeholder="输入 API 地址"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-label-md font-medium text-on-surface-variant">模型名称</label>
                      {MODEL_NAMES[editingConfig.provider] ? (
                        <select
                          className="w-full px-4 py-2.5 bg-secondary border border-outline rounded-lg text-body-md text-on-surface focus:border-purple-accent focus:ring-2 focus:ring-purple-accent/10 transition-all"
                          defaultValue={editingConfig.model_name || ''}
                          onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, model_name: e.target.value } : null)}
                        >
                          <option value="">选择模型</option>
                          {MODEL_NAMES[editingConfig.provider].map((model) => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          defaultValue={editingConfig.model_name || ''}
                          className="w-full px-4 py-2.5 bg-secondary border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-purple-accent focus:ring-2 focus:ring-purple-accent/10 transition-all"
                          onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, model_name: e.target.value } : null)}
                          placeholder="模型名称"
                        />
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="block text-label-md font-medium text-on-surface-variant">API 密钥</label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        className="w-full px-4 py-2.5 bg-secondary border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-purple-accent focus:ring-2 focus:ring-purple-accent/10 transition-all"
                        placeholder={editingConfig.api_key_set ? '密钥已设置（输入新值将覆盖）' : '输入 API 密钥'}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                      />
                      <p className="text-body-sm text-on-surface-variant/70">API 密钥将被加密存储，仅用于服务调用</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={editingConfig.enabled}
                            onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, enabled: e.target.checked } : null)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-secondary border border-outline rounded-full peer-checked:bg-purple-accent peer-checked:border-purple-accent transition-all" />
                          <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:left-7 transition-all" />
                        </div>
                        <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">启用此服务</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-5">
                    <button
                      onClick={() => {
                        setEditingConfig(null);
                        setApiKeyInput('');
                      }}
                      className="px-5 py-2.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-secondary rounded-lg transition-all"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 text-body-sm font-medium text-white bg-purple-accent hover:bg-tertiary rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      保存配置
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {currentServiceType.providers.map((provider) => {
                  const config = configs.find((c) => c.provider === provider);
                  const testResult = testResults[`${activeTab}-${provider}`];
                  const hasConfig = !!config;

                  return (
                    <div
                      key={provider}
                      className={`bg-surface rounded-xl border p-5 transition-all duration-200 ${
                        hasConfig && config.enabled
                          ? 'border-purple-accent/30 shadow-sm hover:shadow-md'
                          : 'border-outline hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            hasConfig && config.enabled ? 'bg-success' : 'bg-on-surface-variant/30'
                          }`} />
                          <div>
                            <h4 className="text-body-md font-semibold text-on-surface">
                              {PROVIDER_LABELS[provider] || provider}
                            </h4>
                            {hasConfig && config.model_name && (
                              <p className="text-body-xs text-on-surface-variant/70 mt-0.5">
                                模型: {config.model_name}
                              </p>
                            )}
                          </div>
                        </div>
                        {hasConfig && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleTestConnection(activeTab, provider)}
                              className="p-2 hover:bg-secondary rounded-lg text-on-surface-variant hover:text-success transition-all"
                              title="测试连接"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingConfig(config)}
                              className="p-2 hover:bg-secondary rounded-lg text-on-surface-variant hover:text-primary transition-all"
                              title="编辑"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="p-2 hover:bg-secondary rounded-lg text-on-surface-variant hover:text-error transition-all"
                              title="删除"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {hasConfig ? (
                        <>
                          <div className="text-body-xs text-on-surface-variant/80 mb-3 break-all">
                            {config.base_url}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-body-xs font-medium ${
                              config.api_key_set ? 'text-success' : 'text-warning'
                            }`}>
                              {config.api_key_set ? '✓ 密钥已配置' : '! 未配置密钥'}
                            </span>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={config.enabled}
                                  onChange={(e) => handleToggle(config.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-secondary border border-outline rounded-full peer-checked:bg-purple-accent peer-checked:border-purple-accent transition-all" />
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:left-5 transition-all" />
                              </div>
                              <span className="text-body-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                                {config.enabled ? '已启用' : '未启用'}
                              </span>
                            </label>
                          </div>

                          {testResult && (
                            <div className={`mt-3 p-2 rounded-lg text-body-xs ${
                              testResult.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                            }`}>
                              {testResult.message}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddConfig(provider)}
                          className="w-full py-3 border-2 border-dashed border-outline rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-purple-accent hover:border-purple-accent/50 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          + 添加配置
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-outline bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2 text-body-xs text-on-surface-variant/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>提示：未启用或未配置的服务将自动回退到 Mock 模式</span>
          </div>
          <button onClick={onClose} className="px-5 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-secondary rounded-lg transition-all">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
