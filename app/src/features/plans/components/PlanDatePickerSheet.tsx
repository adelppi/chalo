import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";

import { Button, Icon, Sheet } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import {
  combineTime,
  formatCalendarTitle,
  getCalendarWeeks,
  getHourWheelOptions,
  getMinuteWheelOptions,
  isPastDate,
  monthOf,
  shiftMonth,
  splitTime,
  TIME_NONE,
  toDateString,
  type CalendarMonth,
  type TimeWheelOption,
} from "../model/calendar";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// 時・分ダイヤルの選択肢（Issue #58 フォローアップ）。固定値なのでモジュール直下で作る。
const HOUR_OPTIONS = getHourWheelOptions();
const MINUTE_OPTIONS = getMinuteWheelOptions();

function todayDateString(): string {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

type TimeWheelProps = {
  testID: string;
  options: TimeWheelOption[];
  initialValue: string;
  onChange: (value: string) => void;
  style?: StyleProp<TextStyle>;
};

// @react-native-picker/picker を @gorhom/bottom-sheet の中で使うと、選択直後に
// 一瞬だけ高速に回転して見えるちらつきが起きる既知の相互作用がある
// (react-native-picker/picker#431)。親の再レンダーが selectedValue を同期的に
// 押し戻すのが原因のため、値をローカル state に閉じ、親へは effect で非同期に
// 伝える(react-native-picker/picker コミュニティで確認されている回避策)。
function TimeWheel({
  testID,
  options,
  initialValue,
  onChange,
  style,
}: TimeWheelProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onChange(value);
    // 初回マウント時に initialValue をそのまま親へ伝えるだけで良い
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Picker
      testID={testID}
      selectedValue={value}
      onValueChange={(v) => setValue(String(v))}
      itemStyle={{ fontSize: 22, color: palette.ink }}
      style={style}
    >
      {options.map((option) => (
        <Picker.Item
          key={option.value}
          label={option.label}
          value={option.value}
          color={option.value === TIME_NONE ? palette.taupe : undefined}
        />
      ))}
    </Picker>
  );
}

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
  const [timeParts, setTimeParts] = useState(() => splitTime(initialTime));
  // 開くたびに新しくマウントする前提なので、今日は初回レンダーの値で固定して良い（Issue #58）。
  const [today] = useState(todayDateString);
  const time = combineTime(timeParts.hour, timeParts.minute);

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
        <Text className="text-[15px] font-bold text-ink">
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
              // 今日より前は押せずグレー表示。既に選択済み（編集で開いた過去日付）は
              // 選択スタイルを優先して見せるが、押し直しはできない（Issue #58）。
              const past = isPastDate(dateString, today);
              return (
                <View
                  key={dayIndex}
                  className="h-9 flex-1 items-center justify-center"
                >
                  <Pressable
                    testID={`plan-date-picker-day-${dateString}`}
                    onPress={() => setSelectedDate(dateString)}
                    disabled={past}
                    className={`h-[34px] w-[34px] items-center justify-center rounded-full ${
                      selected ? "bg-ink" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected
                          ? "text-linen"
                          : past
                            ? "text-latte"
                            : "text-ink"
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
          {/* iOS ネイティブのホイールピッカー（Issue #16）。時・分を別ダイヤルに分け、
              分は10分きざみにする（Issue #58 フォローアップ）。時刻による選択不可はない。
              「なし」のときの分ダイヤルは見た目だけ薄くする(enabled は iOS 非対応のため
              実際の無効化はしない。選んでも combineTime が無視するので結果に影響しない)。 */}
          <View className="flex-row">
            <TimeWheel
              testID="plan-date-picker-hour-picker"
              options={HOUR_OPTIONS}
              initialValue={timeParts.hour}
              onChange={(hour) => setTimeParts((prev) => ({ ...prev, hour }))}
              style={{ height: 160, flex: 1 }}
            />
            <TimeWheel
              testID="plan-date-picker-minute-picker"
              options={MINUTE_OPTIONS}
              initialValue={timeParts.minute}
              onChange={(minute) =>
                setTimeParts((prev) => ({ ...prev, minute }))
              }
              style={{
                height: 160,
                flex: 1,
                opacity: timeParts.hour === TIME_NONE ? 0.35 : 1,
              }}
            />
          </View>
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
