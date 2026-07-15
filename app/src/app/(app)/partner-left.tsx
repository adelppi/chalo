import { PartnerLeftScreen } from "@features/pairing";

// パートナー消失後の全画面ロック（domain/pairing.md）。
// (app)/_layout の Stack.Protected により、partner-left 検知中はこの画面だけが表示される。
export default function PartnerLeftRoute() {
  return <PartnerLeftScreen />;
}
