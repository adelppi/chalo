import { File, Paths } from "expo-file-system";

// ログファイルの読み書き（adr/0011）。document 配下に置き、OS に消されない
// 場所で最大30日ぶんを保持する。呼び出しはすべて同期（BG 移行の短い猶予内に
// 書き切るため。2MB 上限なので所要は数十ms に収まる）。

const LOG_FILE_NAME = "chalo-log.ndjson";

function logFile(): File {
  return new File(Paths.document, LOG_FILE_NAME);
}

/** ログファイルの中身。無い・読めないときは空文字 */
export function readLogFileText(): string {
  try {
    const file = logFile();
    return file.exists ? file.textSync() : "";
  } catch {
    return "";
  }
}

/** ログファイルを丸ごと書き換える。失敗は呼び出し側で握りつぶす */
export function writeLogFileText(text: string): void {
  const file = logFile();
  if (!file.exists) {
    file.create();
  }
  file.write(text);
}
