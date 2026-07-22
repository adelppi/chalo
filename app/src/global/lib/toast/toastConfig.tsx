import { Text, View } from "react-native";
import {
  type ToastConfig,
  type ToastConfigParams,
} from "react-native-toast-message";

import { Icon, type IconName } from "@global/components/ui/Icon";
import { palette } from "@global/constants/palette";
import { type ToastVariant } from "@global/store/useToastStore";

type ToastCustomProps = { icon?: IconName };

// F-2 の角丸ピル・bg-ink/bg-rust デザインを react-native-toast-message の
// custom config で再現する（Issue #62）。既定の枠幅（screen - 48px）に合わせて
// left-6/right-6 相当の余白を持つラッパーでピルを中央寄せする。
function ToastBubble({
  text1,
  props,
  isError,
}: ToastConfigParams<ToastCustomProps> & { isError: boolean }) {
  return (
    <View className="w-full items-center px-6" pointerEvents="box-none">
      <View
        testID="toast"
        className={`flex-row items-center gap-2.5 rounded-full px-5 py-[13px] shadow-toast ${
          isError ? "bg-rust" : "bg-ink"
        }`}
      >
        {props?.icon ? (
          <Icon
            name={props.icon}
            size={17}
            color={isError ? palette.paper : palette.linen}
          />
        ) : null}
        <Text
          className={`text-sm font-semibold ${isError ? "text-paper" : "text-linen"}`}
        >
          {text1}
        </Text>
      </View>
    </View>
  );
}

export const toastConfig = {
  default: (params: ToastConfigParams<ToastCustomProps>) => (
    <ToastBubble {...params} isError={false} />
  ),
  error: (params: ToastConfigParams<ToastCustomProps>) => (
    <ToastBubble {...params} isError={true} />
  ),
} satisfies Record<ToastVariant, ToastConfig[string]>;
