// Supabase の DB スキーマから自動生成した型。
// 生成コマンド: `supabase gen types typescript --project-id <ref>`(または Supabase MCP)。
// スキーマを変更したら再生成する。手で編集しない。

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bug_reports: {
        Row: {
          app_version: string;
          comment: string | null;
          created_at: string;
          device_model: string;
          id: string;
          logs: string;
          os_version: string;
          profile_id: string;
        };
        Insert: {
          app_version: string;
          comment?: string | null;
          created_at?: string;
          device_model: string;
          id?: string;
          logs: string;
          os_version: string;
          profile_id: string;
        };
        Update: {
          app_version?: string;
          comment?: string | null;
          created_at?: string;
          device_model?: string;
          id?: string;
          logs?: string;
          os_version?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bug_reports_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invites: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string;
          inviter_id: string;
          used_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          expires_at: string;
          inviter_id: string;
          used_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string;
          inviter_id?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invites_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pairs: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          closed_at: string | null;
          created_at: string;
          date: string | null;
          deadline: string | null;
          id: string;
          locked_at: string | null;
          locked_by: string | null;
          memo: string | null;
          owner_id: string;
          pair_id: string | null;
          place_lat: number | null;
          place_lng: number | null;
          place_name: string | null;
          reference_url: string | null;
          time: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string;
          date?: string | null;
          deadline?: string | null;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          memo?: string | null;
          owner_id: string;
          pair_id?: string | null;
          place_lat?: number | null;
          place_lng?: number | null;
          place_name?: string | null;
          reference_url?: string | null;
          time?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string;
          date?: string | null;
          deadline?: string | null;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          memo?: string | null;
          owner_id?: string;
          pair_id?: string | null;
          place_lat?: number | null;
          place_lng?: number | null;
          place_name?: string | null;
          reference_url?: string | null;
          time?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plans_locked_by_fkey";
            columns: ["locked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plans_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plans_pair_id_fkey";
            columns: ["pair_id"];
            isOneToOne: false;
            referencedRelation: "pairs";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          pair_id: string | null;
          partner_nickname: string | null;
          timezone: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          pair_id?: string | null;
          partner_nickname?: string | null;
          timezone: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          pair_id?: string | null;
          partner_nickname?: string | null;
          timezone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_pair_id_fkey";
            columns: ["pair_id"];
            isOneToOne: false;
            referencedRelation: "pairs";
            referencedColumns: ["id"];
          },
        ];
      };
      push_tokens: {
        Row: {
          expo_push_token: string;
          id: string;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          expo_push_token: string;
          id?: string;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          expo_push_token?: string;
          id?: string;
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_tokens_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_pair_id: { Args: never; Returns: string };
      delete_account_data: {
        Args: { p_attribution: string; p_profile_id: string };
        Returns: undefined;
      };
      redeem_invite_code: {
        Args: { p_code: string };
        Returns: {
          partner_id: string;
          partner_name: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
