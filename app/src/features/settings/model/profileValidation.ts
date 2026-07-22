// 名前・相手のよびかたのバリデーション。純粋関数（adr/0014）。
// 最大長は共通だが、空欄の扱いが違う（domain/onboarding.md）:
//   あなたの名前（A3・E-1）… 空欄不可。表示名は必ず存在する。
//   相手のよびかた（E-1） … 空欄可。空欄で保存すると未設定に戻り、相手の表示名で表示される。

export const PROFILE_NAME_MAX_LENGTH = 20;

export type ProfileFieldErrorReason = "empty" | "too-long";

/** 編集ダイアログが扱う共通の検証結果（value が null なら「未設定に戻す」） */
export type ProfileFieldValidation =
  | { valid: true; value: string | null }
  | { valid: false; reason: ProfileFieldErrorReason };

export type ProfileNameValidation =
  | { valid: true; value: string }
  | { valid: false; reason: ProfileFieldErrorReason };

export type PartnerNicknameValidation =
  { valid: true; value: string | null } | { valid: false; reason: "too-long" };

/** 「あなたの名前」（空欄不可） */
export function validateProfileName(input: string): ProfileNameValidation {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, reason: "empty" };
  }
  if (trimmed.length > PROFILE_NAME_MAX_LENGTH) {
    return { valid: false, reason: "too-long" };
  }
  return { valid: true, value: trimmed };
}

/** 「相手のよびかた」（空欄可。空欄は null ＝未設定に戻す） */
export function validatePartnerNickname(
  input: string,
): PartnerNicknameValidation {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: true, value: null };
  }
  if (trimmed.length > PROFILE_NAME_MAX_LENGTH) {
    return { valid: false, reason: "too-long" };
  }
  return { valid: true, value: trimmed };
}

export function profileNameErrorMessage(
  reason: ProfileFieldErrorReason,
): string {
  switch (reason) {
    case "empty":
      return "名前を入力してください。";
    case "too-long":
      return `${PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`;
  }
}
