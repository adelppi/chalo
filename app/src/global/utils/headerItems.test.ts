import { describe, expect, it, jest } from "@jest/globals";

import { palette } from "../constants/palette";
import { backHeaderOptions, iconHeaderItem } from "./headerItems";

describe("iconHeaderItem", () => {
  it("SF Symbol 指定・sharesBackground: false のボタンを返す", () => {
    const onPress = jest.fn();
    const item = iconHeaderItem({
      symbol: "pencil",
      onPress,
      accessibilityLabel: "編集",
    });

    expect(item).toMatchObject({
      type: "button",
      label: "",
      accessibilityLabel: "編集",
      icon: { type: "sfSymbol", name: "pencil" },
      sharesBackground: false,
    });
    expect(item.type === "button" && item.onPress).toBe(onPress);
  });

  it("tintColor・disabled を渡せる", () => {
    const item = iconHeaderItem({
      symbol: "trash",
      onPress: jest.fn(),
      accessibilityLabel: "削除",
      tintColor: "#A8574F",
      disabled: true,
    });

    expect(item).toMatchObject({ tintColor: "#A8574F", disabled: true });
  });
});

describe("backHeaderOptions", () => {
  it("戻るボタンのみを headerLeftItems に積む", () => {
    const onBack = jest.fn();
    const options = backHeaderOptions({ onBack });

    expect(options.headerShown).toBe(true);
    expect(options.title).toBe("");
    expect(options.headerBackVisible).toBe(false);
    // largeTitle 未指定なら大タイトルは無効
    expect(options.headerLargeTitleEnabled).toBeUndefined();

    const leftItems = options.unstable_headerLeftItems?.({});
    expect(leftItems).toHaveLength(1);
    expect(leftItems?.[0]).toMatchObject({
      accessibilityLabel: "戻る",
      icon: { type: "sfSymbol", name: "chevron.left" },
    });
    expect(leftItems?.[0].type === "button" && leftItems[0].onPress).toBe(
      onBack,
    );

    expect(options.unstable_headerRightItems).toBeUndefined();
  });

  it("right を渡すと headerRightItems に反映される", () => {
    const editItem = iconHeaderItem({
      symbol: "pencil",
      onPress: jest.fn(),
      accessibilityLabel: "編集",
    });
    const deleteItem = iconHeaderItem({
      symbol: "trash",
      onPress: jest.fn(),
      accessibilityLabel: "削除",
    });

    const options = backHeaderOptions({
      onBack: jest.fn(),
      right: [editItem, deleteItem],
    });

    expect(options.unstable_headerRightItems?.({})).toEqual([
      editItem,
      deleteItem,
    ]);
  });

  it("largeTitle を渡すと iOS 純正の大タイトルを有効化しタイトルに設定する", () => {
    const options = backHeaderOptions({
      onBack: jest.fn(),
      largeTitle: "たこ焼きパーティー",
    });

    expect(options.title).toBe("たこ焼きパーティー");
    expect(options.headerLargeTitleEnabled).toBe(true);
    // 大タイトル部の背景も linen に統一し、影は出さない
    expect(options.headerLargeStyle).toMatchObject({
      backgroundColor: palette.linen,
    });
    expect(options.headerLargeTitleShadowVisible).toBe(false);
    // 純正の既定スタイルに合わせるため、フォント・色は上書きしない
    expect(options.headerLargeTitleStyle).toBeUndefined();
  });
});
