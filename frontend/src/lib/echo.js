import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getEchoOptions = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const isSecure = protocol === 'https';
    
    // Authorization header for private channels
    const token = localStorage.getItem('token');
    
    return {
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'resevit_key',
        wsHost: import.meta.env.VITE_REVERB_HOST || hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT || (isSecure ? 443 : 8080),
        wssPort: import.meta.env.VITE_REVERB_PORT || (isSecure ? 443 : 8080),
        forceTLS: isSecure,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${window.location.protocol}//${hostname}/tenant-api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    };
};

const echo = new Echo(getEchoOptions());

export default echo;
