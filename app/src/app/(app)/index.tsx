import { Alert, Pressable, Text, View } from "react-native";

import { useSignOut } from "@features/auth";

// やりたい一覧（ホーム）のプレースホルダ。中身は別 Issue で実装する。
// サインアウトの動作確認のためのボタンを暫定で置く。
export default function Home() {
  const signOut = useSignOut();

  return (
    <View
      testID="home-screen"
      className="flex-1 items-center justify-center bg-white px-8"
    >
      <Text className="text-2xl font-bold text-neutral-900">やりたい一覧</Text>
      <Text className="mt-3 text-center text-base text-neutral-500">
        ここに「いつか行きたい所・やりたい事」が並びます
      </Text>

      <Pressable
        testID="home-sign-out-button"
        onPress={() =>
          signOut.mutate(undefined, {
            onError: (error) => {
              console.error("サインアウトに失敗しました", error);
              Alert.alert(
                "サインアウトに失敗しました",
                "時間をおいて、もう一度お試しください。",
              );
            },
          })
        }
        disabled={signOut.isPending}
        className="mt-12 h-11 items-center justify-center rounded-xl border border-neutral-300 px-6 active:opacity-70"
        style={signOut.isPending ? { opacity: 0.5 } : undefined}
      >
        <Text className="text-base font-medium text-neutral-700">
          サインアウト
        </Text>
      </Pressable>
    </View>
  );
}
