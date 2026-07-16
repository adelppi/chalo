import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { FileShareRepository } from "@features/settings";

// 書き出しテキストを .txt にして iOS 共有シートへ渡す（domain/pairing.md）。
// 保存先の選択（ファイルに保存 / AirDrop / メール等）は OS に委ねる。
export const expoFileShareRepository: FileShareRepository = {
  async shareTextFile(fileName: string, content: string): Promise<void> {
    // キャッシュ領域に書く（共有シートに渡すための一時ファイル。OS が適宜掃除する）。
    const file = new File(Paths.cache, fileName);
    if (!file.exists) {
      file.create();
    }
    file.write(content);
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/plain",
      UTI: "public.plain-text",
    });
  },
};
