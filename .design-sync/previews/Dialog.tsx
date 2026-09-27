import { Dialog, Icon } from "chalo-ds";

// 確認ダイアログ（F-1 系）。文言は実際のアプリでの表示どおり。visible=true で開いた状態を出す。
const noop = () => {};

// プランの削除（D-1）。
export const Destructive = () => (
  <Dialog
    visible
    title="このプランを削除しますか？"
    message="「紅葉を見に京都へ」は、ふたりの一覧から消えます。この操作はもとに戻せません。"
    onCancel={noop}
    confirm={{ label: "削除する", onPress: noop, variant: "destructive" }}
  />
);

// ログアウト（E-1）。
export const Confirm = () => (
  <Dialog
    visible
    title="ログアウトしますか？"
    message="データは残ります。もういちどログインすると、続きから使えます。"
    onCancel={noop}
    confirm={{ label: "ログアウト", onPress: noop }}
  />
);

// confirm を省くと 1 ボタン（閉じるだけ）になる（日時なしでカレンダーに追加したとき）。
export const SingleAction = () => (
  <Dialog
    visible
    title="日付がまだ入っていません"
    message="日付を入れると、カレンダーに追加できます。"
    cancelLabel="わかった"
    onCancel={noop}
  />
);

// titleAccessory でタイトル左にアイコンを添える（F-1b 書き出し完了）。
export const WithAccessory = () => (
  <Dialog
    visible
    title="書き出しました"
    titleAccessory={
      <div className="h-[34px] w-[34px] items-center justify-center rounded-full bg-plum/[0.14]" style={{ display: "flex" }}>
        <Icon name="check-circle" size={17} color="#8C646E" />
      </div>
    }
    message="「chalo-plans.txt」を用意しました。共有して保存しておきましょう。"
    cancelLabel="とじる"
    onCancel={noop}
    confirm={{ label: "共有", icon: "share", onPress: noop }}
  />
);
