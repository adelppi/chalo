import { create } from "zustand";

import { type IconName } from "@global/components/ui/Icon";

export type ToastVariant = "default" | "error";

type Toast = {
  message: string;
  icon?: IconName;
  variant: ToastVariant;
};

type ToastState = {
  toast: Toast | null;
  show: (
    message: string,
    options?: { icon?: IconName; variant?: ToastVariant },
  ) => void;
  hide: () => void;
};

const TOAST_DURATION_MS = 2500;

let hideTimer: ReturnType<typeof setTimeout> | null = null;

// 画面下部トースト（F-2）のクライアント状態。表示は ToastHost が担う。
export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, options) => {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }
    set({
      toast: {
        message,
        icon: options?.icon,
        variant: options?.variant ?? "default",
      },
    });
    hideTimer = setTimeout(() => {
      set({ toast: null });
      hideTimer = null;
    }, TOAST_DURATION_MS);
  },
  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ toast: null });
  },
}));
