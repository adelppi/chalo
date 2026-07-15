import { Image, View } from "react-native";

// 起動直後のセッション確認中に表示するローディング画面（Issue #36）。
// ネイティブの起動スプラッシュ（静止画）が隠れた直後にこの画面へ引き継ぐ。
// アニメーションは本来 Rive 統一だが、この用途は既存の GIF 素材を使う例外として
// adr/0010 に記録している。
const pawGif = require("@/assets/images/splash_chalo_paw_print.gif");

const PAW_ASPECT = 716 / 710;
const PAW_WIDTH = 120;

export function SplashLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-linen">
      <Image
        source={pawGif}
        style={{ width: PAW_WIDTH, height: PAW_WIDTH / PAW_ASPECT }}
        resizeMode="contain"
      />
    </View>
  );
}
