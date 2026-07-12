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
  /**
   * 相手が編集ロック中のとき、その相手の表示名（adr/0005。F-9 の表示に使う）。
   * 本来は locked_by(uuid) から profiles を引くが、モック段階では名前に簡略化する。
   */
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
