// 書き出しファイルの共有の Repository interface（adr/0003）。
// テキストをファイル（.txt）にして iOS 共有シートへ渡す（domain/pairing.md「書き出し / エクスポート」）。
// 実装（expo-file-system + expo-sharing）は global/data に置く。
// 設定（features/settings）とロック画面（features/pairing の PartnerLeftScreen）の
// 両方から使うため features 配下ではなく global に置く（Issue #64）。
export interface FileShareRepository {
  /** content をファイル名 fileName で書き出し、共有シートを開く。閉じられたら resolve する */
  shareTextFile(fileName: string, content: string): Promise<void>;
}
