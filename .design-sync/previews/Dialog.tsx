import { Dialog, Icon } from "chalo-ds";

// 確認ダイアログ（F-1 系）。visible=true で開いた状態を出す。
const noop = () => {};

export const Destructive = () => (
  <Dialog
    visible
    title="このプランを削除しますか？"
    message="削除するともとに戻せません。"
    onCancel={noop}
    confirm={{ label: "削除する", onPress: noop, variant: "destructive", icon: "trash" }}
  />
);

export const Confirm = () => (
  <Dialog
    visible
    title="ログアウトしますか？"
    message="データは残ります。もういちどログインすると、続きから使えます。"
    onCancel={noop}
    confirm={{ label: "ログアウト", onPress: noop }}
  />
);

// confirm を省くと 1 ボタン（閉じるだけ）になる。
export const SingleAction = () => (
  <Dialog
    visible
    title="日付がまだ入っていません"
    message="日付を入れると、カレンダーに追加できます。"
    cancelLabel="わかった"
    onCancel={noop}
  />
);

// titleAccessory でタイトル左にアイコンを添える（F-1b 完了時）。
export const WithAccessory = () => (
  <Dialog
    visible
    title="おしまいにしました"
    titleAccessory={<Icon name="check-circle" size={22} color="#8C646E" filled />}
    message="おわったプランに移りました。いつでも見返せます。"
    cancelLabel="とじる"
    onCancel={noop}
  />
);
