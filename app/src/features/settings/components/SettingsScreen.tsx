import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSignOut } from "@features/auth";
import { usePairState } from "@features/pairing";
import { countPlanStatuses, usePlans } from "@features/plans";
import { Dialog, Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { useProfileSettings } from "../hooks/useProfileSettings";
import { ExportPlansDialog } from "./ExportPlansDialog";
import { SendLogsDialog } from "./SendLogsDialog";

type OpenDialog = "export" | "logs" | "logout" | "delete-account" | null;

// 設定（E-1。ソロ利用中はペアセクション付きの E-1b）。
export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);

  const { data: profile } = useProfileSettings();
  const { data: pairState } = usePairState();
  const { data: plans } = usePlans();
  const signOut = useSignOut();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  const counts = useMemo(
    () => countPlanStatuses(plans ?? [], new Date()),
    [plans],
  );

  const isSolo = pairState?.status === "solo";
  const inviteCode = pairState?.status === "solo" ? pairState.inviteCode : null;
  const partnerName =
    pairState?.status === "paired" ? pairState.partnerName : null;
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const closeDialog = () => setOpenDialog(null);

  const handleSignOut = () => {
    closeDialog();
    signOut.mutate(undefined, {
      onError: () => {
        showToast("ログアウトできませんでした。もういちどためしてください。", {
          variant: "error",
        });
      },
    });
  };

  return (
    <View
      testID="settings-screen"
      className="flex-1 bg-linen"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="px-6 pb-2">
        <Text className="text-[28px] font-black leading-tight text-ink">
          設定
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-1.5 pb-8 pt-0.5"
        showsVerticalScrollIndicator={false}
      >
        {/* プロフィール */}
        <View className="overflow-hidden rounded-field bg-paper shadow-card">
          <SettingsRow
            label="あなたの名前"
            value={profile?.displayName}
            showSeparator={!isSolo}
          />
          {!isSolo ? (
            <SettingsRow
              label="相手のよびかた"
              value={profile?.partnerNickname ?? partnerName ?? undefined}
              showSeparator={false}
            />
          ) : null}
        </View>

        {/* ペア（ソロ利用中のみ。E-1b） */}
        {isSolo ? (
          <>
            <SectionLabel label="ペア" />
            <View className="overflow-hidden rounded-field bg-paper shadow-card">
              <Pressable
                testID="settings-invite-code-button"
                onPress={() => router.push("/pairing/invite")}
                className="gap-1 border-b border-sand px-[18px] py-4 active:opacity-70"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-[17px] font-medium text-ink">
                    招待コードを発行
                  </Text>
                  {inviteCode ? (
                    <Text className="text-lg font-black tracking-[2.5px] text-plum">
                      {inviteCode.code}
                    </Text>
                  ) : (
                    <Icon
                      name="chevron-right"
                      size={13}
                      color={palette.latte}
                    />
                  )}
                </View>
                <Text className="text-[12.5px] font-medium text-stone">
                  24時間有効・再発行すると前のコードは使えなくなります
                </Text>
              </Pressable>
              <SettingsRow
                testID="settings-enter-code-button"
                label="相手のコードを入力"
                chevron
                onPress={() => router.push("/pairing/code")}
                showSeparator
              />
              <SettingsRow
                testID="settings-pairing-button"
                label="ペア設定をひらく"
                chevron
                onPress={() => router.push("/pairing")}
                showSeparator={false}
              />
            </View>
          </>
        ) : null}

        {/* おしらせ・カレンダー（モック段階は表示のみ） */}
        <SectionLabel label="おしらせ・カレンダー" />
        <View className="overflow-hidden rounded-field bg-paper shadow-card">
          <PermissionRow label="通知" />
          <PermissionRow label="カレンダー" />
          <SettingsRow
            label="既定カレンダーをえらぶ"
            value="ふたりの予定"
            chevron
            showSeparator={false}
          />
        </View>

        {/* そのほか */}
        <SectionLabel label="そのほか" />
        <View className="overflow-hidden rounded-field bg-paper shadow-card">
          <SettingsRow
            testID="settings-export-button"
            label="プランを書き出す"
            chevron
            onPress={() => setOpenDialog("export")}
            showSeparator
          />
          <SettingsRow label="利用規約" showSeparator />
          <SettingsRow label="プライバシーポリシー" showSeparator />
          <SettingsRow
            testID="settings-send-logs-button"
            label="ログを送信"
            onPress={() => setOpenDialog("logs")}
            showSeparator
          />
          <SettingsRow
            testID="settings-sign-out-button"
            label="ログアウト"
            onPress={() => setOpenDialog("logout")}
            showSeparator
          />
          <SettingsRow
            testID="settings-delete-account-button"
            label="アカウントを削除する"
            destructive
            onPress={() => setOpenDialog("delete-account")}
            showSeparator={false}
          />
        </View>

        <Text className="py-2.5 text-center text-xs font-medium text-latte">
          chalo バージョン {appVersion}
        </Text>
      </ScrollView>

      {/* F-1b プランを書き出す（開くたびに新しくマウントして状態をリセット） */}
      {openDialog === "export" ? (
        <ExportPlansDialog visible counts={counts} onClose={closeDialog} />
      ) : null}

      {/* F-1c ログを送信（同上） */}
      {openDialog === "logs" ? (
        <SendLogsDialog visible onClose={closeDialog} />
      ) : null}

      {/* F-1 ログアウト */}
      <Dialog
        visible={openDialog === "logout"}
        title="ログアウトしますか？"
        message="データは残ります。もういちどログインすると、続きから使えます。"
        onCancel={closeDialog}
        cancelTestID="settings-sign-out-cancel-button"
        confirm={{
          label: "ログアウト",
          onPress: handleSignOut,
          testID: "settings-sign-out-confirm-button",
        }}
      />

      {/* F-1 アカウント削除（モック段階のため実際の削除は行わない） */}
      <Dialog
        visible={openDialog === "delete-account"}
        title="アカウントを削除しますか？"
        message={
          partnerName
            ? `あなたのデータが削除され、ペアも解除されます。ふたりのプランは ${partnerName} が書き出して残せます。この操作はもとに戻せません。`
            : "あなたのデータが削除されます。この操作はもとに戻せません。"
        }
        onCancel={closeDialog}
        cancelTestID="settings-delete-account-cancel-button"
        confirm={{
          label: "削除する",
          variant: "destructive",
          onPress: closeDialog,
          testID: "settings-delete-account-confirm-button",
        }}
      />
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="px-2 pb-0.5 pt-2.5 text-xs font-bold tracking-[1.2px] text-stone">
      {label}
    </Text>
  );
}

type SettingsRowProps = {
  label: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  showSeparator: boolean;
  testID?: string;
};

function SettingsRow({
  label,
  value,
  chevron = false,
  destructive = false,
  onPress,
  showSeparator,
  testID,
}: SettingsRowProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center justify-between gap-2.5 px-[18px] py-4 ${
        onPress ? "active:opacity-70" : ""
      } ${showSeparator ? "border-b border-sand" : ""}`}
    >
      <Text
        className={`text-[17px] font-medium ${destructive ? "text-rust" : "text-ink"}`}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {value ? (
          <Text className="text-base font-semibold text-stone">{value}</Text>
        ) : null}
        {chevron ? (
          <Icon name="chevron-right" size={13} color={palette.latte} />
        ) : null}
      </View>
    </Pressable>
  );
}

// 通知・カレンダーの許可行（E-1）。モック段階は「許可する」ピルの表示のみ。
function PermissionRow({ label }: { label: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-sand px-[18px] py-3.5">
      <Text className="text-[17px] font-medium text-ink">{label}</Text>
      <View className="rounded-full bg-plum px-[15px] py-[7px]">
        <Text className="text-[13px] font-semibold text-blush">許可する</Text>
      </View>
    </View>
  );
}
