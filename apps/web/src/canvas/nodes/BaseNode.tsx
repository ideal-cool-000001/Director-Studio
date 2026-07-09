// ═══════════════════════════════════════════
// BaseNode — 基础节点组件（所有卡片类型共用）
// ═══════════════════════════════════════════

import { memo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, NodeType } from '@director/shared-types';

/** 状态颜色映射 */
const STATUS_COLORS: Record<NodeStatus, string> = {
  draft: 'bg-gray-500',
  generating: 'bg-blue-500 animate-pulse',
  ready: 'bg-green-500',
  approved: 'bg-emerald-600',
  failed: 'bg-red-500',
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
        relative rounded-lg border-2 transition-all min-w-[180px]
        ${selected ? 'border-canvas-accent shadow-lg shadow-canvas-accent/20' : 'border-gray-700'}
        bg-canvas-node/90 backdrop-blur-sm
      `}
    >
      {/* 输入端口 */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-canvas-accent !border-2 !border-white"
      />

      {/* 节点头部 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50">
        <span className="text-lg">{NODE_ICONS[nodeType]}</span>
        <span className="text-sm font-medium truncate flex-1">{label}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
      </div>

      {/* 缩略图区域 */}
      {thumbnail && (
        <div className="px-3 py-2">
          <img
            src={thumbnail}
            alt={label}
            className="w-full h-24 object-cover rounded"
          />
        </div>
      )}

      {/* 自定义内容区域 */}
      {children && <div className="px-3 py-2">{children}</div>}

      {/* 输出端口 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-canvas-accent !border-2 !border-white"
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeInner);
