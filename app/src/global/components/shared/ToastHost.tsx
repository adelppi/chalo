import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@global/components/ui/Icon";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

// 画面下部トースト（F-2）。ルートレイアウトに1つだけ置く。
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const insets = useSafeAreaInsets();

  if (!toast) {
    return null;
  }

  const isError = toast.variant === "error";

  return (
    <View
      pointerEvents="none"
      className="absolute left-6 right-6 items-center"
      style={{ bottom: insets.bottom + 96 }}
    >
      <View
        testID="toast"
        className={`flex-row items-center gap-2.5 rounded-full px-5 py-[13px] shadow-toast ${
          isError ? "bg-rust" : "bg-ink"
        }`}
      >
        {toast.icon ? (
          <Icon
            name={toast.icon}
            size={17}
            color={isError ? palette.paper : palette.linen}
          />
        ) : null}
        <Text
          className={`text-sm font-semibold ${isError ? "text-paper" : "text-linen"}`}
        >
          {toast.message}
        </Text>
      </View>
    </View>
  );
}
