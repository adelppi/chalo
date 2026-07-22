import { create } from "zustand";
import Toast from "react-native-toast-message";

import { type IconName } from "@global/components/ui/Icon";

export type ToastVariant = "default" | "error";

type ToastState = {
  show: (
    message: string,
    options?: { icon?: IconName; variant?: ToastVariant },
  ) => void;
  hide: () => void;
};

const TOAST_DURATION_MS = 2500;

// 画面下部トースト（F-2）の呼び出しファサード。表示は react-native-toast-message
// （ルートにマウントした <Toast />）が担う。呼び出し側の show(message, options) の
// シグネチャは自作実装からの置き換え前後で変えない（Issue #62）。
export const useToastStore = create<ToastState>(() => ({
  show: (message, options) => {
    Toast.show({
      type: options?.variant ?? "default",
      text1: message,
      props: { icon: options?.icon },
      visibilityTime: TOAST_DURATION_MS,
    });
  },
  hide: () => {
    Toast.hide();
  },
}));
