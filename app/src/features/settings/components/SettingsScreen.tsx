import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDeleteAccount, useSignOut } from "@features/auth";
import { CalendarPermissionRow, DefaultCalendarRow } from "@features/calendar";
import { NotificationPermissionRow } from "@features/notifications";
import { usePairState } from "@features/pairing";
import { usePlans } from "@features/plans";
import { Dialog, Icon } from "@global/components/ui";
import { legalLinks } from "@global/constants/legalLinks";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

import { useProfileSettings } from "../hooks/useProfileSettings";
import {
  useUpdateDisplayName,
  useUpdatePartnerNickname,
} from "../hooks/useProfileMutations";
import { EditProfileFieldDialog } from "./EditProfileFieldDialog";
import { ExportPlansDialog } from "./ExportPlansDialog";
import { SendLogsDialog } from "./SendLogsDialog";

type OpenDialog =
  | "export"
  | "logs"
  | "logout"
  | "delete-account"
  | "edit-name"
  | "edit-nickname"
  | null;

// 設定（E-1。ソロ利用中はペアセクション付きの E-1b）。
export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);

  const { data: profile } = useProfileSettings();
  const { data: pairState } = usePairState();
  const { data: plans } = usePlans();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  const updateDisplayName = useUpdateDisplayName();
  const updatePartnerNickname = useUpdatePartnerNickname();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

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

  // アカウント削除（F-1・adr/0018）。成功時のサインイン画面への遷移は
  // ローカルサインアウト → protected routes が担う。失敗はトースト＋再試行。
  const handleDeleteAccount = () => {
    closeDialog();
    deleteAccount.mutate(undefined, {
      onError: () => {
        showToast(
          "アカウントを削除できませんでした。もういちどためしてください。",
          { variant: "error" },
        );
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
        <Text className="text-[38px] font-bold leading-tight text-ink">
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
            testID="settings-edit-name-button"
            label="あなたの名前"
            value={profile?.displayName}
            chevron
            onPress={() => setOpenDialog("edit-name")}
            showSeparator={!isSolo}
          />
          {!isSolo ? (
            <SettingsRow
              testID="settings-edit-nickname-button"
              label="相手のよびかた"
              value={profile?.partnerNickname ?? partnerName ?? undefined}
              chevron
              onPress={() => setOpenDialog("edit-nickname")}
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
                    <Text className="text-lg font-bold tracking-[2.5px] text-plum">
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

        {/* おしらせ・カレンダー */}
        <SectionLabel label="おしらせ・カレンダー" />
        <View className="overflow-hidden rounded-field bg-paper shadow-card">
          <NotificationPermissionRow />
          <CalendarPermissionRow />
          <DefaultCalendarRow />
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
          <SettingsRow
            testID="settings-terms-button"
            label="利用規約"
            onPress={() => Linking.openURL(legalLinks.terms)}
            showSeparator
          />
          <SettingsRow
            testID="settings-privacy-button"
            label="プライバシーポリシー"
            onPress={() => Linking.openURL(legalLinks.privacy)}
            showSeparator
          />
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

      {/* あなたの名前を編集（E-1） */}
      {openDialog === "edit-name" && profile ? (
        <EditProfileFieldDialog
          visible
          title="名前を変更"
          label="あなたの名前"
          initialValue={profile.displayName}
          isSaving={updateDisplayName.isPending}
          testIDPrefix="settings-edit-name"
          onClose={closeDialog}
          onSave={(value) => {
            updateDisplayName.mutate(value, {
              onSuccess: closeDialog,
              onError: () => {
                showToast(
                  "名前を変更できませんでした。もういちどためしてください。",
                  { variant: "error" },
                );
              },
            });
          }}
        />
      ) : null}

      {/* 相手のよびかたを編集（E-1） */}
      {openDialog === "edit-nickname" ? (
        <EditProfileFieldDialog
          visible
          title="よびかたを変更"
          label="相手のよびかた"
          initialValue={profile?.partnerNickname ?? partnerName ?? ""}
          isSaving={updatePartnerNickname.isPending}
          testIDPrefix="settings-edit-nickname"
          onClose={closeDialog}
          onSave={(value) => {
            updatePartnerNickname.mutate(value, {
              onSuccess: closeDialog,
              onError: () => {
                showToast(
                  "よびかたを変更できませんでした。もういちどためしてください。",
                  { variant: "error" },
                );
              },
            });
          }}
        />
      ) : null}

      {/* F-1b プランを書き出す（開くたびに新しくマウントして状態をリセット） */}
      {openDialog === "export" ? (
        <ExportPlansDialog visible plans={plans ?? []} onClose={closeDialog} />
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

      {/* F-1 アカウント削除（adr/0018） */}
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
          onPress: handleDeleteAccount,
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
