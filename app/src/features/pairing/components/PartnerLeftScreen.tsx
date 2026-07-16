import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDeleteAccount } from "@features/auth";
import { usePlans } from "@features/plans";
import { ExportPlansDialog } from "@features/settings";
import { Button, Dialog } from "@global/components/ui";
import { useToastStore } from "@global/store/useToastStore";

type OpenDialog = "export" | "delete" | null;

// パートナー消失後の全画面ロック（domain/pairing.md「残った側（B）の状態」）。
// できるのは「全プランの書き出し」と「アカウント削除」の2つだけ。
// 通常のナビゲーションは (app)/_layout の Stack.Protected がブロックする。
export function PartnerLeftScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((state) => state.show);

  // 共有プランは残っており、pair 境界 RLS で引き続き読める（adr/0009）。
  const { data: plans } = usePlans();
  const deleteAccount = useDeleteAccount();

  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const closeDialog = () => setOpenDialog(null);

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
      testID="partner-left-screen"
      className="flex-1 bg-linen px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      {/* 文面は domain/pairing.md「ロック画面の文面」どおり。事実を簡潔に伝え、飾らない */}
      <View className="flex-1 items-center justify-center gap-3.5">
        <Text className="text-center text-[22px] font-bold leading-snug text-ink">
          パートナーがアカウントを削除しました
        </Text>
        <Text className="text-center text-[14px] font-medium leading-6 text-taupe">
          ふたりのプランの閲覧・編集はできなくなりました。{"\n"}
          プランはテキストファイルに書き出して残せます。
        </Text>
      </View>

      <View className="gap-2.5">
        <Button
          label="プランを書き出す"
          onPress={() => setOpenDialog("export")}
          testID="partner-left-export-button"
        />
        <Button
          label="アカウントを削除する"
          variant="outline"
          onPress={() => setOpenDialog("delete")}
          testID="partner-left-delete-button"
        />
      </View>

      {/* 書き出しは設定の常設バックアップと同一実装（F-1b） */}
      {openDialog === "export" ? (
        <ExportPlansDialog visible plans={plans ?? []} onClose={closeDialog} />
      ) : null}

      <Dialog
        visible={openDialog === "delete"}
        title="アカウントを削除しますか？"
        message="あなたのデータと、残っていたふたりのプランがすべて削除されます。この操作はもとに戻せません。"
        onCancel={closeDialog}
        cancelTestID="partner-left-delete-cancel-button"
        confirm={{
          label: "削除する",
          variant: "destructive",
          onPress: handleDeleteAccount,
          testID: "partner-left-delete-confirm-button",
        }}
      />
    </View>
  );
}
