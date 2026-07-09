// ═══════════════════════════════════════════
// 3种自定义连接线 + 注册表
// ═══════════════════════════════════════════

import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

/** 强依赖边 — 实线（红色） */
function StrongDependencyEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style = {},
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ ...style, stroke: '#e94560', strokeWidth: 2 }}
    />
  );
}

/** 弱引用边 — 虚线（灰色） */
function WeakReferenceEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style = {},
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: '#6c757d',
        strokeWidth: 1.5,
        strokeDasharray: '8 4',
      }}
    />
  );
}

/** 风格继承边 — 点划线（金色） */
function StyleInheritanceEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style = {},
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: '#ffc107',
        strokeWidth: 1.5,
        strokeDasharray: '12 4 4 4',
      }}
    />
  );
}

/** React Flow 边类型注册表 */
export const edgeTypes = {
  strongDependency: StrongDependencyEdge,
  weakReference: WeakReferenceEdge,
  styleInheritance: StyleInheritanceEdge,
};
