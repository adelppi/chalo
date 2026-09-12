import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { PawPrint } from "@global/components/shared";
import { Button } from "@global/components/ui";

import {
  useExpandPhotoAccess,
  usePhotoPermission,
  useRequestPhotoPermission,
} from "../hooks/usePhotoPermission";
import { useAlbumPhotos } from "../hooks/useAlbumPhotos";
import {
  ALBUM_COLUMNS,
  ALBUM_GRID_GAP,
  ALBUM_SKELETON_COUNT,
  albumEmptyReason,
  albumTileSize,
  type AlbumEmptyReason,
} from "../model/grid";
import type { DateRange, Photo } from "../model/types";
import { PhotoViewer } from "./PhotoViewer";

// 自動アルバム（Claude Design 6a / 6c / 6d）。おしまいになったプランの詳細で、
// メモ・参考URLの下に見出し無しで並ぶ（写真が自分で語るため。domain/album.md）。
// 呼び出し側は「アルバム対象日の区間」だけを渡す。プランのことはここでは知らない。

/** グリッドの左右余白。詳細画面のカード（mx-6）に合わせる */
const GRID_HORIZONTAL_MARGIN = 24;
/** タイルの角丸。デザイントークン rounded-chip と同値（幅が実行時計算のため style で当てる） */
const TILE_RADIUS = 10;
/** スケルトンの脈動（Claude Design 6d の chaloPulse 1.6s と列ごと 0.2s ずらし） */
const SKELETON_PULSE_MS = 1600;
const SKELETON_STAGGER_MS = 200;

type PlanAlbumProps = {
  range: DateRange;
};

export function PlanAlbum({ range }: PlanAlbumProps) {
  const { width } = useWindowDimensions();
  const tileSize = albumTileSize(width - GRID_HORIZONTAL_MARGIN * 2);

  const { data: permission, isPending: permissionPending } =
    usePhotoPermission();
  const { data: photos, isPending: photosPending } = useAlbumPhotos(
    range,
    permission,
  );

  const granted = permission === "all" || permission === "limited";
  // 権限が未確定の間と、許可ずみで取得中の間はスケルトン（6d）。
  // 未許可のときは取得自体を走らせないので、そのまま空表示の分岐へ落とす。
  if (permissionPending || (granted && photosPending)) {
    return <AlbumSkeleton tileSize={tileSize} />;
  }

  const reason = albumEmptyReason(
    permission ?? "undetermined",
    photos?.length ?? 0,
  );
  if (reason !== "none") {
    return <AlbumEmptyState reason={reason} />;
  }

  return <AlbumGrid photos={photos ?? []} tileSize={tileSize} />;
}

function AlbumGrid({
  photos,
  tileSize,
}: {
  photos: Photo[];
  tileSize: number;
}) {
  // タップした写真からビューワーを開く。閉じるまで index を持つのはビューワー側
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <>
      <View
        testID="plan-album-grid"
        className="mx-6 mt-5 flex-row flex-wrap"
        style={{ gap: ALBUM_GRID_GAP }}
      >
        {photos.map((photo, index) => (
          <Pressable
            key={photo.id}
            testID={`plan-album-tile-${index}`}
            onPress={() => setViewerIndex(index)}
            style={{ width: tileSize, height: tileSize }}
            className="active:opacity-70"
          >
            <Image
              source={{ uri: photo.id }}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: TILE_RADIUS,
              }}
              contentFit="cover"
              // 端末ライブラリの写真はアプリ側に残さない（adr/0013）
              cachePolicy="none"
            />
          </Pressable>
        ))}
      </View>

      {viewerIndex !== null ? (
        <PhotoViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </>
  );
}

// 6d 読み込み中。写真はキャッシュしないため表示のたびにここを通る。
function AlbumSkeleton({ tileSize }: { tileSize: number }) {
  return (
    <View
      testID="plan-album-skeleton"
      className="mx-6 mt-5 flex-row flex-wrap"
      style={{ gap: ALBUM_GRID_GAP }}
    >
      {Array.from({ length: ALBUM_SKELETON_COUNT }, (_, index) => (
        <SkeletonTile
          key={index}
          size={tileSize}
          delay={(index % ALBUM_COLUMNS) * SKELETON_STAGGER_MS}
        />
      ))}
    </View>
  );
}

// wheat のタイルを淡く脈打たせる（Claude Design 6d）。列ごとに位相をずらす。
// マスコットのアニメーション禁止（adr/0010）はチャロくんの話で、読み込み表示は対象外。
function SkeletonTile({ size, delay }: { size: number; delay: number }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: SKELETON_PULSE_MS / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: SKELETON_PULSE_MS / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      className="bg-wheat"
      style={{
        width: size,
        height: size,
        borderRadius: TILE_RADIUS,
        opacity,
      }}
    />
  );
}

type EmptyStateCopy = {
  title: string;
  body: string;
  action?: { label: string; testID: string };
};

// 6c 空表示。責めない文言で、足跡だけ置く（domain/album.md「エラー・空状態」）。
const COPY_BY_REASON: Record<
  Exclude<AlbumEmptyReason, "none">,
  EmptyStateCopy
> = {
  "no-photos": {
    title: "この日の写真はありません",
    body: "カメラを出さなかった日も、ふたりの思い出です。",
  },
  limited: {
    title: "この日の写真は見つかりませんでした",
    body: "chalo が見られる写真が、選んだぶんだけに限られています。",
    action: { label: "写真を選びなおす", testID: "plan-album-expand-button" },
  },
  denied: {
    title: "写真をよみこめません",
    body: "iOS の設定で写真へのアクセスを許可すると、この日の写真が並びます。",
    action: { label: "設定をひらく", testID: "plan-album-settings-button" },
  },
  undetermined: {
    title: "この日の写真をここに並べます",
    body: "端末の写真から、この日に撮ったものだけを自動で集めます。どこにもアップロードしません。",
    action: { label: "写真を許可する", testID: "plan-album-allow-button" },
  },
};

function AlbumEmptyState({
  reason,
}: {
  reason: Exclude<AlbumEmptyReason, "none">;
}) {
  const requestPermission = useRequestPhotoPermission();
  const expandAccess = useExpandPhotoAccess();
  const copy = COPY_BY_REASON[reason];

  const handlePress = () => {
    if (reason === "undetermined") {
      requestPermission.mutate();
    } else if (reason === "limited") {
      expandAccess.mutate();
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View testID="plan-album-empty" className="mt-7 items-center px-10">
      <PawPrint size={40} opacity={0.22} rotate="-14deg" />
      <Text className="mt-3.5 text-center text-[15px] font-medium text-ink">
        {copy.title}
      </Text>
      <Text className="mt-2 text-center text-[13px] font-medium leading-6 text-taupe">
        {copy.body}
      </Text>
      {copy.action ? (
        <View className="mt-4">
          <Button
            testID={copy.action.testID}
            label={copy.action.label}
            size="sm"
            onPress={handlePress}
            disabled={requestPermission.isPending || expandAccess.isPending}
            className="px-7"
          />
        </View>
      ) : null}
    </View>
  );
}
