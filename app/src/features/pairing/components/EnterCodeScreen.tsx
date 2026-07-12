import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Icon, IconButton } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { PairingCodeError } from "../data/pairingRepository";
import { useRedeemInviteCode } from "../hooks/usePairingMutations";
import { isValidCodeFormat, redeemErrorMessage } from "../model/invite";
import type { RedeemErrorReason } from "../model/types";

const CODE_LENGTH = 6;

// コード入力（B-3）。エラーはインライン表示（B-4・F-3）。
export function EnterCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const redeem = useRedeemInviteCode();
  const [code, setCode] = useState("");
  const [errorReason, setErrorReason] = useState<RedeemErrorReason | null>(
    null,
  );

  const handleChange = (value: string) => {
    setCode(value.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
    setErrorReason(null);
  };

  const handleSubmit = () => {
    redeem.mutate(code, {
      onSuccess: () => {
        router.replace("/pairing/success");
      },
      onError: (error) => {
        setErrorReason(
          error instanceof PairingCodeError ? error.reason : "not-found",
        );
      },
    });
  };

  const filled = code.padEnd(CODE_LENGTH, "△");

  return (
    <View
      testID="pairing-code-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="px-6">
        <IconButton
          testID="pairing-code-back-button"
          icon="chevron-left"
          iconSize={16}
          onPress={() => router.back()}
        />
      </View>

      <View className="gap-2.5 px-7 pt-5">
        <Text className="font-zen-black text-[26px] leading-10 text-ink">
          コードを{"\n"}入力しましょう
        </Text>
        <Text className="font-zen-medium text-[13px] leading-6 text-taupe">
          相手からもらった6桁の数字です。
        </Text>
      </View>

      <View className="px-6 pt-7">
        <View
          className={`items-center justify-center rounded-[18px] border-2 bg-paper p-[18px] ${
            errorReason ? "border-rust" : "border-ink"
          }`}
        >
          <Text className="font-zen-black text-[30px] tracking-[7px]">
            <Text className="text-ink">{code}</Text>
            <Text className="text-latte">{filled.slice(code.length)}</Text>
          </Text>
          {/* 入力は文字色を透明にした TextInput が受ける（見た目は上の Text が描く）。
              opacity-0 だと E2E（Maestro）の要素階層から消えてしまうため使わない */}
          <TextInput
            testID="pairing-code-input"
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
            selectionColor="transparent"
            className="absolute inset-0 text-transparent"
          />
        </View>

        {errorReason ? (
          <View className="mt-2.5 flex-row items-center gap-1.5">
            <Icon
              name="alert-circle"
              size={14}
              color={palette.rust}
              accentColor={palette.paper}
            />
            <Text
              testID="pairing-code-error-text"
              className="flex-1 font-zen-bold text-[13px] text-rust"
            >
              {redeemErrorMessage(errorReason)}
            </Text>
          </View>
        ) : null}

        <View className={errorReason ? "mt-4" : "mt-5"}>
          <Button
            testID="pairing-code-submit-button"
            label="つながる"
            onPress={handleSubmit}
            disabled={!isValidCodeFormat(code) || redeem.isPending}
          />
        </View>
      </View>
    </View>
  );
}
