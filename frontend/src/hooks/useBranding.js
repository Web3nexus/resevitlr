import { useState, useEffect } from 'react';
import api from '../services/centralApi';

export function useBranding() {
  const [settings, setSettings] = useState({
    platform_name: localStorage.getItem('platform_name') || 'Resevit',
    platform_logo_url: '',
    platform_favicon_url: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('public/branding');
        const data = res.data;
        setSettings({
          platform_name: data.platform_name || 'Resevit',
          platform_logo_url: data.platform_logo_url || '',
          platform_favicon_url: data.platform_favicon_url || ''
        });

        // Update localStorage for immediate use elsewhere
        if (data.platform_name) {
          localStorage.setItem('platform_name', data.platform_name);
        }

        // Update Favicon
        if (data.platform_favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.platform_favicon_url;
        }

        // Update Title if it's the landing page
        if (window.location.pathname === '/' && data.platform_name) {
             document.title = data.platform_name;
        }
      } catch (err) {
        console.error("Failed to fetch branding settings", err);
      }
    };

    fetchSettings();
  }, []);

  return settings;
}
