import { memo } from 'react';
import { BaseNode } from './BaseNode';
import type { NodeProps } from '@xyflow/react';

export const SceneNode = memo((props: NodeProps) => {
  const location = props.data.location as string;
  const timeOfDay = props.data.time_of_day as string;
  const atmosphere = (props.data.atmosphere as string[]) || [];

  return (
    <BaseNode {...props}>
      <div className="text-xs text-gray-400 space-y-1">
        {location && <p className="truncate" title={location}>{location}</p>}
        {timeOfDay && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">时间:</span>
            <span className="text-gray-300">
              {timeOfDay === 'day' ? '白天' : timeOfDay === 'dusk' ? '黄昏' : '夜晚'}
            </span>
          </div>
        )}
        {atmosphere.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {atmosphere.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300"
              >
                {tag}
              </span>
            ))}
            {atmosphere.length > 3 && (
              <span className="text-gray-500">+{atmosphere.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  );
});