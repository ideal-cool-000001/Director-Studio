import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const StoryboardNode = memo((props: NodeProps) => {
  const shots = (props.data.shots as Array<{ shot_number: number; shot_size: string; duration: number }>) || [];
  
  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>镜头数</span>
          <span className="font-medium text-gray-300">{shots.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>总时长</span>
          <span className="font-medium text-gray-300">
            {shots.reduce((sum, s) => sum + (s.duration || 0), 0).toFixed(1)}s
          </span>
        </div>
        {shots.length > 0 && (
          <div className="mt-2 space-y-0.5 max-h-20 overflow-y-auto">
            {shots.slice(0, 3).map((shot) => (
              <div key={shot.shot_number} className="flex items-center gap-2">
                <span className="text-gray-500">#{shot.shot_number}</span>
                <span className="truncate flex-1">{shot.shot_size}</span>
                <span className="text-gray-500">{shot.duration}s</span>
              </div>
            ))}
            {shots.length > 3 && (
              <div className="text-gray-500 text-center">+{shots.length - 3} more</div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  );
});