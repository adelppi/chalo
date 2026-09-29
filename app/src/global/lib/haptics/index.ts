// 触覚フィードバック（features.md 10.3・adr/0027）。expo-haptics を import してよいのは
// ここだけ。feature は「何で鳴らすか」を知らず、意味（成功・削除）で呼ぶ。
// 鳴らなくても操作は成立するため、失敗は握りつぶして呼び出し側へ漏らさない。
import * as Haptics from "expo-haptics";

function fireAndForget(play: () => Promise<void>) {
  play().catch(() => {});
}

export const haptics = {
  /** 作成・手動おしまい・ペア成立：うれしい完了 */
  success: () =>
    fireAndForget(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  /** 削除：Success と区別する控えめな手応え */
  destructive: () =>
    fireAndForget(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    ),
};
