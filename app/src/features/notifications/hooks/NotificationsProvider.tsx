import { createContext, type ReactNode, useContext, useMemo } from "react";

import type {
  DeviceNotificationRepository,
  NotificationStorageRepository,
} from "../data/notificationRepository";

type NotificationsContextValue = {
  deviceNotificationRepository: DeviceNotificationRepository;
  notificationStorageRepository: NotificationStorageRepository;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

// Repository を注入で受け取る合成ルート（adr/0003）。
export function NotificationsProvider({
  deviceNotificationRepository,
  notificationStorageRepository,
  children,
}: NotificationsContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ deviceNotificationRepository, notificationStorageRepository }),
    [deviceNotificationRepository, notificationStorageRepository],
  );
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotificationsContext は NotificationsProvider の内側で使ってください。",
    );
  }
  return context;
}
