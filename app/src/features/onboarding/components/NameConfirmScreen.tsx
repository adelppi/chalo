import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import {
  type ProfileSettings,
  profileNameErrorMessage,
  useProfileSettings,
  useUpdateDisplayName,
  validateProfileName,
} from "@features/settings";
import { Button } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { useConfirmName } from "../hooks/useOnboardingMutations";

// 名前の確認（A3）。Google/Apple から事前入力された表示名を確認・編集して次へ進む
// （domain/onboarding.md）。次（A4「ペアの開始」）は既存のペア開始画面（/pairing）を再利用する。
export function NameConfirmScreen() {
  const { data: profile } = useProfileSettings();

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-linen">
        <ActivityIndicator color={palette.ink} />
      </View>
    );
  }

  return <NameConfirmForm profile={profile} />;
}

function NameConfirmForm({ profile }: { profile: ProfileSettings }) {
  const updateDisplayName = useUpdateDisplayName();
  const confirmName = useConfirmName();

  const [name, setName] = useState(profile.displayName);
  const [touched, setTouched] = useState(false);

  const validation = validateProfileName(name);
  const isSaving = updateDisplayName.isPending || confirmName.isPending;
  // 押せないと空欄エラーに気づけないため、非活性にはしない（判定は送信時に行う）。
  const canSubmit = !isSaving;

  const handleSubmit = () => {
    setTouched(true);
    if (!validation.valid) {
      return;
    }
    // A4「ペアの開始」への遷移はここでは行わない。confirmName 成功後の
    // invalidateQueries でこの画面の親（OnboardingNameRoute）の progress が
    // 更新され、その useEffect が /pairing へ push する（唯一の遷移経路。
    // ここでも push すると二重に遷移してしまうため。Issue #40）。
    updateDisplayName.mutate(validation.value, {
      onSuccess: () => {
        confirmName.mutate();
      },
    });
  };

  return (
    <View testID="onboarding-name-screen" className="flex-1 bg-linen">
      <View className="gap-2.5 px-7 pt-[84px]">
        <Text className="text-[26px] font-black leading-10 text-ink">
          名前をおしえてください
        </Text>
        <Text className="text-[13px] font-medium leading-6 text-taupe">
          おふたりの画面に表示されるお名前です。あとで変えられます。
        </Text>
      </View>

      <View className="px-6 pt-7">
        <View className="rounded-field border-2 border-ink bg-paper px-[18px] py-4">
          <TextInput
            testID="onboarding-name-input"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setTouched(false);
            }}
            autoFocus
            selectionColor={palette.plum}
            className="p-0 text-[18px] font-medium text-ink"
          />
        </View>

        {touched && !validation.valid ? (
          <Text
            testID="onboarding-name-error-text"
            className="mt-2 text-[13px] font-medium text-rust"
          >
            {profileNameErrorMessage(validation.reason)}
          </Text>
        ) : null}

        <View className={touched && !validation.valid ? "mt-4" : "mt-5"}>
          <Button
            testID="onboarding-name-submit-button"
            label="OK"
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </View>
    </View>
  );
}
