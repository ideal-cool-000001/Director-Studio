import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const CharacterNode = memo((props: NodeProps) => {
  const description = props.data.description as string;
  const personality = props.data.personality as string;
  const relationshipCount = ((props.data.relationships as Array<unknown>) || []).length;

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        {description && (
          <p className="truncate" title={description}>{description}</p>
        )}
        {personality && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">性格:</span>
            <span className="truncate">{personality}</span>
          </div>
        )}
        {relationshipCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">关系:</span>
            <span className="text-gray-300">{relationshipCount}人</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
});