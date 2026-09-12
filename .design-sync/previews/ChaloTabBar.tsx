import { ChaloTabBar } from "chalo-ds";

// expo-router(react-navigation) の tabBar プロップに渡される形。
// タブ名・タイトルは app/src/app/(app)/(tabs)/_layout.tsx が正。
const ROUTES = [
  { key: "index-1", name: "index", title: "プラン" },
  { key: "done-1", name: "done", title: "おわったプラン" },
  { key: "settings-1", name: "settings", title: "設定" },
];

const navigation = {
  emit: () => ({ defaultPrevented: false }),
  navigate: () => {},
} as any;

const descriptors = Object.fromEntries(
  ROUTES.map((r) => [r.key, { options: { title: r.title } }]),
) as any;

const frame = { width: 360, background: "#F1EADA", borderRadius: 20, overflow: "hidden" as const };

function Bar({ index }: { index: number }) {
  return (
    <ChaloTabBar
      state={{ index, routes: ROUTES.map(({ key, name }) => ({ key, name })) } as any}
      descriptors={descriptors}
      navigation={navigation}
    />
  );
}

export const PlansSelected = () => (
  <div style={frame}>
    <Bar index={0} />
  </div>
);

export const DoneSelected = () => (
  <div style={frame}>
    <Bar index={1} />
  </div>
);

export const SettingsSelected = () => (
  <div style={frame}>
    <Bar index={2} />
  </div>
);
