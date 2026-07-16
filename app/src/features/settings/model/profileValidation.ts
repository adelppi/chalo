// 名前・相手のよびかたのバリデーション。純粋関数（adr/0014）。
// あなたの名前（A3・E-1）・相手のよびかた（E-1）どちらも同じ規則（空欄不可・最大長）を使う。

export const PROFILE_NAME_MAX_LENGTH = 20;

export type ProfileNameValidation =
  | { valid: true; value: string }
  | { valid: false; reason: "empty" | "too-long" };

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

export function profileNameErrorMessage(
  reason: Exclude<ProfileNameValidation, { valid: true }>["reason"],
): string {
  switch (reason) {
    case "empty":
      return "名前を入力してください。";
    case "too-long":
      return `${PROFILE_NAME_MAX_LENGTH}文字以内で入力してください。`;
  }
}
