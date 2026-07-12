import { Text, View } from "react-native";

type AvatarProps = {
  /** 表示する頭文字（例：「ゆ」） */
  initial: string;
  tone?: "camel" | "plum";
  size?: number;
};

// 頭文字の丸アバター（D-1 作成者表示・B-5 ペア成立）。
export function Avatar({ initial, tone = "camel", size = 22 }: AvatarProps) {
  const toneClass = tone === "camel" ? "bg-camel" : "bg-plum";
  const textClass = tone === "camel" ? "text-paper" : "text-blush";

  return (
    <View
      className={`items-center justify-center rounded-full ${toneClass}`}
      style={{ width: size, height: size }}
    >
      <Text
        className={`font-zen-bold ${textClass}`}
        style={{ fontSize: size * 0.45 }}
      >
        {initial}
      </Text>
    </View>
  );
}
