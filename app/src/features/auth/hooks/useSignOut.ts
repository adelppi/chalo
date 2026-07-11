import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "./AuthProvider";

// サインアウト。サーバ状態のキャッシュを破棄する。
// サインイン画面への遷移は AuthProvider の onAuthStateChange が担う。
export function useSignOut() {
  const { authRepository } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authRepository.signOut(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
