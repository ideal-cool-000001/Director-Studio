// ═══════════════════════════════════════════
// useGraphStore — 图结构状态（nodes / edges）
// ═══════════════════════════════════════════

import { create } from 'zustand';
import type { Node, Edge, Connection } from '@xyflow/react';
import { EdgeType, NodeStatus, NodeType } from '@director/shared-types';

interface GraphState {
  nodes: Node[];
  edges: Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addEdge: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }, data?: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
}

let nodeIdCounter = 0;
let edgeIdCounter = 0;

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addEdge: (connection: Connection) => {
    const { edges } = get();
    const newEdge: Edge = {
      id: `edge-${++edgeIdCounter}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'strongDependency',
    };
    set({ edges: [...edges, newEdge] });
  },

  addNode: (type, position, data = {}) => {
    const { nodes } = get();
    const newNode: Node = {
      id: `node-${++nodeIdCounter}`,
      type,
      position,
      data: {
        label: `New ${type}`,
        nodeType: type,
        status: NodeStatus.Draft,
        ...data,
      },
    };
    set({ nodes: [...nodes, newNode] });
  },

  removeNode: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
    });
  },

  updateNodeData: (nodeId, data) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },

  updateNodeStatus: (nodeId, status) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, status } }
          : n,
      ),
    });
  },
}));
