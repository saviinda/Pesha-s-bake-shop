'use client';

import { useEffect } from 'react';

// Safe localStorage access for Vercel serverless environment
const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage access failed for key "${key}":`, e);
    return null;
  }
};

export default function SyncBridge() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'GET_SYNC_DATA') {
        const products = safeGetItem('admin_products');
        const categories = safeGetItem('admin_categories');
        const settings = safeGetItem('peshas_cms_settings');

        (event.source as any)?.postMessage({
          type: 'PESHAS_SYNC_DATA',
          products,
          categories,
          settings
        }, '*');
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Broadcast initial data on render
    if (typeof window !== 'undefined' && window.parent) {
      const products = safeGetItem('admin_products');
      const categories = safeGetItem('admin_categories');
      const settings = safeGetItem('peshas_cms_settings');
      window.parent.postMessage({
        type: 'PESHAS_SYNC_DATA',
        products,
        categories,
        settings
      }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ padding: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#999' }}>
      Pesha's Local Storage Sync Bridge Active
    </div>
  );
}
