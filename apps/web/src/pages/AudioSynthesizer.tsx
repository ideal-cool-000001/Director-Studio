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
    <div className="h-full flex gap-lg p-lg">
      <div className="flex-1 flex flex-col gap-lg">
        <div className="card">
          <h3 className="text-body-lg font-semibold text-on-surface mb-md">语音合成</h3>
          <div className="grid grid-cols-2 gap-lg">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-sm">输入文字</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field w-full h-32 resize-none"
                placeholder="输入需要合成语音的文字..."
              />
            </div>
            <div className="space-y-md">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">选择音色</label>
                <div className="grid grid-cols-2 gap-sm">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      className={`p-sm rounded-lg text-left transition-colors ${
                        selectedVoice.id === voice.id ? 'bg-primary text-on-primary' : 'bg-secondary hover:bg-hover'
                      }`}
                    >
                      <p className="text-body-sm font-medium">{voice.name}</p>
                      <p className="text-body-xs">{voice.gender === 'male' ? '男' : voice.gender === 'female' ? '女' : '中性'}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">语速: {speed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">情感</label>
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
          <div className="flex justify-end mt-lg">
            <button onClick={handleGenerate} className="btn-primary">生成语音</button>
          </div>
        </div>

        <div className="flex-1 card flex flex-col">
          <div className="flex items-center justify-between p-md border-b border-outline">
            <h3 className="text-body-md font-semibold text-on-surface">语音片段列表</h3>
            <button className="btn-outline">导出全部</button>
          </div>
          <div className="flex-1 overflow-y-auto p-md">
            {clips.map((clip) => (
              <div key={clip.id} className="flex items-center justify-between p-md bg-secondary rounded-lg mb-sm">
                <div className="flex-1">
                  <p className="text-body-sm text-on-surface">{clip.text}</p>
                  <p className="text-body-xs text-on-surface-variant mt-xs">
                    {voices.find(v => v.id === clip.voiceId)?.name} | {clip.speed}x | {clip.emotion}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <span className="text-body-xs text-on-surface-variant">{clip.duration}s</span>
                  <button className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-[#1A1A1A]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.555 1.019A1 1 0 0110 2v16a1 1 0 01-1.445.894L5.482 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.482l3.073-6.146a1 1 0 011.072-.565z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-secondary text-on-surface-variant flex items-center justify-center hover:bg-hover">
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

      <div className="w-80">
        <AIPanel presetAgents={['voice']} />
      </div>
    </div>
  );
}