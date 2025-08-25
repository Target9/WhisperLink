import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '../types';

interface WebSocketMessage {
  type: string;
  content?: string;
  message?: Message;
  users?: string[];
  username?: string;
  timestamp?: string;
  message_id?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (content: string, receiver: string, isEncrypted?: boolean) => void;
  connect: (username: string) => void;
  disconnect: () => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string>('');
  const processedMessages = useRef<Set<string>>(new Set());

  const connect = useCallback((username: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    usernameRef.current = username;
    setConnectionError(null);
    processedMessages.current.clear(); // Clear processed messages on new connection

    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/${username}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Create a unique identifier for this message to prevent duplicates
          const messageId = data.message?.id || data.message_id || JSON.stringify(data);
          
          // Check if we've already processed this message
          if (processedMessages.current.has(messageId)) {
            console.log('Skipping duplicate message:', messageId);
            return;
          }
          
          // Mark message as processed
          processedMessages.current.add(messageId);
          
          setLastMessage(data);

          switch (data.type) {
            case 'users':
              if (data.users) {
                setOnlineUsers(data.users);
              }
              break;
            case 'user_joined':
              if (data.username) {
                setOnlineUsers(prev => 
                  prev.includes(data.username!) ? prev : [...prev, data.username!]
                );
              }
              break;
            case 'user_left':
              if (data.username) {
                setOnlineUsers(prev => prev.filter(user => user !== data.username));
              }
              break;
            case 'message':
              // Handle incoming message
              console.log('Received message:', data.message);
              break;
            case 'message_sent':
              // Handle message sent confirmation
              console.log('Message sent confirmation:', data.message_id);
              break;
            case 'system':
              console.log('System message:', data.content);
              break;
            case 'pong':
              // Handle pong response
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setOnlineUsers([]);
        
        if (event.code === 4000) {
          setConnectionError('Username already taken');
        } else if (event.code !== 1000) {
          setConnectionError('Connection lost. Please try reconnecting.');
        }
        
        console.log('WebSocket disconnected:', event.code, event.reason);
      };

      ws.onerror = (error) => {
        setConnectionError('Failed to connect to server');
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setConnectionError('Failed to create WebSocket connection');
      console.error('Failed to create WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
    setOnlineUsers([]);
    setLastMessage(null);
    setConnectionError(null);
  }, []);

  const sendMessage = useCallback((content: string, receiver: string, isEncrypted: boolean = true) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        content,
        receiver,
        isEncrypted
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Clean up processed messages periodically to prevent memory leaks
  useEffect(() => {
    if (!isConnected) return;

    const cleanupInterval = setInterval(() => {
      if (processedMessages.current.size > 1000) {
        console.log('Cleaning up processed messages cache');
        processedMessages.current.clear();
      }
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, [isConnected]);

  // Ping to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    connect,
    disconnect,
    lastMessage,
    connectionError
  };
};
