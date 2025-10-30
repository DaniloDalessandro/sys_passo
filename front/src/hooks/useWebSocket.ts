/**
 * Hook personalizado para gerenciar conexão WebSocket
 * para notificações em tempo real de solicitações
 */
import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
  type: string;
  request_type?: 'driver' | 'vehicle';
  request_id?: number;
  protocol?: string;
  message?: string;
  title?: string;
  data?: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Armazena callbacks em refs para evitar recriação
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Atualiza refs quando callbacks mudam
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const connect = useCallback(() => {
    try {
      // Fecha conexão existente se houver
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }

      console.log('[WebSocket] Tentando conectar a:', url);

      // Cria nova conexão WebSocket
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Conexão estabelecida');
        setIsConnected(true);
        setConnectionError(null);
        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Mensagem recebida:', data);
          onMessageRef.current?.(data);
        } catch (error) {
          console.error('[WebSocket] Erro ao parsear mensagem:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Erro:', error);
        setConnectionError('Erro na conexão WebSocket');
        onErrorRef.current?.(error);
      };

      ws.current.onclose = (event) => {
        console.log('[WebSocket] Conexão fechada', event.code, event.reason);
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Reconecta automaticamente se configurado
        if (autoReconnect && !event.wasClean) {
          console.log(`[WebSocket] Reconectando em ${reconnectInterval}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Erro ao criar conexão:', error);
      setConnectionError('Falha ao conectar');
    }
  }, [url, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Não é possível enviar mensagem: conexão não estabelecida');
    }
  }, []);

  // Conecta ao montar e desconecta ao desmontar
  // IMPORTANTE: Array de dependências vazio para conectar apenas UMA VEZ
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Conecta apenas na montagem inicial

  return {
    isConnected,
    connectionError,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};
