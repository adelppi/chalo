import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthContext } from "./AuthProvider";

// アカウント削除（domain/pairing.md・adr/0018）。
// 成功するとサーバ側の退会処理とローカルサインアウトまで済んでいるため、
// サーバ状態のキャッシュを破棄する。サインイン画面への遷移は
// AuthProvider の onAuthStateChange（protected routes）が担う。
// 戻り値 false は「Apple の再認証をユーザーが中断した」＝削除していない。
export function useDeleteAccount() {
  const { authRepository } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authRepository.deleteAccount(),
    onSuccess: (deleted) => {
      if (deleted) {
        queryClient.clear();
      }
    },
  });
}
