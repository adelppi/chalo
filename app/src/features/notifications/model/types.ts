// 通知のドメイン型（docs/domain/notifications.md・adr/0007 系統1）。

/** プラン↔予約済み期限通知の対応。クラウドに持たず端末ローカルに保持する（data-model.md） */
export type DeadlineNotificationLink = {
  planId: string;
  /** expo-notifications の予約識別子 */
  notificationId: string;
};

/** 期限通知の予約判定に使うプランの項目。plans feature へ依存しないための最小の写し */
export type DeadlinePlanFields = {
  id: string;
  title: string;
  /** 行く予定日 YYYY-MM-DD。入っていたら送らない（domain/notifications.md） */
  date: string | null;
  /** 期限 YYYY-MM-DD。null なら予約しない */
  deadline: string | null;
};

/** 端末に予約するローカル通知の内容 */
export type DeadlineNotificationInput = {
  title: string;
  body: string;
  /** タップ時のディープリンク先（adr/0002。例: /plan/<id>） */
  url: string;
  /** 発火日時（端末TZ） */
  fireDate: Date;
};

export type NotificationPermission = "granted" | "denied" | "undetermined";
