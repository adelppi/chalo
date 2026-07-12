import { Image, type ImageStyle, type StyleProp } from "react-native";

import { palette } from "@global/constants/palette";

// マスコット素材は手描きインクの透過 PNG。サイズ・回転・不透明度が画面ごとに
// 変わるため、ここだけ style プロップで受ける（adr/0016 の逃げ道）。

const pawSource = require("@/assets/images/chalo_paw_print.png");
const faceSource = require("@/assets/images/chalo_face.png");

const PAW_ASPECT = 447 / 423;
const FACE_ASPECT = 990 / 399;

type PawPrintProps = {
  size: number;
  opacity?: number;
  rotate?: string;
  /** 暗色背景で使うときに明色（linen）へ反転する */
  light?: boolean;
  style?: StyleProp<ImageStyle>;
};

// チャロくんの足あと（空状態・カード装飾・おしまい一覧の行頭）。
export function PawPrint({
  size,
  opacity = 1,
  rotate,
  light = false,
  style,
}: PawPrintProps) {
  return (
    <Image
      source={pawSource}
      style={[
        {
          width: size,
          height: size / PAW_ASPECT,
          opacity,
          tintColor: light ? palette.linen : undefined,
          transform: rotate ? [{ rotate }] : undefined,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

type ChaloFaceProps = {
  width: number;
  opacity?: number;
  style?: StyleProp<ImageStyle>;
};

// チャロくんの顔（空状態・お祝い画面・ペア成立）。
export function ChaloFace({ width, opacity = 1, style }: ChaloFaceProps) {
  return (
    <Image
      source={faceSource}
      style={[{ width, height: width / FACE_ASPECT, opacity }, style]}
      resizeMode="contain"
    />
  );
}
