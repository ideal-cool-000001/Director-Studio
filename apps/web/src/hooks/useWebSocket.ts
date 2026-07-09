import { useEffect, useCallback } from 'react';
import { wsService, WSEventType, type WSMessage } from '../services/wsService';

export function useWebSocket(projectId: string | null) {
  useEffect(() => {
    if (projectId) {
      wsService.connect(projectId);
    }

    return () => {
      wsService.disconnect();
    };
  }, [projectId]);

  const subscribe = useCallback(<T>(
    eventType: WSEventType,
    handler: (payload: T) => void
  ) => {
    wsService.on(eventType, handler);
    return () => wsService.off(eventType, handler);
  }, []);

  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    wsService.send(event, payload);
  }, []);

  const isConnected = useCallback(() => wsService.isConnected(), []);

  return { subscribe, send, isConnected };
}