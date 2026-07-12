import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Icon, type IconName } from "@global/components/ui";
import { palette } from "@global/constants/palette";
import { useToastStore } from "@global/store/useToastStore";

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

  if (isPending || !plan) {
    return (
      <View className="flex-1 items-center justify-center bg-linen">
        <ActivityIndicator color={palette.ink} />
      </View>
    );
  }
  return <PlanForm mode="edit" plan={plan} />;
}

type OpenSheet = "date" | "deadline" | "url" | "memo" | null;

function PlanForm({ mode, plan }: { mode: "create" | "edit"; plan?: Plan }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan(plan?.id ?? "");

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

  const screenName = mode === "create" ? "plan-create" : "plan-edit";
  const isSaving = createPlan.isPending || updatePlan.isPending;
  const canSubmit = title.trim().length > 0 && !isSaving;

  const buildDraft = (): PlanDraft => ({
    title: title.trim(),
    date,
    time: date ? time : null,
    deadline,
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
          router.back();
          showToast(`「${created.title}」を追加しました`, {
            icon: "check-circle",
          });
        },
        onError,
      });
    } else {
      updatePlan.mutate(buildDraft(), {
        onSuccess: () => {
          router.back();
          showToast("保存しました", { icon: "check-circle" });
        },
        onError,
      });
    }
  };

  return (
    <View testID={`${screenName}-screen`} className="flex-1 bg-linen">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="px-6" style={{ paddingTop: insets.top + 20 }}>
          <Pressable
            testID={`${screenName}-cancel-button`}
            onPress={() => router.back()}
            hitSlop={8}
            className="self-start"
          >
            <Text className="font-zen-bold text-[15px] text-stone">
              キャンセル
            </Text>
          </Pressable>
        </View>

        <View className="px-6 pt-2.5">
          <Text className="font-zen-black text-[28px] text-ink">
            {mode === "create" ? "あたらしいプラン" : "プランを編集"}
          </Text>
        </View>

        <View
          className={`mx-6 mt-3.5 rounded-[18px] border-2 bg-paper px-4 py-3.5 ${
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
            className="p-0 font-zen-bold text-[17px] text-ink"
            selectionColor={palette.plum}
          />
        </View>

        <View className="mx-6 mt-3 overflow-hidden rounded-[18px] bg-paper shadow-card">
          <FormFieldRow
            testID={`${screenName}-date-row`}
            icon="calendar"
            label="日時"
            value={date ? formatDateShort(date, time) : null}
            onPress={() => setOpenSheet("date")}
            showSeparator
          />
          <FormFieldRow
            testID={`${screenName}-deadline-row`}
            icon="clock"
            label="期限"
            value={deadline ? formatDateShort(deadline) : null}
            onPress={() => setOpenSheet("deadline")}
            showSeparator
          />
          <FormFieldRow
            testID={`${screenName}-url-row`}
            icon="link"
            label="参考URL"
            value={referenceUrl?.replace(/^https?:\/\//, "") ?? null}
            onPress={() => setOpenSheet("url")}
            showSeparator
          />
          <FormFieldRow
            testID={`${screenName}-memo-row`}
            icon="note"
            label="メモ"
            value={memo}
            onPress={() => setOpenSheet("memo")}
            showSeparator={false}
          />
        </View>

        <View className="mx-6 mt-3.5">
          <Button
            testID={`${screenName}-submit-button`}
            label={mode === "create" ? "追加する" : "保存する"}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>

      {/* シートは開くたびに新しくマウントする（初期値のリセットを兼ねる） */}
      {openSheet === "date" ? (
        <PlanDatePickerSheet
          visible
          title="日時をえらぶ"
          withTime
          initialDate={date}
          initialTime={time}
          onConfirm={(nextDate, nextTime) => {
            setDate(nextDate);
            setTime(nextTime);
            setOpenSheet(null);
          }}
          onClear={() => {
            setDate(null);
            setTime(null);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}

      {openSheet === "deadline" ? (
        <PlanDatePickerSheet
          visible
          title="期限をえらぶ"
          withTime={false}
          initialDate={deadline}
          initialTime={null}
          onConfirm={(selected) => {
            setDeadline(selected);
            setOpenSheet(null);
          }}
          onClear={() => {
            setDeadline(null);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}

      {openSheet === "url" ? (
        <PlanTextFieldSheet
          visible
          title="参考URL"
          initialValue={referenceUrl}
          placeholder="https://…"
          keyboardType="url"
          onConfirm={(value) => {
            setReferenceUrl(value);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
          testID={`${screenName}-url-sheet`}
        />
      ) : null}

      {openSheet === "memo" ? (
        <PlanTextFieldSheet
          visible
          title="メモ"
          initialValue={memo}
          placeholder="メモをかく"
          multiline
          onConfirm={(value) => {
            setMemo(value);
            setOpenSheet(null);
          }}
          onClose={() => setOpenSheet(null)}
          testID={`${screenName}-memo-sheet`}
        />
      ) : null}
    </View>
  );
}

type FormFieldRowProps = {
  icon: IconName;
  label: string;
  value: string | null;
  onPress: () => void;
  showSeparator: boolean;
  testID: string;
};

// 項目の行（C-3）。行を押すとピッカー・入力シートが下から重なる。
function FormFieldRow({
  icon,
  label,
  value,
  onPress,
  showSeparator,
  testID,
}: FormFieldRowProps) {
  const filled = value !== null;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 active:opacity-70 ${
        showSeparator ? "border-b border-sand" : ""
      }`}
    >
      <Icon
        name={icon}
        size={15}
        color={filled ? palette.ink : palette.taupe}
      />
      <Text className="flex-1 font-zen-bold text-sm text-ink">{label}</Text>
      <Text
        className={`max-w-[150px] font-zen-bold text-sm ${
          filled ? "text-plum" : "text-latte"
        }`}
        numberOfLines={1}
      >
        {value ?? "なし"}
      </Text>
      <Icon name="chevron-down" size={12} color={palette.latte} />
    </Pressable>
  );
}
