import type { OnboardingProgress } from "../model/progress";

// オンボーディング進捗の Repository interface（adr/0003）。
// 実装は端末ローカル保存（AsyncStorage、userId 単位）。global/data に置く（adr/0015）。
export interface OnboardingRepository {
  getProgress(): Promise<OnboardingProgress>;

  /** A3「名前の確認」を終えたことを記録する */
  confirmName(): Promise<void>;

  /** A4 まで終え、オンボーディングを完了したことを記録する（スキップ／ペア成立の両方から呼ぶ） */
  complete(): Promise<void>;
}
