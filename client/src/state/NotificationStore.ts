import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid';

export interface Notification { id: string; message: string; type: 'error' | 'info'; }
interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type?: Notification['type']) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type = 'info') => {
    const id = uuidv4();
    set((state) => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    }, 2000);
  },
}));