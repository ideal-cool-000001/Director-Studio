import { useState } from 'react';
import AIPanel from '@/components/AIPanel/AIPanel';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
}

interface AudioClip {
  id: string;
  text: string;
  voiceId: string;
  speed: number;
  emotion: string;
  duration: number;
}

const MOCK_VOICES: Voice[] = [
  { id: '1', name: '小明', gender: 'male', language: '中文' },
  { id: '2', name: '小红', gender: 'female', language: '中文' },
  { id: '3', name: '阿杰', gender: 'male', language: '中文' },
  { id: '4', name: '小美', gender: 'female', language: '中文' },
];

const MOCK_CLIPS: AudioClip[] = [
  { id: '1', text: '故事开始于一个遥远的星球...', voiceId: '1', speed: 1, emotion: '平静', duration: 5 },
  { id: '2', text: '你是谁？为什么来到这里？', voiceId: '2', speed: 1.1, emotion: '疑惑', duration: 4 },
];

export default function AudioSynthesizer() {
  const [voices, setVoices] = useState<Voice[]>(MOCK_VOICES);
  const [clips, setClips] = useState<AudioClip[]>(MOCK_CLIPS);
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [inputText, setInputText] = useState('');
  const [speed, setSpeed] = useState(1);
  const [emotion, setEmotion] = useState('平静');

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    const clip: AudioClip = {
      id: Date.now().toString(),
      text: inputText.trim(),
      voiceId: selectedVoice.id,
      speed,
      emotion,
      duration: Math.floor(inputText.length / 10),
    };
    setClips((prev) => [...prev, clip]);
    setInputText('');
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-lg py-md bg-surface border-b border-outline">
        <div>
          <h2 className="text-title-lg font-semibold tracking-tight text-on-surface">语音合成</h2>
          <p className="text-body-sm text-on-surface-variant mt-xs">输入文字 · 选择音色 · 生成专属语音片段</p>
        </div>
        <span className="badge-accent">当前音色 · {selectedVoice.name}</span>
      </div>

      {/* Main */}
      <div className="flex-1 flex gap-lg p-lg overflow-hidden">
        {/* Left column: synthesis controls + voice clips list */}
        <div className="flex-1 flex flex-col gap-lg overflow-hidden">
          {/* Synthesis controls card */}
          <div className="aurora-card animate-slide-up">
            <h3 className="text-title-lg font-semibold tracking-tight text-on-surface mb-lg">合成设置</h3>
            <div className="grid grid-cols-2 gap-lg">
              {/* Text input */}
              <div>
                <label className="block text-label-md font-medium text-on-surface-variant mb-sm">输入文字</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="input-field w-full h-40 resize-none"
                  placeholder="输入需要合成语音的文字..."
                />
                <div className="flex items-center justify-between mt-sm">
                  <span className="text-body-xs text-on-surface-muted">支持中英文混合输入</span>
                  <span className="text-body-xs text-on-surface-variant tabular-nums">{inputText.length} 字</span>
                </div>
              </div>

              {/* Voice selection + parameters */}
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-sm">选择音色</label>
                  <div className="grid grid-cols-2 gap-md">
                    {voices.map((voice, index) => {
                      const isSelected = selectedVoice.id === voice.id;
                      return (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice)}
                          className="card-hover text-left animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms`, ...(isSelected ? { borderColor: 'var(--color-tertiary)', boxShadow: 'var(--shadow-glow)' } : {}) }}
                        >
                          <div className="flex items-center gap-sm">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-semibold transition-all duration-normal ${
                                isSelected ? 'bg-tertiary text-on-tertiary' : 'text-white'
                              }`}
                              style={isSelected ? undefined : { background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)' }}
                            >
                              {voice.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-body-sm font-medium text-on-surface truncate">{voice.name}</p>
                              <p className="text-body-xs text-on-surface-variant">
                                {voice.gender === 'male' ? '男' : voice.gender === 'female' ? '女' : '中性'} · {voice.language}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Parameter panel */}
                <div className="bg-surface border border-outline rounded-lg p-md space-y-md">
                  <div>
                    <label className="flex items-center justify-between text-label-md font-medium text-on-surface-variant mb-sm">
                      <span>语速</span>
                      <span className="text-tertiary tabular-nums">{speed}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between mt-xs">
                      <span className="text-body-xs text-on-surface-muted">0.5x</span>
                      <span className="text-body-xs text-on-surface-muted">2.0x</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-md font-medium text-on-surface-variant mb-sm">情感</label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="平静">平静</option>
                      <option value="兴奋">兴奋</option>
                      <option value="悲伤">悲伤</option>
                      <option value="愤怒">愤怒</option>
                      <option value="疑惑">疑惑</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-lg">
              <button onClick={handleGenerate} className="btn-primary flex items-center gap-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
                生成语音
              </button>
            </div>
          </div>

          {/* Voice clips list card */}
          <div
            className="bg-surface border border-outline rounded-lg flex-1 flex flex-col overflow-hidden animate-slide-up delay-100"
            style={{ boxShadow: 'var(--shadow-3)' }}
          >
            <div className="flex items-center justify-between px-lg py-md border-b border-outline">
              <div className="flex items-center gap-sm">
                <h3 className="text-title-md font-semibold text-on-surface">语音片段列表</h3>
                <span className="badge">{clips.length}</span>
              </div>
              <button className="btn-outline flex items-center gap-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出全部
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-lg space-y-md">
              {clips.map((clip, index) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-md p-md bg-surface-muted rounded-lg transition-all duration-normal hover:bg-hover animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    className="w-9 h-9 rounded-full text-on-primary flex items-center justify-center shrink-0 transition-all duration-normal hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7B61FF 0%, #5E50D6 100%)', boxShadow: 'var(--shadow-1)' }}
                  >
                    <svg className="w-4 h-4 ml-xs" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.555 1.019A1 1 0 0110 2v16a1 1 0 01-1.445.894L5.482 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.482l3.073-6.146a1 1 0 011.072-.565z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex items-end gap-[3px] h-8 shrink-0">
                    {[10, 18, 24, 14, 20, 12, 22, 8, 16, 12].map((h, i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-tertiary"
                        style={{ height: `${h}px`, opacity: 0.3 + (i % 4) * 0.18 }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-on-surface truncate">{clip.text}</p>
                    <div className="flex items-center gap-xs mt-xs">
                      <span className="badge-accent">{voices.find((v) => v.id === clip.voiceId)?.name}</span>
                      <span className="badge">{clip.speed}x</span>
                      <span className="badge">{clip.emotion}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    <span className="text-body-xs text-on-surface-muted tabular-nums">{clip.duration}s</span>
                    <button className="icon-btn" title="删除">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar: AI assistant */}
        <div className="w-80">
          <AIPanel variant="audio" presetAgents={['voice']} />
        </div>
      </div>
    </div>
  );
}
