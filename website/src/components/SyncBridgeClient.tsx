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

const safeSetItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage set failed for key "${key}":`, e);
  }
};

export default function SyncBridgeClient() {
  useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PESHAS_SYNC_DATA') {
        const { products, categories, settings } = event.data;
        
        let changed = false;
        if (products && safeGetItem('admin_products') !== products) {
          safeSetItem('admin_products', products);
          changed = true;
        }
        if (categories && safeGetItem('admin_categories') !== categories) {
          safeSetItem('admin_categories', categories);
          changed = true;
        }
        if (settings && safeGetItem('peshas_cms_settings') !== settings) {
          safeSetItem('peshas_cms_settings', settings);
          changed = true;
        }

        if (changed) {
          // Soft refresh the active page views to display the synced updates
          window.location.reload();
        }
      }
    };

    window.addEventListener('message', handleSyncMessage);

    const interval = setInterval(() => {
      const iframe = document.getElementById('sync-bridge-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('GET_SYNC_DATA', '*');
      }
    }, 2500);

    return () => {
      window.removeEventListener('message', handleSyncMessage);
      clearInterval(interval);
    };
  }, []);

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

  return (
    <iframe
      id="sync-bridge-iframe"
      src={`${adminUrl}/sync-bridge`}
      style={{ display: 'none', width: '0px', height: '0px' }}
      title="Local Storage Sync Bridge"
    />
  );
}
