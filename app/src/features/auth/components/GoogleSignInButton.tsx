import { ActivityIndicator, Pressable, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

import { palette } from "@global/constants/palette";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

// Google のサインインボタン（A-2）。白地・焦げ茶の枠線・G ロゴ。
export function GoogleSignInButton({ onPress, disabled, loading }: Props) {
  return (
    <Pressable
      testID="auth-sign-in-google-button"
      onPress={onPress}
      disabled={disabled}
      className="h-[54px] w-full flex-row items-center justify-center gap-2 rounded-button border-[1.5px] border-ink/[0.18] bg-white active:opacity-70"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      {loading ? (
        <ActivityIndicator color={palette.ink} />
      ) : (
        <>
          <GoogleLogo size={18} />
          <Text className="text-[22.1px] font-medium text-cocoa">
            Googleで続ける
          </Text>
        </>
      )}
    </Pressable>
  );
}

// Google の G ロゴ（Claude Design A-2 の SVG をそのまま写す）。
function GoogleLogo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"
      />
      <Path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.3 0 11.6-2.1 15.6-5.8l-7.7-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
      />
    </Svg>
  );
}
