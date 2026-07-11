import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function GoogleSignInButton({ onPress, disabled, loading }: Props) {
  return (
    <Pressable
      testID="auth-sign-in-google-button"
      onPress={onPress}
      disabled={disabled}
      className="h-12 w-full flex-row items-center justify-center rounded-xl border border-neutral-300 bg-white active:opacity-70"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      {loading ? (
        <ActivityIndicator color="#111827" />
      ) : (
        <Text className="text-base font-semibold text-neutral-900">
          Google でサインイン
        </Text>
      )}
    </Pressable>
  );
}
