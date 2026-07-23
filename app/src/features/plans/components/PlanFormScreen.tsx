import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  calendarEventFieldsChanged,
  useSyncPlanToCalendar,
} from "@features/calendar";
import {
  deadlineNotificationFieldsChanged,
  useSyncDeadlineNotification,
} from "@features/notifications";
import { Button, Icon, type IconName } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";
import { backHeaderOptions } from "@global/utils/headerItems";

import { usePlansContext } from "../hooks/PlansProvider";
import { usePlan } from "../hooks/usePlan";
import { useCreatePlan, useUpdatePlan } from "../hooks/usePlanMutations";
import { formatDateShort } from "../model/format";
import type { Plan, PlanDraft } from "../model/types";
import { PlanDatePickerSheet } from "./PlanDatePickerSheet";
import { PlanTextFieldSheet } from "./PlanTextFieldSheet";

type PlanFormScreenProps = { mode: "create" } | { mode: "edit"; id: string };

// プランをつくる（C-3）／プランを編集（D-2）。フル画面・同型のフォーム。
// 「場所」の項目は v1 スコープ外のため置かない（デザイン側の決定）。
export function PlanFormScreen(props: PlanFormScreenProps) {
  if (props.mode === "edit") {
    return <EditLoader id={props.id} />;
  }
  return <PlanForm mode="create" />;
}

function EditLoader({ id }: { id: string }) {
  const { data: plan, isPending } = usePlan(id);
  const { planRepository } = usePlansContext();

  // 編集画面に入る前にロックを立てている（useStartEditing）ため、
  // 保存・キャンセル（戻る／スワイプ）のどの経路でも、編集終了＝アンマウントで解除する。
  // 解除に失敗しても TTL（5分）の自動失効に委ねる（adr/0005）
  useEffect(() => {
    return () => {
      planRepository.releaseLock(id).catch(() => {});
    };
  }, [planRepository, id]);

  if (isPending || !plan) {
    return (
      <View className="flex-1 items-center justify-center bg-linen">
        <ActivityIndicator color={palette.ink} />
      </View>
    );
  }
  return <PlanForm mode="edit" plan={plan} />;
}

type SheetName = "date" | "deadline" | "url" | "memo";
type OpenSheet = SheetName | null;

function PlanForm({ mode, plan }: { mode: "create" | "edit"; plan?: Plan }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan(plan?.id ?? "");
  const syncCalendar = useSyncPlanToCalendar();
  const syncDeadlineNotification = useSyncDeadlineNotification();

  const [title, setTitle] = useState(plan?.title ?? "");
  const [titleFocused, setTitleFocused] = useState(false);
  const [date, setDate] = useState<string | null>(plan?.date ?? null);
  const [time, setTime] = useState<string | null>(plan?.time ?? null);
  const [deadline, setDeadline] = useState<string | null>(
    plan?.deadline ?? null,
  );
  const [referenceUrl, setReferenceUrl] = useState<string | null>(
    plan?.referenceUrl ?? null,
  );
  const [memo, setMemo] = useState<string | null>(plan?.memo ?? null);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  // いまマウントしているシート。閉じても外さない：ネイティブのシートは表示中に
  // アンマウントすると画面に残ってしまう（adr/0022）。session は「開くたびに中身を
  // 作り直す」ための key で、開くたびに増やす。
  const [mountedSheet, setMountedSheet] = useState<{
    name: SheetName;
    session: number;
  } | null>(null);

  // シートの中の入力欄で出たキーボードでは、うしろのフォームを持ち上げない。どうせシートに
  // 隠れる位置なのに、開いた瞬間だけ「保存する」がせり上がるのが見えて不格好なため。
  // 戻すのはキーボードが消えきってから：出ているうちに戻すと、抑えていた余白が一気に入って跳ねる。
  const [avoidsKeyboard, setAvoidsKeyboard] = useState(true);

  useEffect(() => {
    if (openSheet !== null) {
      return;
    }
    const subscription = Keyboard.addListener("keyboardDidHide", () =>
      setAvoidsKeyboard(true),
    );
    return () => subscription.remove();
  }, [openSheet]);

  const openSheetNamed = (name: SheetName) => {
    setMountedSheet((prev) => ({ name, session: (prev?.session ?? 0) + 1 }));
    setOpenSheet(name);
    setAvoidsKeyboard(false);
  };

  const closeSheet = () => {
    setOpenSheet(null);
    // 日時・期限シートのようにキーボードを出さないシートは、待たずにそのまま戻す。
    if (!Keyboard.isVisible()) {
      setAvoidsKeyboard(true);
    }
  };

  const screenName = mode === "create" ? "plan-create" : "plan-edit";
  const isSaving = createPlan.isPending || updatePlan.isPending;
  const canSubmit = title.trim().length > 0 && !isSaving;
  // 日付が入っているあいだ、期限は選べない（期限は日付なしプランの通知専用。Issue #58・
  // docs/domain/plan-lifecycle.md）。
  const deadlineLocked = date !== null;

  const buildDraft = (): PlanDraft => ({
    title: title.trim(),
    date,
    time: date ? time : null,
    deadline: deadlineLocked ? null : deadline,
    referenceUrl,
    memo,
  });

  const handleSubmit = () => {
    const onError = () => {
      showToast("保存できませんでした。操作をやりなおしてください。", {
        variant: "error",
      });
    };
    if (mode === "create") {
      createPlan.mutate(buildDraft(), {
        onSuccess: (created) => {
          // 期限があれば「2週間前の朝9:00」のローカル通知を予約する
          // （domain/notifications.md。予約失敗は静かに記録され、致命としない）。
          syncDeadlineNotification.mutate(created);
          router.back();
          showToast(`「${created.title}」を作成しました`, {
            icon: "check-circle",
          });
        },
        onError,
      });
    } else {
      updatePlan.mutate(buildDraft(), {
        onSuccess: async (updated) => {
          // 期限変更＝再予約／期限削除・日付が入った＝予約削除の組み直し
          // （domain/notifications.md）。失敗は静かに記録されるため待たない。
          if (plan && deadlineNotificationFieldsChanged(plan, updated)) {
            syncDeadlineNotification.mutate(updated);
          }
          // 連携済みプランはイベントを自動更新する（置いてけぼり防止。domain/calendar.md）。
          // イベントに影響する項目が変わった時だけ端末カレンダーを触る。
          // 画面を離れる前に await し、失敗トーストを取りこぼさない。
          if (plan && calendarEventFieldsChanged(plan, updated)) {
            try {
              await syncCalendar.mutateAsync(updated);
            } catch {
              router.back();
              showToast(
                "カレンダーの予定を更新できませんでした。もういちど保存してください。",
                { variant: "error" },
              );
              return;
            }
          }
          router.back();
          showToast("保存しました", { icon: "check-circle" });
        },
        onError,
      });
    }
  };

  return (
    // C-3/D-2：戻るで閉じるプッシュ遷移のフル画面。
    // 作成する/保存する は画面下部に固定し、キーボードが出たらその上に逃がす。
    <KeyboardAvoidingView
      testID={`${screenName}-screen`}
      className="flex-1 bg-linen"
      behavior="padding"
      enabled={avoidsKeyboard}
      keyboardVerticalOffset={insets.top + 8}
    >
      <Stack.Screen
        options={backHeaderOptions({ onBack: () => router.back() })}
      />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-6 pt-2.5">
          <Text className="text-[28px] font-bold text-ink">
            {mode === "create" ? "あたらしいプラン" : "プランを編集"}
          </Text>
        </View>

        <View
          className={`mx-6 mt-3.5 rounded-field border-2 bg-paper px-4 py-3.5 ${
            titleFocused ? "border-ink" : "border-ink/15"
          }`}
        >
          <TextInput
            testID={`${screenName}-title-input`}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            placeholder="タイトル"
            placeholderTextColor={palette.latte}
            className="p-0 text-[17px] font-medium text-ink"
            selectionColor={palette.plum}
          />
        </View>

        <View className="mx-6 mt-3 overflow-hidden rounded-field bg-paper shadow-card">
          <FormFieldRow
            testID={`${screenName}-date-row`}
            icon="calendar"
            label="日時"
            value={date ? formatDateShort(date, time) : null}
            onPress={() => openSheetNamed("date")}
            showSeparator
          />
          <FormFieldRow
            testID={`${screenName}-deadline-row`}
            icon="clock"
            label="期限"
            value={
              !deadlineLocked && deadline ? formatDateShort(deadline) : null
            }
            onPress={() => openSheetNamed("deadline")}
            showSeparator
            disabled={deadlineLocked}
          />
          <FormFieldRow
            testID={`${screenName}-url-row`}
            icon="link"
            label="参考URL"
            value={referenceUrl?.replace(/^https?:\/\//, "") ?? null}
            onPress={() => openSheetNamed("url")}
            showSeparator
          />
          <FormFieldRow
            testID={`${screenName}-memo-row`}
            icon="note"
            label="メモ"
            value={memo}
            onPress={() => openSheetNamed("memo")}
            showSeparator={false}
          />
        </View>
      </ScrollView>

      {/* C-3/D-2：CTA は画面下部に固定（キーボード表示中はフォームの直下に来る） */}
      <View
        className="px-6 pt-3.5"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Button
          testID={`${screenName}-submit-button`}
          label={mode === "create" ? "作成する" : "保存する"}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
      </View>

      {/* シートは開くたびに session を変えて中身を作り直す（初期値のリセットを兼ねる）。
          閉じたあともマウントしたままにする（adr/0022） */}
      {mountedSheet?.name === "date" ? (
        <PlanDatePickerSheet
          key={mountedSheet.session}
          visible={openSheet === "date"}
          title="日時をえらぶ"
          withTime
          initialDate={date}
          initialTime={time}
          onConfirm={(nextDate, nextTime) => {
            setDate(nextDate);
            setTime(nextTime);
            // 日付を入れた時点で期限を消す（domain/plan-lifecycle.md。Issue #58）
            setDeadline(null);
            closeSheet();
          }}
          onClear={() => {
            setDate(null);
            setTime(null);
            closeSheet();
          }}
          onClose={closeSheet}
        />
      ) : null}

      {mountedSheet?.name === "deadline" ? (
        <PlanDatePickerSheet
          key={mountedSheet.session}
          visible={openSheet === "deadline"}
          title="期限をえらぶ"
          withTime={false}
          initialDate={deadline}
          initialTime={null}
          onConfirm={(selected) => {
            setDeadline(selected);
            closeSheet();
          }}
          onClear={() => {
            setDeadline(null);
            closeSheet();
          }}
          onClose={closeSheet}
        />
      ) : null}

      {mountedSheet?.name === "url" ? (
        <PlanTextFieldSheet
          key={mountedSheet.session}
          visible={openSheet === "url"}
          title="参考URL"
          initialValue={referenceUrl}
          placeholder="https://…"
          keyboardType="url"
          onConfirm={(value) => {
            setReferenceUrl(value);
            closeSheet();
          }}
          onClose={closeSheet}
          testID={`${screenName}-url-sheet`}
        />
      ) : null}

      {mountedSheet?.name === "memo" ? (
        <PlanTextFieldSheet
          key={mountedSheet.session}
          visible={openSheet === "memo"}
          title="メモ"
          initialValue={memo}
          placeholder="メモをかく"
          multiline
          onConfirm={(value) => {
            setMemo(value);
            closeSheet();
          }}
          onClose={closeSheet}
          testID={`${screenName}-memo-sheet`}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

type FormFieldRowProps = {
  icon: IconName;
  label: string;
  value: string | null;
  onPress: () => void;
  showSeparator: boolean;
  testID: string;
  /** 押せず・グレー表示にする（例：日付ありのときの期限行。Issue #58） */
  disabled?: boolean;
};

// 項目の行（C-3）。行を押すとピッカー・入力シートが下から重なる。
function FormFieldRow({
  icon,
  label,
  value,
  onPress,
  showSeparator,
  testID,
  disabled = false,
}: FormFieldRowProps) {
  const filled = value !== null;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-4 py-3 active:opacity-70 ${
        showSeparator ? "border-b border-sand" : ""
      }`}
    >
      <Icon
        name={icon}
        size={15}
        color={disabled ? palette.latte : filled ? palette.ink : palette.taupe}
      />
      <Text
        className={`flex-1 text-sm font-medium ${disabled ? "text-latte" : "text-ink"}`}
      >
        {label}
      </Text>
      <Text
        className={`max-w-[150px] text-sm font-medium ${
          disabled ? "text-latte" : filled ? "text-plum" : "text-latte"
        }`}
        numberOfLines={1}
      >
        {value ?? "なし"}
      </Text>
      <Icon name="chevron-down" size={12} color={palette.latte} />
    </Pressable>
  );
}
