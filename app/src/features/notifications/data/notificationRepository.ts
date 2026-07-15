import type {
  DeadlineNotificationInput,
  DeadlineNotificationLink,
  NotificationPermission,
} from "../model/types";

// 通知の Repository interface（adr/0003 の流儀）。
// feature はこの抽象にだけ依存する。実装（expo-notifications・AsyncStorage）は
// global/data に置き、合成ルートで結線する（adr/0015）。

/** 端末のローカル通知（expo-notifications）の操作 */
export interface DeviceNotificationRepository {
  getPermission(): Promise<NotificationPermission>;

  /** OS の許可ダイアログを出す（出せるのは実質1回。domain/onboarding.md） */
  requestPermission(): Promise<NotificationPermission>;

  /** 期限通知を予約して予約識別子を返す */
  scheduleDeadlineNotification(
    input: DeadlineNotificationInput,
  ): Promise<string>;

  cancelScheduledNotification(notificationId: string): Promise<void>;

  /** アプリを起動させた通知タップのディープリンク先。無ければ null */
  getInitialNotificationUrl(): string | null;

  /**
   * 通知タップの購読（バックグラウンド・フォアグラウンドからの復帰）。
   * 解除関数を返す。
   */
  addNotificationResponseListener(
    listener: (url: string | null) => void,
  ): () => void;

  /**
   * Expo push token の初期値取得＋更新の購読をまとめて行う。取得できるたびに
   * listener を呼ぶ(取得できない・権限なし等は null)。解除関数を返す。
   *
   * 呼び出し側(getExpoPushTokenAsync 相当)を購読コールバックの中で単独に
   * 呼び直すと、内部で端末の push token 変更イベントを再度発火させて
   * 無限ループになる(expo-notifications 自身の既知の注意点)。実装側で
   * 受け取った生の token を使って re-fetch を避ける責務を持つ。
   */
  subscribeToExpoPushToken(
    listener: (token: string | null) => void,
  ): () => void;
}

/** push_tokens(クラウド)への登録。Repository interface(adr/0003) */
export interface PushTokenRepository {
  /** 端末の Expo push token を自分のプロフィールに紐づけて保存する(冪等) */
  upsertToken(profileId: string, expoPushToken: string): Promise<void>;
}

/** 端末ローカルの保存（planId → 予約識別子の対応。data-model.md「期限通知の予約」） */
export interface NotificationStorageRepository {
  getLink(planId: string): Promise<DeadlineNotificationLink | null>;

  saveLink(link: DeadlineNotificationLink): Promise<void>;

  removeLink(planId: string): Promise<void>;
}
