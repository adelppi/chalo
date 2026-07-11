import { Stack } from "expo-router";

// サインイン済みユーザー向けの保護グループ。
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
