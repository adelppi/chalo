import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button, Icon, Sheet } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import {
  formatCalendarTitle,
  getCalendarWeeks,
  monthOf,
  shiftMonth,
  toDateString,
  type CalendarMonth,
} from "../model/calendar";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// 「時刻なし」を表すホイールの先頭項目（time = null）。
const TIME_NONE = "none";

// 30分きざみの時刻候補（ネイティブのホイールピッカーの選択肢。Issue #16）
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

type PlanDatePickerSheetProps = {
  visible: boolean;
  /** 「日時をえらぶ」「期限をえらぶ」 */
  title: string;
  /** 時刻の行を出すか（日時は true・期限は false） */
  withTime: boolean;
  initialDate: string | null;
  initialTime: string | null;
  onConfirm: (date: string, time: string | null) => void;
  /** クリア（日付・時刻を消す） */
  onClear: () => void;
  onClose: () => void;
};

function currentMonth(): CalendarMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// 日時ピッカー（C-3b）。うしろに作成画面が見えたまま下から重なる。
// 開くたびに親が新しくマウントする前提（初期値は useState の初期化で受ける）。
export function PlanDatePickerSheet({
  visible,
  title,
  withTime,
  initialDate,
  initialTime,
  onConfirm,
  onClear,
  onClose,
}: PlanDatePickerSheetProps) {
  const [month, setMonth] = useState<CalendarMonth>(() =>
    initialDate ? monthOf(initialDate) : currentMonth(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [time, setTime] = useState<string | null>(initialTime);

  const weeks = getCalendarWeeks(month.year, month.month);

  return (
    <Sheet
      visible={visible}
      title={title}
      onClose={onClose}
      testID="plan-date-picker-sheet"
      action={{
        label: "クリア",
        onPress: onClear,
        testID: "plan-date-picker-clear-button",
      }}
    >
      <View className="mt-[18px] flex-row items-center justify-between px-2">
        <Pressable
          testID="plan-date-picker-prev-month-button"
          hitSlop={12}
          onPress={() => setMonth((m) => shiftMonth(m, -1))}
        >
          <Icon name="chevron-left" size={14} color={palette.plum} />
        </Pressable>
        <Text className="text-[15px] font-black text-ink">
          {formatCalendarTitle(month)}
        </Text>
        <Pressable
          testID="plan-date-picker-next-month-button"
          hitSlop={12}
          onPress={() => setMonth((m) => shiftMonth(m, 1))}
        >
          <Icon name="chevron-right" size={14} color={palette.plum} />
        </Pressable>
      </View>

      <View className="mt-2.5">
        <View className="flex-row">
          {WEEKDAY_LABELS.map((label) => (
            <View
              key={label}
              className="h-[26px] flex-1 items-center justify-center"
            >
              <Text className="text-[11px] font-medium text-stone">
                {label}
              </Text>
            </View>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              if (day === null) {
                return <View key={dayIndex} className="h-9 flex-1" />;
              }
              const dateString = toDateString(month.year, month.month, day);
              const selected = dateString === selectedDate;
              return (
                <View
                  key={dayIndex}
                  className="h-9 flex-1 items-center justify-center"
                >
                  <Pressable
                    testID={`plan-date-picker-day-${dateString}`}
                    onPress={() => setSelectedDate(dateString)}
                    className={`h-[34px] w-[34px] items-center justify-center rounded-full ${
                      selected ? "bg-ink" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? "text-linen" : "text-ink"
                      }`}
                    >
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {withTime ? (
        <View className="mt-3.5 overflow-hidden rounded-button bg-cream px-4 pb-1 pt-3">
          <Text className="text-sm font-medium text-ink">時刻</Text>
          {/* iOS ネイティブのホイールピッカー（Issue #16）。先頭は「なし」= time 未設定。 */}
          <Picker
            testID="plan-date-picker-time-picker"
            selectedValue={time ?? TIME_NONE}
            onValueChange={(value) =>
              setTime(value === TIME_NONE ? null : String(value))
            }
            itemStyle={{ fontSize: 22, color: palette.ink }}
            style={{ height: 160 }}
          >
            <Picker.Item label="なし" value={TIME_NONE} color={palette.taupe} />
            {TIME_OPTIONS.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
      ) : null}

      <View className="mt-4">
        <Button
          testID="plan-date-picker-confirm-button"
          label="決定"
          disabled={!selectedDate}
          onPress={() => {
            if (selectedDate) {
              onConfirm(selectedDate, withTime ? time : null);
            }
          }}
        />
      </View>
    </Sheet>
  );
}
