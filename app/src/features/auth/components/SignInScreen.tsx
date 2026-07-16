import { useCallback } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChaloFace } from "@global/components/shared";
import { legalLinks } from "@global/constants/legalLinks";

import { useSignInWithApple } from "../hooks/useSignInWithApple";
import { useSignInWithGoogle } from "../hooks/useSignInWithGoogle";
import { AppleSignInButton } from "./AppleSignInButton";
import { GoogleSignInButton } from "./GoogleSignInButton";

// サインイン画面（A-2。domain/onboarding.md）。
// Google / Apple サインインのみを提供する（Apple が上。App Store 審査要件）。
export function SignInScreen() {
  const insets = useSafeAreaInsets();
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
    <View testID="auth-sign-in-screen" className="flex-1 bg-linen">
      <View className="flex-1 items-center justify-center px-8">
        <ChaloFace width={128} />
        <Text className="mt-5 text-center text-[30px] font-bold leading-[45px] text-ink">
          はじめまして{"\n"}
          <Text style={{ fontFamily: "Menlo" }} className="font-normal">
            chalo
          </Text>{" "}
          です
        </Text>
        <Text className="mt-3.5 text-center text-sm font-medium text-taupe">
          やりたいことを共有しよう！
        </Text>
      </View>

      <View
        className="gap-3.5 px-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <AppleSignInButton
          onPress={() => {
            if (busy) {
              return;
            }
            apple.mutate(undefined, { onError });
          }}
        />
        <GoogleSignInButton
          loading={google.isPending}
          disabled={busy}
          onPress={() => google.mutate(undefined, { onError })}
        />
        <Text className="text-center text-[11px] leading-5 text-stone">
          はじめると、
          <Text
            testID="sign-in-terms-link"
            className="font-medium text-plum"
            suppressHighlighting
            onPress={() => Linking.openURL(legalLinks.terms)}
          >
            利用規約
          </Text>
          と
          <Text
            testID="sign-in-privacy-link"
            className="font-medium text-plum"
            suppressHighlighting
            onPress={() => Linking.openURL(legalLinks.privacy)}
          >
            プライバシーポリシー
          </Text>
          に{"\n"}同意したことになります。
        </Text>
      </View>
    </View>
  );
}
