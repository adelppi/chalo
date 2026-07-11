import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";

type Props = {
  onPress: () => void;
};

// Apple 純正のサインインボタン（App Store 審査要件）。
// iOS 13+ では常に利用可能だが、非対応環境では何も出さない。
export function AppleSignInButton({ onPress }: Props) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    AppleAuthentication.isAvailableAsync()
      .then((value) => {
        if (active) {
          setAvailable(value);
        }
      })
      .catch(() => {
        if (active) {
          setAvailable(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!available) {
    return null;
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      testID="auth-sign-in-apple-button"
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={12}
      style={{ width: "100%", height: 48 }}
      onPress={onPress}
    />
  );
}
