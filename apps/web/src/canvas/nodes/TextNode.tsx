import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const TextNode = memo((props: NodeProps) => {
  const content = props.data.content as string;
  const textType = props.data.text_type as string;
  const wordCount = props.data.word_count as number;
  const language = props.data.language as string;

  const typeLabels: Record<string, string> = {
    dialogue: '对话',
    narration: '旁白',
    subtitle: '字幕',
    note: '备注',
  };

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>类型</span>
          <span className="font-medium text-gray-300">{typeLabels[textType] || textType || '--'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>字数</span>
          <span className="font-medium text-gray-300">{wordCount || 0}</span>
        </div>
        {language && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">语言:</span>
            <span className="text-gray-300">{language}</span>
          </div>
        )}
        {content && (
          <p className="line-clamp-2 mt-1" title={content}>
            {content}
          </p>
        )}
      </div>
    </BaseNode>
  );
});