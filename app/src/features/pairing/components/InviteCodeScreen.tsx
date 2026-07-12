import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip, IconButton } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { useIssueInviteCode } from "../hooks/usePairingMutations";
import { usePairState } from "../hooks/usePairState";
import { formatRemainingLabel } from "../model/invite";

// 招待コード発行（B-2）。未発行なら開いたときに発行する。
export function InviteCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const { data: pairState } = usePairState();
  const issueInviteCode = useIssueInviteCode();

  const inviteCode = pairState?.status === "solo" ? pairState.inviteCode : null;

  useEffect(() => {
    if (
      pairState?.status === "solo" &&
      !pairState.inviteCode &&
      issueInviteCode.isIdle
    ) {
      issueInviteCode.mutate();
    }
  }, [pairState, issueInviteCode]);

  const remainingLabel = inviteCode
    ? formatRemainingLabel(inviteCode.expiresAt, new Date())
    : null;

  return (
    <View
      testID="pairing-invite-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="px-6">
        <IconButton
          testID="pairing-invite-back-button"
          icon="chevron-left"
          iconSize={16}
          onPress={() => router.back()}
        />
      </View>

      <View className="gap-2.5 px-7 pt-5">
        <Text className="font-zen-black text-[26px] leading-10 text-ink">
          招待コードが{"\n"}できました
        </Text>
        <Text className="font-zen-medium text-[13px] leading-6 text-taupe">
          このコードを相手に送りましょう。相手が入力すると、ふたりがつながります。
        </Text>
      </View>

      <View className="mx-6 mt-7 items-center gap-3 rounded-[22px] bg-paper px-5 py-[26px] shadow-card">
        {inviteCode ? (
          <>
            <Text
              testID="pairing-invite-code-text"
              className="font-zen-black text-[38px] tracking-[8px] text-ink"
            >
              {inviteCode.code}
            </Text>
            {remainingLabel ? (
              <Chip icon="clock" tone="blush" label={remainingLabel} />
            ) : null}
          </>
        ) : (
          <ActivityIndicator color={palette.ink} />
        )}
      </View>

      <View className="px-6 pt-4">
        <Button
          testID="pairing-invite-copy-button"
          label="コードをコピーする"
          icon="copy"
          onPress={() => showToast("コードをコピーしました", { icon: "copy" })}
          disabled={!inviteCode}
        />
      </View>
    </View>
  );
}
