// Real-time data layer. Subscribes to /api/stream/ticks via EventSource
// (auto-reconnects on network drop per spec). Exposes:
//   - <LiveProvider>     — wrap App; holds the latest snapshot in React state
//   - usePortfolio()     — merged baseline + live values, same shape as static PORTFOLIO
//   - useSparks()        — { totalMv: number[], ... } growing arrays capped at 120 pts
//   - useLiveAlerts()    — live alerts feed, or null before first tick
//   - useLiveMovers()    — live movers leaderboard, or null before first tick
//   - useLiveConnected() — boolean, for connection-state UI
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PORTFOLIO as BASELINE } from './data.js';

const LiveContext = createContext({ snapshot: null, connected: false });

export function LiveProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource('/api/stream/ticks');
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false); // EventSource retries on its own
    es.onmessage = (e) => {
      try { setSnapshot(JSON.parse(e.data)); } catch {}
    };
    return () => es.close();
  }, []);

  return (
    <LiveContext.Provider value={{ snapshot, connected }}>
      {children}
    </LiveContext.Provider>
  );
}

export function usePortfolio() {
  const { snapshot } = useContext(LiveContext);
  // Baseline fallback ensures fields like trackingErr/asOf/var95Pct (not yet
  // in the live payload) still resolve. Live fields override.
  return snapshot?.values ? { ...BASELINE, ...snapshot.values } : BASELINE;
}

export function useSparks() {
  const { snapshot } = useContext(LiveContext);
  return snapshot?.sparks ?? null;
}

export function useLiveAlerts() {
  const { snapshot } = useContext(LiveContext);
  return snapshot?.alerts ?? null;
}

export function useLiveMovers() {
  const { snapshot } = useContext(LiveContext);
  return snapshot?.movers ?? null;
}

export function useLiveConnected() {
  return useContext(LiveContext).connected;
}
