// ═══════════════════════════════════════════
// CanvasWorkspace — 画布主容器（React Flow 封装）
// ═══════════════════════════════════════════

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { useGraphStore } from '@/stores/useGraphStore';
import { nodeTypes } from './nodes/nodeTypes';
import { edgeTypes } from './edges/edgeTypes';

export function CanvasWorkspace() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const addEdge = useGraphStore((s) => s.addEdge);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => addEdge(connection),
    [addEdge],
  );

  const defaultEdgeOptions = useMemo(
    () => ({ type: 'strongDependency' }),
    [],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      minZoom={0.1}
      maxZoom={5}
      snapToGrid
      snapGrid={[16, 16]}
      className="bg-canvas-bg"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="#2a2a4a"
      />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          switch (n.type) {
            case 'character': return '#e94560';
            case 'scene': return '#0f9b58';
            case 'storyboard': return '#ffc107';
            case 'video': return '#4a90d9';
            case 'image': return '#9c27b0';
            case 'audio': return '#ff9800';
            case 'text': return '#607d8b';
            case 'style': return '#795548';
            default: return '#666';
          }
        }}
        maskColor="rgba(0,0,0,0.6)"
      />
    </ReactFlow>
  );
}
