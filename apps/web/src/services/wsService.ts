export type WSEventType =
  | 'node:status_changed'
  | 'node:thumbnail_updated'
  | 'node:quality_score'
  | 'task:progress'
  | 'task:completed'
  | 'task:failed'
  | 'cost:updated'
  | 'cost:budget_warning'
  | 'review:required'
  | 'review:completed'
  | 'export:progress'
  | 'system:alert';

export interface WSMessage<T = any> {
  event: WSEventType;
  project_id: string;
  payload: T;
}

export interface NodeStatusChangedPayload {
  node_id: string;
  status: string;
  previous_status?: string;
  message?: string;
}

export interface TaskProgressPayload {
  task_id: string;
  node_id: string;
  progress: number;
  status: string;
  message?: string;
}

export interface TaskCompletedPayload {
  task_id: string;
  node_id: string;
  result: Record<string, unknown>;
  cost?: number;
}

export interface CostUpdatedPayload {
  project_id: string;
  total_cost: number;
  node_cost?: Record<string, number>;
}

export interface ReviewRequiredPayload {
  node_id: string;
  node_type: string;
  task_id: string;
  review_type: string;
}

interface EventHandler {
  (payload: any): void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<WSEventType, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(projectId: string): void {
    const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const url = `${WS_BASE}/api/v1/ws/projects/${projectId}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      console.log(`WebSocket connected to project: ${projectId}`);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.dispatchEvent(message.event, message.payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(projectId);
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  send(event: string, payload: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    }
  }

  on<T>(eventType: WSEventType, handler: (payload: T) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler as EventHandler);
  }

  off<T>(eventType: WSEventType, handler: (payload: T) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  private dispatchEvent(eventType: WSEventType, payload: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error handling event ${eventType}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();