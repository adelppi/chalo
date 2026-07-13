// 編集ロックの判定（adr/0005）。副作用のない純粋関数に切り出す（adr/0014）。

/** ロックの自動失効（TTL）。アプリが落ちてロックが残っても、これを過ぎれば空く */
export const EDIT_LOCK_TTL_MS = 5 * 60 * 1000;

/**
 * 編集ロックの状態。
 * free = 誰も保持していない（未ロック・TTL 切れを含む）／mine = 自分の残ロック
 */
export type EditLockState = "free" | "mine" | "partner";

type EditLockInput = {
  /** ロック保持者の profile id（plans.locked_by） */
  lockedBy: string | null;
  /** ロック取得時刻の ISO 文字列（plans.locked_at） */
  lockedAt: string | null;
  /** 自分の profile id */
  userId: string;
  /** 判定時点の時刻 */
  now: Date;
};

/** 編集ボタン押下時のロック判定。TTL を過ぎたロックは無いものとして扱う */
export function evaluateEditLock({
  lockedBy,
  lockedAt,
  userId,
  now,
}: EditLockInput): EditLockState {
  if (!lockedBy || !lockedAt) {
    return "free";
  }
  const lockedAtMs = Date.parse(lockedAt);
  // 不正な時刻が入っても永久ロックにしない
  if (Number.isNaN(lockedAtMs)) {
    return "free";
  }
  if (now.getTime() - lockedAtMs >= EDIT_LOCK_TTL_MS) {
    return "free";
  }
  return lockedBy === userId ? "mine" : "partner";
}

/** 自分がロックを立てて編集を開始できるか。相手の有効なロックだけが妨げる */
export function canStartEditing(state: EditLockState): boolean {
  return state !== "partner";
}
