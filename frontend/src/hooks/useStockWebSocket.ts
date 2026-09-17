import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { StockQuote } from '../types';

export interface AlertTriggerEvent {
  id: number;
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  target_price: number;
  current_price: number;
  currency: string;
  message: string;
}

interface UseStockWebSocketResult {
  quotes: StockQuote[];
  isConnected: boolean;
  lastUpdated: string | null;
  error: string | null;
  activeAlertNotification: AlertTriggerEvent | null;
  dismissAlertNotification: () => void;
  reconnect: () => void;
}

export function useStockWebSocket(): UseStockWebSocketResult {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAlertNotification, setActiveAlertNotification] = useState<AlertTriggerEvent | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://${window.location.hostname}:8000/ws/prices?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'PRICE_UPDATE' || payload.type === 'INITIAL_PRICES') {
          if (payload.data && Array.isArray(payload.data)) {
            setQuotes(payload.data);
            setLastUpdated(new Date().toLocaleTimeString());
          }
        } else if (payload.type === 'ALERT_TRIGGERED') {
          setActiveAlertNotification(payload.data);
          // Try browser notification if permitted
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`🚨 Price Alert: ${payload.data.symbol}`, {
              body: payload.data.message,
            });
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection encountered an error');
      setIsConnected(false);
    };
  }, [token]);

  useEffect(() => {
    connect();

    // Request browser notification permission if available
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  return {
    quotes,
    isConnected,
    lastUpdated,
    error,
    activeAlertNotification,
    dismissAlertNotification: () => setActiveAlertNotification(null),
    reconnect: connect,
  };
}
