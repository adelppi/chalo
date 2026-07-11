import { useCallback } from "react";
import { Alert, Text, View } from "react-native";

import { useSignInWithApple } from "../hooks/useSignInWithApple";
import { useSignInWithGoogle } from "../hooks/useSignInWithGoogle";
import { AppleSignInButton } from "./AppleSignInButton";
import { GoogleSignInButton } from "./GoogleSignInButton";

// サインイン画面（オンボーディング A2。domain/onboarding.md）。
// Google / Apple サインインのみを提供する。
export function SignInScreen() {
  const google = useSignInWithGoogle();
  const apple = useSignInWithApple();
  const busy = google.isPending || apple.isPending;

  const onError = useCallback((error: unknown) => {
    console.error("サインインに失敗しました", error);
    Alert.alert(
      "サインインに失敗しました",
      "時間をおいて、もう一度お試しください。",
    );
  }, []);

  return (
    <View
      testID="auth-sign-in-screen"
      className="flex-1 items-center justify-center bg-white px-8"
    >
      <View className="mb-16 items-center">
        <Text className="text-3xl font-bold text-neutral-900">chalo</Text>
        <Text className="mt-3 text-center text-base text-neutral-500">
          ふたりで「いつか行きたい」を貯めよう
        </Text>
      </View>

      <View className="w-full gap-3">
        <GoogleSignInButton
          loading={google.isPending}
          disabled={busy}
          onPress={() => google.mutate(undefined, { onError })}
        />
        <AppleSignInButton
          onPress={() => {
            if (busy) {
              return;
            }
            apple.mutate(undefined, { onError });
          }}
        />
      </View>
    </View>
  );
}
