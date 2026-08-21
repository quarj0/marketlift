import { NotificationsClient } from '@/components/notifications/notifications-client';

// Notifications are personalized session data, so this route may block while
// the authenticated state is resolved instead of claiming an instant shell.
export const instant = false;

export default function NotificationsPage() {
  return <NotificationsClient />;
}
