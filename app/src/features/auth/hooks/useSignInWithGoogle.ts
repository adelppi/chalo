import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "./AuthProvider";
import { completeSignIn } from "./completeSignIn";

// Google サインイン。成功時に profiles 行を用意する。
// 認証状態の反映（サインイン済みへの遷移）は AuthProvider の onAuthStateChange が担う。
export function useSignInWithGoogle() {
  const { authRepository, profileRepository } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      const result = await authRepository.signInWithGoogle();
      if (!result) {
        return; // ユーザーが中断。
      }
      await completeSignIn(result, profileRepository);
    },
  });
}
