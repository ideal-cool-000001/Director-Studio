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
  { key: 'image', label: '图像生成', providers: ['flux2', 'dalle3', 'stable_diffusion', 'midjourney'] },
  { key: 'video', label: '视频生成', providers: ['kling3', 'seedance', 'runway', 'pika'] },
  { key: 'audio', label: '语音合成', providers: ['volcengine', 'aliyun', 'baidu', 'openai'] },
  { key: 'bgm', label: '背景音乐', providers: ['stable_audio'] },
  { key: 'publish', label: '发布平台', providers: ['douyin', 'kuaishou', 'bilibili', 'xiaohongshu', 'youtube', 'tiktok'] },
];

const DEFAULT_URLS: Record<string, string> = {
  flux2: 'https://api.runwayml.com',
  dalle3: 'https://api.openai.com',
  stable_diffusion: 'https://api.stability.ai',
  midjourney: 'https://api.midjourney.com',
  kling3: 'https://api.klingai.com',
  seedance: 'https://api.seedance.ai',
  runway: 'https://api.runwayml.com',
  pika: 'https://api.pika.art',
  volcengine: 'https://tts.speech.volcengineapi.com',
  aliyun: 'https://nlsapi.cn-shanghai.aliyuncs.com',
  baidu: 'https://vop.baidu.com',
  openai: 'https://api.openai.com',
  stable_audio: 'https://api.stability.ai',
  douyin: 'https://open.douyin.com',
  kuaishou: 'https://open.kuaishou.com',
  bilibili: 'https://api.bilibili.com',
  xiaohongshu: 'https://api.xiaohongshu.com',
  youtube: 'https://www.googleapis.com',
  tiktok: 'https://open-api.tiktok.com',
};

const MODEL_NAMES: Record<string, string[]> = {
  flux2: ['flux2', 'flux2-dev'],
  dalle3: ['dall-e-3', 'dall-e-2'],
  stable_diffusion: ['sd3', 'sd2.1', 'sd1.5'],
  openai: ['tts-1', 'tts-1-hd'],
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('image');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[85vh] bg-panel rounded-xl border border-primary overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary">
          <h2 className="text-lg font-semibold text-primary">AI 服务配置</h2>
          <button onClick={onClose} className="p-2 hover:bg-hover rounded-lg text-secondary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-primary">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => {
                setActiveTab(type.key);
                setEditingConfig(null);
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === type.key ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              {type.label}
              {activeTab === type.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {editingConfig ? (
                <div className="bg-card rounded-lg p-4 border border-primary">
                  <h3 className="text-sm font-medium text-primary mb-4">
                    {editingConfig.id ? '编辑配置' : '新建配置'} - {editingConfig.provider}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-secondary mb-1">API 地址</label>
                      <input
                        type="text"
                        defaultValue={editingConfig.base_url}
                        className="w-full px-3 py-2 bg-primary border border-primary rounded-md text-sm"
                        onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, base_url: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-secondary mb-1">模型名称</label>
                      {MODEL_NAMES[editingConfig.provider] ? (
                        <select
                          className="w-full px-3 py-2 bg-primary border border-primary rounded-md text-sm text-primary"
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
                          className="w-full px-3 py-2 bg-primary border border-primary rounded-md text-sm"
                          onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, model_name: e.target.value } : null)}
                          placeholder="模型名称"
                        />
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-secondary mb-1">API 密钥</label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        className="w-full px-3 py-2 bg-primary border border-primary rounded-md text-sm"
                        placeholder={editingConfig.api_key_set ? '密钥已设置（输入新值将覆盖）' : '输入 API 密钥'}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingConfig.enabled}
                          onChange={(e) => setEditingConfig((prev) => prev ? { ...prev, enabled: e.target.checked } : null)}
                          className="rounded border-primary bg-primary text-accent"
                        />
                        <span className="text-sm text-secondary">启用此服务</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-accent text-black font-medium rounded-md hover:bg-accent-hover transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingConfig(null);
                        setApiKeyInput('');
                      }}
                      className="px-4 py-2 bg-hover text-secondary rounded-md hover:text-primary transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                {currentServiceType.providers.map((provider) => {
                  const config = configs.find((c) => c.provider === provider);
                  const testResult = testResults[`${activeTab}-${provider}`];
                  const hasConfig = !!config;

                  return (
                    <div
                      key={provider}
                      className={`bg-card rounded-lg border p-4 ${hasConfig && config.enabled ? 'border-accent' : 'border-primary'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${hasConfig && config.enabled ? 'bg-success' : 'bg-text-muted'}`} />
                          <span className="text-sm font-medium text-primary capitalize">{provider}</span>
                        </div>
                        {hasConfig && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleTestConnection(activeTab, provider)}
                              className="p-1.5 hover:bg-hover rounded text-secondary hover:text-primary transition-colors"
                              title="测试连接"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingConfig(config)}
                              className="p-1.5 hover:bg-hover rounded text-secondary hover:text-primary transition-colors"
                              title="编辑"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="p-1.5 hover:bg-hover rounded text-secondary hover:text-error transition-colors"
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
                          <div className="text-xs text-secondary mb-1">
                            {config.base_url}
                          </div>
                          {config.model_name && (
                            <div className="text-xs text-muted mb-2">
                              模型: {config.model_name}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${config.api_key_set ? 'text-success' : 'text-warning'}`}>
                              {config.api_key_set ? '✓ 密钥已配置' : '! 未配置密钥'}
                            </span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => handleToggle(config.id, e.target.checked)}
                                className="rounded border-primary bg-primary text-accent"
                              />
                              <span className="text-xs text-secondary">启用</span>
                            </label>
                          </div>
                          {testResult && (
                            <div className={`mt-2 text-xs ${testResult.success ? 'text-success' : 'text-error'}`}>
                              {testResult.message}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddConfig(provider)}
                          className="w-full py-3 border border-dashed border-primary rounded-md text-secondary hover:text-primary hover:border-accent transition-colors text-sm"
                        >
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

        <div className="px-6 py-3 border-t border-primary bg-primary/50 flex items-center justify-between">
          <span className="text-xs text-muted">
            提示：未启用或未配置的服务将自动回退到 Mock 模式
          </span>
        </div>
      </div>
    </div>
  );
}