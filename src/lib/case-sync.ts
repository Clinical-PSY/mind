// Cross-tab sync for MindLink case updates using BroadcastChannel
// When any module saves data, it notifies other open module tabs via this channel

const CHANNEL = 'mindlink-case-sync';

export function notifyUpdate(caseId: string) {
  if (typeof window === 'undefined') return;
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ caseId, ts: Date.now() });
    bc.close();
  } catch { /* ignore if BroadcastChannel unavailable */ }
}

export function listenForUpdates(caseId: string, onUpdate: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (e) => { if (e.data?.caseId === caseId) onUpdate(); };
    return () => bc.close();
  } catch {
    return () => {};
  }
}
