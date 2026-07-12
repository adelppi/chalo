import type { Plan, PlanDraft, PlanRepository } from "@features/plans";

// PlanRepository の in-memory フェイク実装（Issue #14：モック用）。
// Supabase 実装（adr/0003）ができたら合成ルートで差し替える。
// 見え方がいつ起動しても崩れないよう、日付は「今日」からの相対で生成する。

const LATENCY_MS = 250;

function sleep(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function dateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

// Claude Design の画面（C-1b・D-1・D-4・F-9）に出てくるサンプルをそのまま種にする
function seedPlans(): Plan[] {
  return [
    {
      id: "teamlab",
      title: "チームラボプラネッツ",
      date: dateFromToday(2),
      time: "10:00",
      deadline: null,
      placeName: "豊洲",
      referenceUrl: "https://instagram.com/p/teamlab_planets",
      memo: "チケットは前日までにオンラインで買っておく。水に濡れてもいい服がいいらしい！",
      closedAt: null,
      lockedByName: null,
      ownerName: "ゆい",
      createdAt: dateFromToday(-12),
    },
    {
      id: "furugi",
      title: "下北沢で古着めぐり",
      date: dateFromToday(9),
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: "お昼は前に行ったカレー屋さんにしよう。",
      closedAt: null,
      lockedByName: "そうた", // F-9 編集ロック中の見本
      ownerName: "そうた",
      createdAt: dateFromToday(-8),
    },
    {
      id: "hanabi",
      title: "花火大会",
      date: dateFromToday(23),
      time: "19:00",
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: null,
      lockedByName: null,
      ownerName: "ゆい",
      createdAt: dateFromToday(-5),
    },
    {
      id: "monet",
      title: "モネ展 みにいく",
      date: null,
      time: null,
      deadline: dateFromToday(9),
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: null,
      lockedByName: null,
      ownerName: "そうた",
      createdAt: dateFromToday(-20),
    },
    {
      id: "okutama",
      title: "奥多摩で川あそび",
      date: null,
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: null,
      lockedByName: null,
      ownerName: "ゆい",
      createdAt: dateFromToday(-15),
    },
    {
      id: "cat-cafe",
      title: "駅前の猫カフェ",
      date: null,
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: null,
      lockedByName: null,
      ownerName: "そうた",
      createdAt: dateFromToday(-3),
    },
    {
      id: "picnic",
      title: "代々木公園でピクニック",
      date: null,
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: dateFromToday(-21),
      lockedByName: null,
      ownerName: "ゆい",
      createdAt: dateFromToday(-40),
    },
    {
      id: "hotaru",
      title: "ホタルをみる",
      date: null,
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: dateFromToday(-28),
      lockedByName: null,
      ownerName: "そうた",
      createdAt: dateFromToday(-45),
    },
    {
      id: "pancake",
      title: "パンケーキの人気店",
      date: null,
      time: null,
      deadline: null,
      placeName: null,
      referenceUrl: null,
      memo: null,
      closedAt: dateFromToday(-35),
      lockedByName: null,
      ownerName: "ゆい",
      createdAt: dateFromToday(-50),
    },
  ];
}

function createFakePlanRepository(): PlanRepository {
  let plans = seedPlans();
  let nextId = 1;

  const find = (id: string): Plan | undefined =>
    plans.find((plan) => plan.id === id);

  return {
    async list() {
      await sleep();
      return plans.map((plan) => ({ ...plan }));
    },

    async get(id) {
      await sleep();
      const plan = find(id);
      return plan ? { ...plan } : null;
    },

    async create(draft: PlanDraft) {
      await sleep();
      const plan: Plan = {
        id: `new-plan-${nextId++}`,
        title: draft.title,
        date: draft.date,
        time: draft.time,
        deadline: draft.deadline,
        placeName: null,
        referenceUrl: draft.referenceUrl,
        memo: draft.memo,
        closedAt: null,
        lockedByName: null,
        ownerName: "ゆい",
        createdAt: dateFromToday(0),
      };
      plans = [...plans, plan];
      return { ...plan };
    },

    async update(id, draft) {
      await sleep();
      const plan = find(id);
      if (!plan) {
        throw new Error(`プランが見つかりません: ${id}`);
      }
      const updated: Plan = {
        ...plan,
        title: draft.title,
        date: draft.date,
        time: draft.time,
        deadline: draft.deadline,
        referenceUrl: draft.referenceUrl,
        memo: draft.memo,
      };
      plans = plans.map((p) => (p.id === id ? updated : p));
      return { ...updated };
    },

    async remove(id) {
      await sleep();
      plans = plans.filter((plan) => plan.id !== id);
    },

    async close(id, closedAt) {
      await sleep();
      const plan = find(id);
      if (!plan) {
        throw new Error(`プランが見つかりません: ${id}`);
      }
      const closed: Plan = { ...plan, closedAt };
      plans = plans.map((p) => (p.id === id ? closed : p));
      return { ...closed };
    },
  };
}

export const fakePlanRepository: PlanRepository = createFakePlanRepository();
