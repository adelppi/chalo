import { describe, expect, it } from "@jest/globals";

import {
  buildDeletedOwnerAttribution,
  hasAppleIdentity,
  pickAppleRevokeConfig,
} from "./deletion";

describe("hasAppleIdentity", () => {
  it("apple 連携があれば true", () => {
    expect(
      hasAppleIdentity([{ provider: "google" }, { provider: "apple" }]),
    ).toBe(true);
  });

  it("apple 連携がなければ false", () => {
    expect(hasAppleIdentity([{ provider: "google" }])).toBe(false);
  });

  it("identities が null / undefined でも false", () => {
    expect(hasAppleIdentity(null)).toBe(false);
    expect(hasAppleIdentity(undefined)).toBe(false);
  });
});

describe("pickAppleRevokeConfig", () => {
  const env = {
    APPLE_TEAM_ID: "TEAM123",
    APPLE_KEY_ID: "KEY456",
    APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\n...",
    APPLE_CLIENT_ID: "com.adelppi.chalo",
  };

  it("4つ揃っていれば設定を返す", () => {
    expect(pickAppleRevokeConfig(env)).toEqual({
      teamId: "TEAM123",
      keyId: "KEY456",
      privateKey: "-----BEGIN PRIVATE KEY-----\n...",
      clientId: "com.adelppi.chalo",
    });
  });

  it("1つでも欠けていれば null", () => {
    expect(
      pickAppleRevokeConfig({ ...env, APPLE_PRIVATE_KEY: undefined }),
    ).toBeNull();
    expect(pickAppleRevokeConfig({ ...env, APPLE_TEAM_ID: "" })).toBeNull();
    expect(pickAppleRevokeConfig({})).toBeNull();
  });
});

describe("buildDeletedOwnerAttribution", () => {
  it("表示名を実名のまま埋め込む（domain/pairing.md の文言）", () => {
    expect(buildDeletedOwnerAttribution("ゆい")).toBe(
      "（このプランは ゆい（削除済み）が作成）",
    );
  });

  it("表示名が空ならフォールバック文言", () => {
    expect(buildDeletedOwnerAttribution("")).toBe(
      "（このプランは 削除済みのユーザーが作成）",
    );
    expect(buildDeletedOwnerAttribution("  ")).toBe(
      "（このプランは 削除済みのユーザーが作成）",
    );
  });
});
