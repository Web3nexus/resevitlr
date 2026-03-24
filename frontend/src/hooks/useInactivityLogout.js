import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STANDARD_TIMEOUT = 60 * 60 * 1000; // 60 minutes (1 hour)
const POS_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours

export const useInactivityLogout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const timerRef = useRef(null);

    const isPOS = location.pathname.includes('/pos');

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        const timeout = isPOS ? POS_TIMEOUT : STANDARD_TIMEOUT;
        
        timerRef.current = setTimeout(() => {
            console.log(`User inactive for ${timeout}ms, logging out...`);
            logout();
        }, timeout);
    };

    useEffect(() => {
        if (!user) return;

        // Activity events to track
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Set initial timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user, location.pathname]); // Re-run if user changes or path changes (to toggle isPOS)

    return null;
};
