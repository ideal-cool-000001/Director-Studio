import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const VideoNode = memo((props: NodeProps) => {
  const duration = props.data.duration as number;
  const resolution = props.data.resolution as { width: number; height: number };
  const fps = props.data.fps as number;
  const codec = props.data.codec as string;
  const generationModel = props.data.generation_model as string;

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>时长</span>
          <span className="font-medium text-gray-300">{duration?.toFixed(1) || '--'}s</span>
        </div>
        <div className="flex items-center justify-between">
          <span>分辨率</span>
          <span className="font-medium text-gray-300">
            {resolution ? `${resolution.width}x${resolution.height}` : '--'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{fps || '--'}fps</span>
          <span className="text-gray-500">{codec || '--'}</span>
        </div>
        {generationModel && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">模型:</span>
            <span className="text-gray-300 truncate">{generationModel}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
});