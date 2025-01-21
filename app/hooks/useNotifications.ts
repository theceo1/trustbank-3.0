"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';

export function useNotifications() {
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      requestNotificationPermission().then(granted => {
        if (granted) {
          new Notification(title, options);
        }
      });
    }
  };

  useEffect(() => {
    // Request permission when the hook is first used
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }, []);

  return {
    showNotification,
    requestPermission: requestNotificationPermission,
  };
} 