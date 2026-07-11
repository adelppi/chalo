import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { queryClient } from "@global/config/queryClient";
import { supabase } from "@global/lib/supabase";

export default function RootLayout() {
  useEffect(() => {
    supabase.auth.getSession().catch((error: unknown) => {
      console.error("Supabase getSession failed", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack />
    </QueryClientProvider>
  );
}
