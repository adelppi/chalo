import { describe, expect, it } from "@jest/globals";

import {
  type PlanRowWithNames,
  toDomainTime,
  toInsertRow,
  toLocalDateString,
  toPlan,
  toUpdateRow,
} from "./supabasePlanMapping";

const ME = "5f0c2c74-0000-0000-0000-0000000000aa";
const PARTNER = "5f0c2c74-0000-0000-0000-0000000000bb";

/** 自分が作成者・よびかた未設定の既定の視点 */
const VIEWER = { viewerId: ME, partnerNickname: null };

function makeRow(overrides: Partial<PlanRowWithNames>): PlanRowWithNames {
  return {
    id: "5f0c2c74-0000-0000-0000-000000000001",
    pair_id: null,
    owner_id: ME,
    title: "チームラボプラネッツ",
    date: null,
    time: null,
    deadline: null,
    place_name: null,
    place_lat: null,
    place_lng: null,
    reference_url: null,
    memo: null,
    closed_at: null,
    locked_by: null,
    locked_at: null,
    created_at: "2026-07-01T03:00:00+00:00",
    updated_at: "2026-07-01T03:00:00+00:00",
    owner: { display_name: "ゆい" },
    locker: null,
    ...overrides,
  };
}

describe("toDomainTime", () => {
  it("Postgres の HH:MM:SS を HH:mm へ丸める", () => {
    expect(toDomainTime("10:00:00")).toBe("10:00");
    expect(toDomainTime("09:05:30")).toBe("09:05");
  });

  it("null はそのまま", () => {
    expect(toDomainTime(null)).toBeNull();
  });
});

describe("toLocalDateString", () => {
  it("端末タイムゾーンの日付になる（深夜でも日付がずれない）", () => {
    // 端末ローカルの 2026-07-13 23:30 を ISO（UTC）にして往復させる
    const iso = new Date(2026, 6, 13, 23, 30).toISOString();
    expect(toLocalDateString(iso)).toBe("2026-07-13");
  });

  it("月・日をゼロ埋めする", () => {
    const iso = new Date(2026, 0, 5, 12, 0).toISOString();
    expect(toLocalDateString(iso)).toBe("2026-01-05");
  });
});

describe("toPlan", () => {
  it("行をドメイン型へ変換する（snake_case → camelCase・time 丸め）", () => {
    const row = makeRow({
      date: "2026-07-15",
      time: "10:00:00",
      deadline: "2026-07-14",
      place_name: "豊洲",
      reference_url: "https://example.com",
      memo: "チケットは前日までに",
      closed_at: "2026-07-10",
    });
    expect(toPlan(row, VIEWER)).toEqual({
      id: row.id,
      title: "チームラボプラネッツ",
      date: "2026-07-15",
      time: "10:00",
      deadline: "2026-07-14",
      placeName: "豊洲",
      referenceUrl: "https://example.com",
      memo: "チケットは前日までに",
      closedAt: "2026-07-10",
      ownerName: "ゆい",
      lockedBy: null,
      lockedAt: null,
      lockedByName: null,
      createdAt: toLocalDateString(row.created_at),
    });
  });

  it("locked_by / locked_at を行のまま写す（TTL 判定は model/editLock が担う）", () => {
    const row = makeRow({
      locked_by: PARTNER,
      locked_at: "2026-07-14T12:00:00+00:00",
      locker: { display_name: "そうた" },
    });
    const plan = toPlan(row, VIEWER);
    expect(plan.lockedBy).toBe(PARTNER);
    expect(plan.lockedAt).toBe("2026-07-14T12:00:00+00:00");
  });

  it("owner が読めない行は ownerName を空欄にする", () => {
    expect(toPlan(makeRow({ owner: null }), VIEWER).ownerName).toBe("");
  });

  it("locked_by があり locker が読めれば表示名を解決する", () => {
    const row = makeRow({
      locked_by: PARTNER,
      locker: { display_name: "そうた" },
    });
    expect(toPlan(row, VIEWER).lockedByName).toBe("そうた");
  });

  it("locked_by があっても locker が読めなければ null", () => {
    const row = makeRow({
      locked_by: PARTNER,
      locker: null,
    });
    expect(toPlan(row, VIEWER).lockedByName).toBeNull();
  });

  it("相手が作成者なら、よびかたを作成者名に使う（domain/pairing.md）", () => {
    const row = makeRow({
      owner_id: PARTNER,
      owner: { display_name: "そうた" },
    });
    expect(
      toPlan(row, { viewerId: ME, partnerNickname: "そうちゃん" }).ownerName,
    ).toBe("そうちゃん");
  });

  it("自分が作成者なら、よびかたを設定していても自分の表示名のまま", () => {
    const row = makeRow({ owner_id: ME, owner: { display_name: "ゆい" } });
    expect(
      toPlan(row, { viewerId: ME, partnerNickname: "そうちゃん" }).ownerName,
    ).toBe("ゆい");
  });

  it("相手がロック中なら、よびかたを lockedByName に使う", () => {
    const row = makeRow({
      locked_by: PARTNER,
      locker: { display_name: "そうた" },
    });
    expect(
      toPlan(row, { viewerId: ME, partnerNickname: "そうちゃん" }).lockedByName,
    ).toBe("そうちゃん");
  });
});

describe("toInsertRow", () => {
  it("owner_id を本人で埋め、pair_id は入れない（ソロ時は null のまま）", () => {
    const row = toInsertRow(
      {
        title: "花火大会",
        date: "2026-08-01",
        time: "19:00",
        deadline: null,
        referenceUrl: null,
        memo: null,
      },
      "owner-uuid",
    );
    expect(row).toEqual({
      owner_id: "owner-uuid",
      title: "花火大会",
      date: "2026-08-01",
      time: "19:00",
      deadline: null,
      reference_url: null,
      memo: null,
    });
    expect("pair_id" in row).toBe(false);
  });
});

describe("toUpdateRow", () => {
  it("フォームの列だけを更新し、owner_id や closed_at は触らない", () => {
    const row = toUpdateRow({
      title: "花火大会",
      date: null,
      time: null,
      deadline: "2026-08-10",
      referenceUrl: "https://example.com",
      memo: "浴衣",
    });
    expect(row).toEqual({
      title: "花火大会",
      date: null,
      time: null,
      deadline: "2026-08-10",
      reference_url: "https://example.com",
      memo: "浴衣",
    });
    expect("owner_id" in row).toBe(false);
    expect("closed_at" in row).toBe(false);
  });
});
