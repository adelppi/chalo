import { useCallback, useState } from "react";

/**
 * pull-to-refresh の RefreshControl 状態。
 * マウント・復帰時の裏の再取得ではインジケータを出さず、
 * ユーザーが引っ張った時だけ出す（Issue #22 の受け入れ条件）。
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
