import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { BackHeader, Button, Chip } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { useIssueInviteCode } from "../hooks/usePairingMutations";
import { usePairState } from "../hooks/usePairState";
import { formatRemainingLabel } from "../model/invite";

// 招待コード発行（B-2）。未発行なら開いたときに発行する。戻るは画面内の BackHeader。
export function InviteCodeScreen() {
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
    <View testID="pairing-invite-screen" className="flex-1 bg-linen">
      <BackHeader testID="pairing-invite-back-button" />
      <View className="gap-2.5 px-7 pt-5">
        <Text className="text-[26px] font-black leading-10 text-ink">
          招待コードが{"\n"}できました
        </Text>
        <Text className="text-[13px] font-medium leading-6 text-taupe">
          このコードを相手に送りましょう。相手が入力すると、ふたりがつながります。
        </Text>
      </View>

      <View className="mx-6 mt-7 items-center gap-3 rounded-hero bg-paper px-5 py-[26px] shadow-card">
        {inviteCode ? (
          <>
            <Text
              testID="pairing-invite-code-text"
              className="text-[38px] font-black tracking-[8px] text-ink"
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
