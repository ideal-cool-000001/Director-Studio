import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const StyleNode = memo((props: NodeProps) => {
  const preset = props.data.preset as string;
  const colorScheme = props.data.color_scheme as { primary: string; secondary: string; accent: string };
  const moodboardCount = ((props.data.moodboard_urls as string[]) || []).length;

  const presetLabels: Record<string, string> = {
    realistic: '写实',
    anime: '动漫',
    cyberpunk: '赛博朋克',
    ink_wash: '水墨',
    retro: '复古',
    '3d': '3D',
    custom: '自定义',
  };

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>风格</span>
          <span className="font-medium text-gray-300">{presetLabels[preset] || preset || '自定义'}</span>
        </div>
        {colorScheme && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">配色:</span>
            <div className="flex gap-1">
              <span
                className="w-4 h-4 rounded-sm border border-gray-600"
                style={{ backgroundColor: colorScheme.primary }}
              />
              <span
                className="w-4 h-4 rounded-sm border border-gray-600"
                style={{ backgroundColor: colorScheme.secondary }}
              />
              <span
                className="w-4 h-4 rounded-sm border border-gray-600"
                style={{ backgroundColor: colorScheme.accent }}
              />
            </div>
          </div>
        )}
        {moodboardCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">参考图:</span>
            <span className="text-gray-300">{moodboardCount}张</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
});