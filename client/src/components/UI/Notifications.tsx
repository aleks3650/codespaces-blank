import { useNotificationStore } from '../../state/NotificationStore';

export const Notifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  return (
    <div className="notifications-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type}`}>{n.message}</div>
      ))}
    </div>
  );
};