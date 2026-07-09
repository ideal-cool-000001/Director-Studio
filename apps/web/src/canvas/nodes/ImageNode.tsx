import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const ImageNode = memo((props: NodeProps) => {
  const resolution = props.data.resolution as { width: number; height: number };
  const generationParams = props.data.generation_params as {
    model?: string;
    seed?: number;
    steps?: number;
  };

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>分辨率</span>
          <span className="font-medium text-gray-300">
            {resolution ? `${resolution.width}x${resolution.height}` : '--'}
          </span>
        </div>
        {generationParams && (
          <>
            {generationParams.model && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">模型:</span>
                <span className="text-gray-300 truncate">{generationParams.model}</span>
              </div>
            )}
            {generationParams.seed !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Seed:</span>
                <span className="text-gray-300">{generationParams.seed}</span>
              </div>
            )}
          </>
        )}
      </div>
    </BaseNode>
  );
});