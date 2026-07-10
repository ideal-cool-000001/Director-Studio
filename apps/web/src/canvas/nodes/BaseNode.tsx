// ═══════════════════════════════════════════
// BaseNode — 基础节点组件（所有卡片类型共用）
// ═══════════════════════════════════════════

import { memo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, NodeType } from '@director/shared-types';

const STATUS_COLORS: Record<NodeStatus, string> = {
  draft: 'bg-on-surface-variant',
  generating: 'bg-info animate-pulse',
  ready: 'bg-success',
  approved: 'bg-primary',
  failed: 'bg-error',
};

const NODE_ICONS: Record<string, string> = {
  character: '👤',
  scene: '🏞️',
  storyboard: '🎬',
  video: '🎥',
  image: '🖼️',
  audio: '🎵',
  text: '📝',
  style: '🎨',
};

interface BaseNodeProps extends NodeProps {
  children?: ReactNode;
}

function BaseNodeInner({ data, selected, children }: BaseNodeProps) {
  const status = (data.status as NodeStatus) || 'draft';
  const nodeType = (data.nodeType as NodeType) || 'text';
  const label = (data.label as string) || 'Untitled';
  const thumbnail = data.thumbnail as string | undefined;

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-normal min-w-[200px]
        ${selected ? 'border-primary shadow-3 shadow-primary/20 scale-[1.02]' : 'border-outline'}
        bg-surface/95 backdrop-blur-md
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-surface"
      />

      <div className="flex items-center gap-sm px-md py-sm border-b border-outline">
        <span className="text-xl">{NODE_ICONS[nodeType]}</span>
        <span className="text-body-sm font-semibold truncate flex-1 text-on-surface">{label}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
      </div>

      {thumbnail && (
        <div className="px-md py-sm">
          <img
            src={thumbnail}
            alt={label}
            className="w-full h-24 object-cover rounded-lg"
          />
        </div>
      )}

      {children && <div className="px-md py-sm">{children}</div>}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-surface"
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeInner);