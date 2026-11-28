import { describe, expect, it } from "@jest/globals";

import {
  buildReport,
  diffAppConfig,
  diffDependencies,
  diffLists,
  extractExternalUrls,
  parseNameStatus,
} from "./legal-impact";

describe("diffDependencies", () => {
  it("追加・削除は名前を返し、版だけの変更は件数だけ返す", () => {
    const before = { expo: "~57.0.1", "expo-camera": "~57.0.0", zustand: "^5" };
    const after = {
      expo: "~57.0.2",
      zustand: "^5",
      "@sentry/react-native": "^7",
    };

    expect(diffDependencies(before, after)).toEqual({
      added: [{ name: "@sentry/react-native", version: "^7" }],
      removed: ["expo-camera"],
      versionChangedCount: 1,
    });
  });

  it("どちらかが無くても落ちない", () => {
    expect(diffDependencies(undefined, { a: "1" })).toEqual({
      added: [{ name: "a", version: "1" }],
      removed: [],
      versionChangedCount: 0,
    });
  });
});

describe("diffAppConfig", () => {
  const base = {
    ios: { infoPlist: { ITSAppUsesNonExemptEncryption: false } },
    plugins: [
      "expo-router",
      [
        "expo-calendar",
        {
          calendarPermission: "カレンダーに追加するため",
          remindersPermission: false,
        },
      ],
    ],
  };

  it("変化が無ければすべて空", () => {
    expect(diffAppConfig(base, structuredClone(base))).toEqual({
      plugins: { added: [], removed: [], changed: [] },
      infoPlist: { added: [], removed: [], changed: [] },
      permissionTexts: [],
    });
  });

  it("オプションのキーの順序だけの違いは変化とみなさない", () => {
    const reordered = {
      ...base,
      plugins: [
        "expo-router",
        [
          "expo-calendar",
          {
            remindersPermission: false,
            calendarPermission: "カレンダーに追加するため",
          },
        ],
      ],
    };
    expect(diffAppConfig(base, reordered).plugins.changed).toEqual([]);
  });

  it("plugin の追加・削除と、追加された plugin の権限の文言を拾う", () => {
    const after = {
      ...base,
      plugins: [
        [
          "expo-calendar",
          {
            calendarPermission: "カレンダーに追加するため",
            remindersPermission: false,
          },
        ],
        [
          "expo-location",
          { locationWhenInUsePermission: "近くの場所を出すため" },
        ],
      ],
    };
    const result = diffAppConfig(base, after);

    expect(result.plugins).toEqual({
      added: ["expo-location"],
      removed: ["expo-router"],
      changed: [],
    });
    expect(result.permissionTexts).toEqual([
      {
        plugin: "expo-location",
        key: "locationWhenInUsePermission",
        before: undefined,
        after: "近くの場所を出すため",
      },
    ]);
  });

  it("権限の文言の変更と、false から文言への切り替えを拾う", () => {
    const after = {
      ...base,
      plugins: [
        "expo-router",
        [
          "expo-calendar",
          {
            calendarPermission: "予定を書き込むため",
            remindersPermission: "リマインダーのため",
          },
        ],
      ],
    };
    const result = diffAppConfig(base, after);

    expect(result.plugins.changed).toEqual(["expo-calendar"]);
    expect(result.permissionTexts).toEqual([
      {
        plugin: "expo-calendar",
        key: "calendarPermission",
        before: "カレンダーに追加するため",
        after: "予定を書き込むため",
      },
      {
        plugin: "expo-calendar",
        key: "remindersPermission",
        before: false,
        after: "リマインダーのため",
      },
    ]);
  });

  it("権限以外のオプションの変更は plugin の変更としてだけ拾う", () => {
    const before = { plugins: [["expo-splash-screen", { imageWidth: 76 }]] };
    const after = { plugins: [["expo-splash-screen", { imageWidth: 80 }]] };
    const result = diffAppConfig(before, after);

    expect(result.plugins.changed).toEqual(["expo-splash-screen"]);
    expect(result.permissionTexts).toEqual([]);
  });

  it("infoPlist の追加・削除・変更を拾う", () => {
    const after = {
      ...base,
      ios: {
        infoPlist: {
          ITSAppUsesNonExemptEncryption: true,
          NSCameraUsageDescription: "写真を撮るため",
        },
      },
    };
    expect(diffAppConfig(base, after).infoPlist).toEqual({
      added: ["NSCameraUsageDescription"],
      removed: [],
      changed: ["ITSAppUsesNonExemptEncryption"],
    });
    expect(
      diffAppConfig(after, { ...base, ios: {} }).infoPlist.removed,
    ).toEqual(["ITSAppUsesNonExemptEncryption", "NSCameraUsageDescription"]);
  });
});

describe("parseNameStatus", () => {
  it("追加・変更・削除・名前変更を読み分ける", () => {
    const text = [
      "A\tapp/supabase/migrations/20261201000000_create_photos.sql",
      "M\tapp/supabase/functions/notify-plan-created/index.ts",
      "D\tapp/supabase/functions/old/index.ts",
      "R087\tapp/supabase/functions/a/index.ts\tapp/supabase/functions/b/index.ts",
      "",
    ].join("\n");

    expect(parseNameStatus(text)).toEqual([
      {
        status: "追加",
        path: "app/supabase/migrations/20261201000000_create_photos.sql",
      },
      {
        status: "変更",
        path: "app/supabase/functions/notify-plan-created/index.ts",
      },
      { status: "削除", path: "app/supabase/functions/old/index.ts" },
      { status: "名前変更", path: "app/supabase/functions/b/index.ts" },
    ]);
  });

  it("空の出力では空を返す", () => {
    expect(parseNameStatus("")).toEqual([]);
  });
});

describe("extractExternalUrls", () => {
  it("URL を重複なく名前順で取り出す", () => {
    const text = [
      'const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";',
      '  terms: "https://adelppi.github.io/chalo/legal/terms.html",',
      "fetch(`https://exp.host/--/api/v2/push/send`)",
    ].join("\n");

    expect(extractExternalUrls(text)).toEqual([
      "https://adelppi.github.io/chalo/legal/terms.html",
      "https://exp.host/--/api/v2/push/send",
    ]);
  });

  it("ホスト名の無いプレースホルダは URL とみなさない", () => {
    expect(extractExternalUrls('placeholder="https://…"')).toEqual([]);
  });
});

describe("diffLists", () => {
  it("増えたもの・減ったものを返す", () => {
    expect(diffLists(["a", "b"], ["b", "c"])).toEqual({
      added: ["c"],
      removed: ["a"],
    });
  });
});

describe("buildReport", () => {
  const empty = {
    from: "v1.3.0",
    to: "HEAD",
    dependencies: { added: [], removed: [], versionChangedCount: 0 },
    appConfig: {
      plugins: { added: [], removed: [], changed: [] },
      infoPlist: { added: [], removed: [], changed: [] },
      permissionTexts: [],
    },
    supabase: [],
    urls: { added: [], removed: [] },
  };

  it("変化が無ければ候補は0件で、各節に「変更なし」と書く", () => {
    const { candidateCount, markdown } = buildReport(empty);

    expect(candidateCount).toBe(0);
    expect(markdown).toContain("## 法的文書の見直し(v1.3.0..HEAD)");
    expect(markdown.match(/- 変更なし/g)).toHaveLength(4);
    expect(markdown).toContain("見直しの候補は無い。");
  });

  it("dependencies の版だけの変更は参考として書き、候補に数えない", () => {
    const { candidateCount, markdown } = buildReport({
      ...empty,
      dependencies: { added: [], removed: [], versionChangedCount: 12 },
    });

    expect(candidateCount).toBe(0);
    expect(markdown).toContain("- (参考)版だけ変わった: 12 件");
  });

  it("各節の変化を候補として数え、一覧にする", () => {
    const { candidateCount, markdown } = buildReport({
      ...empty,
      dependencies: {
        added: [{ name: "@sentry/react-native", version: "^7" }],
        removed: [],
        versionChangedCount: 0,
      },
      appConfig: {
        ...empty.appConfig,
        permissionTexts: [
          {
            plugin: "expo-location",
            key: "locationWhenInUsePermission",
            before: undefined,
            after: "近くの場所",
          },
        ],
      },
      supabase: [{ status: "追加", path: "app/supabase/migrations/x.sql" }],
      urls: { added: ["https://sentry.io/api"], removed: [] },
    });

    expect(candidateCount).toBe(4);
    expect(markdown).toContain("- 追加: `@sentry/react-native` ^7");
    expect(markdown).toContain(
      '- 権限の文言: `expo-location` の `locationWhenInUsePermission`: (なし) → "近くの場所"',
    );
    expect(markdown).toContain("- 追加: `app/supabase/migrations/x.sql`");
    expect(markdown).toContain("- 追加: https://sentry.io/api");
    expect(markdown).toContain("見直しの候補が 4 件ある。");
  });
});
