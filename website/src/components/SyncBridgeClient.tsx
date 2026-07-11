'use client';

import { useEffect } from 'react';

export default function SyncBridgeClient() {
  useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PESHAS_SYNC_DATA') {
        const { products, categories, settings } = event.data;
        
        let changed = false;
        if (products && localStorage.getItem('admin_products') !== products) {
          localStorage.setItem('admin_products', products);
          changed = true;
        }
        if (categories && localStorage.getItem('admin_categories') !== categories) {
          localStorage.setItem('admin_categories', categories);
          changed = true;
        }
        if (settings && localStorage.getItem('peshas_cms_settings') !== settings) {
          localStorage.setItem('peshas_cms_settings', settings);
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

  return (
    <iframe
      id="sync-bridge-iframe"
      src="http://localhost:3001/sync-bridge"
      style={{ display: 'none', width: '0px', height: '0px' }}
      title="Local Storage Sync Bridge"
    />
  );
}
