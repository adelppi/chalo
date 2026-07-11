import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "./AuthProvider";
import { completeSignIn } from "./completeSignIn";

// Apple サインイン。成功時に profiles 行を用意する。
// 認証状態の反映は AuthProvider の onAuthStateChange が担う。
export function useSignInWithApple() {
  const { authRepository, profileRepository } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      const result = await authRepository.signInWithApple();
      if (!result) {
        return; // ユーザーが中断。
      }
      await completeSignIn(result, profileRepository);
    },
  });
}
