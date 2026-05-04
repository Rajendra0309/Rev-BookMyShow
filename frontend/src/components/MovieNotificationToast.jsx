import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/authService';
import { getNotifications, markAsRead } from '../services/reportService';

const POLL_INTERVAL_MS = 15000;
const DISPLAY_DURATION_MS = 5000;

export default function MovieNotificationToast() {
  const navigate = useNavigate();
  const user = getUser();
  const isCustomer = user?.role === 'Customer';

  const [activeNotification, setActiveNotification] = useState(null);
  const shownIdsRef = useRef(new Set());
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!isCustomer || !user?.id) {
      return undefined;
    }

    const handleNextNotification = async () => {
      try {
        const res = await getNotifications(user.id);
        const unread = (res.data?.data || []).filter((n) => n.status === 'Unread');

        if (activeNotification) {
          const stillUnread = unread.some((n) => n._id === activeNotification._id);
          if (!stillUnread) {
            setActiveNotification(null);
          }
          return;
        }

        const next = unread.find((n) => !shownIdsRef.current.has(n._id));
        if (!next) {
          return;
        }

        shownIdsRef.current.add(next._id);
        setActiveNotification(next);
      } catch {
        // Silent polling failure to avoid interrupting user flow.
      }
    };

    handleNextNotification();
    const intervalId = setInterval(handleNextNotification, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeNotification, isCustomer, user?.id]);

  useEffect(() => {
    if (!activeNotification) {
      return undefined;
    }

    hideTimerRef.current = setTimeout(async () => {
      setActiveNotification(null);
      try {
        await markAsRead(activeNotification._id);
      } catch {
        // Keep UI non-blocking if mark-read fails.
      }
    }, DISPLAY_DURATION_MS);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [activeNotification]);

  const handleNotificationClick = async () => {
    if (!activeNotification) {
      return;
    }

    try {
      await markAsRead(activeNotification._id);
    } catch {
      // Continue navigation even if read update fails.
    }

    const movieId = activeNotification.movieId?._id || activeNotification.movieId;
    setActiveNotification(null);

    if (movieId) {
      navigate(`/movies/${movieId}`);
    } else {
      navigate('/movies');
    }
  };

  if (!isCustomer || !activeNotification) {
    return null;
  }

  return (
    <div
      className="rbms-notification-toast"
      role="status"
      aria-live="polite"
      onClick={handleNotificationClick}
      title="Open movie"
    >
      <div className="rbms-notification-toast__title">New Update</div>
      <div className="rbms-notification-toast__message">{activeNotification.message}</div>
    </div>
  );
}
