import { type ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "./Button";
import { type IconName } from "./Icon";

type DialogAction = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "destructive";
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
};

type DialogProps = {
  visible: boolean;
  title: string;
  /** タイトルの左に添えるアイコン等（F-1b 完了時のチェック丸） */
  titleAccessory?: ReactNode;
  message?: string;
  /** 補足コンテンツ（F-1b の件数ボックス等）をタイトルと本文の間に挟む */
  children?: ReactNode;
  cancelLabel?: string;
  onCancel: () => void;
  confirm: DialogAction;
  cancelTestID?: string;
  testID?: string;
};

// 確認ダイアログ（F-1 系）。中央のカードと薄暗いオーバーレイ。
export function Dialog({
  visible,
  title,
  titleAccessory,
  message,
  children,
  cancelLabel = "やめておく",
  onCancel,
  confirm,
  cancelTestID,
  testID,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* accessible={false} にしないと Pressable が中身をフラット化し、
          ボタンの testID が E2E から見えなくなる */}
      <Pressable
        accessible={false}
        className="flex-1 items-center justify-center bg-ink/35 px-6"
        onPress={onCancel}
      >
        <Pressable
          testID={testID}
          accessible={false}
          className="w-full gap-2 rounded-dialog bg-paper p-6 shadow-dialog"
          onPress={(event) => event.stopPropagation()}
        >
          {titleAccessory ? (
            <View className="flex-row items-center gap-2.5">
              {titleAccessory}
              <Text className="text-[17px] font-bold text-ink">{title}</Text>
            </View>
          ) : (
            <Text className="text-[17px] font-bold text-ink">{title}</Text>
          )}
          {message ? (
            <Text className="text-[13px] font-medium leading-6 text-taupe">
              {message}
            </Text>
          ) : null}
          {children}
          <View className="mt-2.5 flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label={cancelLabel}
                onPress={onCancel}
                variant="outline"
                size="sm"
                testID={cancelTestID}
              />
            </View>
            <View className="flex-1">
              <Button
                label={confirm.label}
                onPress={confirm.onPress}
                variant={confirm.variant ?? "primary"}
                icon={confirm.icon}
                iconSize={15}
                size="sm"
                disabled={confirm.disabled}
                testID={confirm.testID}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
