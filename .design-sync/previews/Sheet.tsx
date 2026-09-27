import { Button, Icon, Sheet } from "chalo-ds";

// 下から重なるネイティブのシート。うしろの画面は見えたまま。
const noop = () => {};

// メモ・参考URLの入力（C-3 / D-2）。
export const TextField = () => (
  <Sheet visible title="メモ" onClose={noop} action={{ label: "クリア", onPress: noop }}>
    <div style={{ marginTop: 16 }}>
      <div className="rounded-control bg-cream px-3.5 py-3 text-sm font-medium text-ink" style={{ minHeight: 96 }}>
        閉館後の館内をまわれるツアー。要予約
      </div>
    </div>
    <div style={{ marginTop: 16 }}>
      <Button label="決定" />
    </div>
  </Sheet>
);

// 既定カレンダーの選択（E-1）。
export const CalendarPicker = () => (
  <Sheet visible title="既定カレンダーをえらぶ" onClose={noop}>
    <div style={{ marginTop: 12 }}>
      {[
        { name: "カレンダー", color: "#1A8CFF", selected: true },
        { name: "ふたりの予定", color: "#8C646E", selected: false },
      ].map((c, i, all) => (
        <div
          key={c.name}
          className={`flex flex-row items-center gap-3 py-3.5 ${i < all.length - 1 ? "border-b border-sand" : ""}`}
        >
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
          <span className="flex-1 text-[15px] font-medium text-ink">{c.name}</span>
          {c.selected ? <Icon name="check-circle" size={18} color="#8C646E" /> : null}
        </div>
      ))}
    </div>
  </Sheet>
);
