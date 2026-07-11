'use client';

import { useEffect } from 'react';

export default function SyncBridge() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'GET_SYNC_DATA') {
        const products = localStorage.getItem('admin_products');
        const categories = localStorage.getItem('admin_categories');
        const settings = localStorage.getItem('peshas_cms_settings');

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
      const products = localStorage.getItem('admin_products');
      const categories = localStorage.getItem('admin_categories');
      const settings = localStorage.getItem('peshas_cms_settings');
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
