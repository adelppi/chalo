// プランのドメイン型（docs/data-model.md の plans に対応）。
// ステータスは保存せず完全導出する（docs/domain/plan-lifecycle.md）。

export type PlanStatus = "wish" | "scheduled" | "done";

export type Plan = {
  id: string;
  /** タイトル（必須はこれだけ） */
  title: string;
  /** 行く予定日 YYYY-MM-DD */
  date: string | null;
  /** 時刻 HH:mm（date がある時のみ意味を持つ） */
  time: string | null;
  /** 期限 YYYY-MM-DD（通知のためだけの情報） */
  deadline: string | null;
  /** 場所の名称（v1 は表示のみ。入力 UI はスコープ外） */
  placeName: string | null;
  /** 参考URL（1つ） */
  referenceUrl: string | null;
  memo: string | null;
  /** 手動おしまいの日 YYYY-MM-DD（自動おしまいは書き込まない） */
  closedAt: string | null;
  /** 編集ロック保持者の profile id（adr/0005。TTL 判定は model/editLock） */
  lockedBy: string | null;
  /** ロック取得時刻の ISO 文字列 */
  lockedAt: string | null;
  /** ロック保持者の表示名（「〇〇が編集中です」の表示に使う。読めなければ null） */
  lockedByName: string | null;
  /** 作成者（owner）の表示名。本来は owner_id から profiles を引く */
  ownerName: string;
  /** 作成日 YYYY-MM-DD */
  createdAt: string;
};

/** 作成・編集フォームの入力値。タイトル以外は任意（domain/plan-lifecycle.md） */
export type PlanDraft = {
  title: string;
  date: string | null;
  time: string | null;
  deadline: string | null;
  referenceUrl: string | null;
  memo: string | null;
};
