import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Gallery from "react-native-awesome-gallery";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@global/components/ui";
import { palette } from "@global/constants/palette";

import { formatPhotoCounter, formatTakenAt } from "../model/format";
import type { Photo } from "../model/types";

// フルスクリーン写真ビューワー（Claude Design 6b）。
// ズーム・横スワイプ・下スワイプで閉じるはライブラリが持ち、その上に chalo の
// クロム（閉じる・カウンター・撮影時刻）を重ねる（adr/0023）。

/** 暗背景の上に置く linen。デザインの rgba(241,234,218,x) をトークンから作る */
const ON_INK = {
  full: palette.linen,
  circle: "rgba(241, 234, 218, 0.12)",
  caption: "rgba(241, 234, 218, 0.6)",
};

type PhotoViewerProps = {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
};

export function PhotoViewer({
  photos,
  initialIndex,
  onClose,
}: PhotoViewerProps) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const current = photos[index];
  const takenAt = current ? formatTakenAt(current.takenAt) : null;

  return (
    <Modal
      visible
      animationType="fade"
      // fullScreen（不透明）にすると、下のクロムが画面上端にも二重に描かれる。
      // transparent + overFullScreen なら起きない（背景は中の View が ink で塗る）
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      {/* Gallery が内側で GestureHandlerRootView を描くため（Modal はネイティブの別ビュー
          階層に載るので root が要る）、ここで重ねて敷かない。二重にすると本文が二重に描かれる。 */}
      <View testID="photo-viewer" className="flex-1 bg-ink">
        {/* アプリ本体は dark（暗い文字）だが、ここは ink 背景なので light に反転する */}
        <StatusBar style="light" />
        <View style={StyleSheet.absoluteFill}>
          <Gallery
            // ライブラリ既定の背景は黒。chalo の ink を見せるため透明にする
            style={{ backgroundColor: "transparent" }}
            data={photos}
            keyExtractor={(photo) => photo.id}
            initialIndex={initialIndex}
            onIndexChange={setIndex}
            onSwipeToClose={onClose}
            renderItem={({ item, setImageDimensions }) => (
              <Image
                source={{ uri: item.id }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                // 実寸をライブラリへ渡してズーム範囲・はみ出し判定を正しくする
                onLoad={({ source }) =>
                  setImageDimensions({
                    width: source.width,
                    height: source.height,
                  })
                }
                // 端末ライブラリの写真はアプリ側に残さない（adr/0013）
                cachePolicy="none"
              />
            )}
          />
        </View>

        {/* 上：閉じる＋カウンター。右は閉じるボタンと同じ幅の余白でカウンターを中央に保つ */}
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Pressable
            testID="photo-viewer-close-button"
            accessibilityLabel="閉じる"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: ON_INK.circle }}
          >
            <Icon name="chevron-down" size={18} color={ON_INK.full} />
          </Pressable>
          <Text className="text-sm font-medium text-linen">
            {formatPhotoCounter(index, photos.length)}
          </Text>
          <View className="h-10 w-10" />
        </View>

        {/* 下：撮影時刻（Issue #94 でページドットとスワイプの案内は外した） */}
        {takenAt ? (
          <View
            pointerEvents="none"
            className="absolute inset-x-0 bottom-0 flex-row items-center justify-center gap-1.5 px-6"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <Icon name="clock" size={12} color={ON_INK.caption} />
            <Text
              className="text-xs font-medium"
              style={{ color: ON_INK.caption }}
            >
              {takenAt}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
