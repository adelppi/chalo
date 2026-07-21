// オンボーディング進捗の計算・判定。純粋関数（adr/0014）。
// 進捗は端末ローカル（AsyncStorage、userId 単位）に保持する（domain/onboarding.md）。

export type OnboardingProgress = {
  /** A3「名前の確認」を終えたか */
  nameConfirmed: boolean;
  /** A4 まで終え、オンボーディングを完了したか */
  complete: boolean;
};

const EMPTY_PROGRESS: OnboardingProgress = {
  nameConfirmed: false,
  complete: false,
};

/** AsyncStorage の生値（JSON 文字列 or null）から進捗を復元する。壊れていれば未着手扱い */
export function parseOnboardingProgress(
  raw: string | null,
): OnboardingProgress {
  if (!raw) {
    return EMPTY_PROGRESS;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return EMPTY_PROGRESS;
    }
    const { nameConfirmed, complete } = parsed as Record<string, unknown>;
    return {
      nameConfirmed: nameConfirmed === true,
      complete: complete === true,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function serializeOnboardingProgress(
  progress: OnboardingProgress,
): string {
  return JSON.stringify(progress);
}

/**
 * オンボーディング（A3/A4）をまだ通す必要があるか。
 * 既にペア済み（pair_id あり）なら、ローカル進捗が失われていても完了扱いにする
 * （再インストール等の安全ネット。domain/onboarding.md）。
 */
export function needsOnboarding(
  progress: OnboardingProgress,
  paired: boolean,
): boolean {
  return !paired && !progress.complete;
}

/**
 * 起動ゲートで pairState（サーバのペア状態）の解決を待つべきか。
 * ローカルで既に完了済みなら待たない（オフラインでも即座に表示できる）。
 * 取得中でも、通信が止まっている（オフライン等で isPaused）場合は待たず、
 * ローカル進捗にフォールバックする（Issue #56。フォールバック方針は
 * `[保留]` → docs/open-questions.md Q-ONB-1）。
 */
export function shouldWaitForPairState(
  progress: OnboardingProgress,
  pairStateQuery: { isPending: boolean; isPaused: boolean },
): boolean {
  return (
    !progress.complete && pairStateQuery.isPending && !pairStateQuery.isPaused
  );
}
