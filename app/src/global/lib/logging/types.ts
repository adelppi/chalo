// 端末内ログの型（adr/0011）。1行1 JSON（NDJSON）で記録する。

export type LogLevel = "info" | "warn" | "error";

/** ログに残すエラー情報。内容ゼロ方式のため種別（name・code）とスタックのみ（adr/0011） */
export type LogErrorInfo = {
  name: string;
  code?: string;
  stack?: string;
};

export type LogEntry = {
  /** ISO 8601（UTC）。ローテーションの経過日数判定に使う */
  ts: string;
  level: LogLevel;
  /** 操作イベント名（snake_case トークン。例: plan_create） */
  event: string;
  /** 画面名（expo-router のルート名。値は含まない。例: (app)/plan/[id]） */
  screen?: string;
  /** 各種 ID。UUID のみ許可（内容ゼロ方式のフィルタで担保） */
  ids?: Record<string, string>;
  /** 補足トークン（例: granted / denied / fatal）。自由文は入れない */
  detail?: string;
  error?: LogErrorInfo;
};

/** log() の呼び出し側が渡せるフィールド。ここに無いものは記録できない */
export type LogFields = {
  screen?: string;
  ids?: Record<string, string>;
  detail?: string;
  error?: unknown;
};
