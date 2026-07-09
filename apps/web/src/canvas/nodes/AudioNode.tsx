import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const AudioNode = memo((props: NodeProps) => {
  const duration = props.data.duration as number;
  const audioType = props.data.audio_type as string;
  const sampleRate = props.data.sample_rate as number;
  const channels = props.data.channels as number;
  const characterId = props.data.character_id as string;

  const typeLabels: Record<string, string> = {
    tts_dialogue: '对话语音',
    bgm: '背景音乐',
    sfx: '音效',
    mixed: '混音',
  };

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>时长</span>
          <span className="font-medium text-gray-300">{duration?.toFixed(1) || '--'}s</span>
        </div>
        <div className="flex items-center justify-between">
          <span>类型</span>
          <span className="font-medium text-gray-300">{typeLabels[audioType] || audioType || '--'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{sampleRate || '--'}Hz</span>
          <span className="text-gray-500">{channels || 1}ch</span>
        </div>
        {characterId && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">角色:</span>
            <span className="text-gray-300 truncate">ID:{characterId.slice(0, 8)}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
});