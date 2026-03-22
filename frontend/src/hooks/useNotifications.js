import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import centralApi from '../services/centralApi'

/**
 * useNotifications — polls /api/notifications every 15 seconds.
 * Returns { notifications, unreadCount, markRead, markAllRead, loading }
 */
export function useNotifications(pollInterval = 15000) {
  const isSaaS = window.location.pathname.startsWith('/securegate');
  const activeApi = isSaaS ? centralApi : api;

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await activeApi.get('/notifications')
      setNotifications(res.data?.notifications || [])
      setUnreadCount(res.data?.unread_count || 0)
    } catch (err) {
      // Silently fail – don't break the UI if the endpoint is unavailable
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, pollInterval)
    return () => clearInterval(intervalRef.current)
  }, [fetchNotifications, pollInterval])

  const markAsRead = useCallback(async (id) => {
    try {
      await activeApi.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [activeApi, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await activeApi.post('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [activeApi, fetchNotifications]);

  return { notifications, unreadCount, markRead: markAsRead, markAllRead: markAllAsRead, loading, refresh: fetchNotifications }
}
