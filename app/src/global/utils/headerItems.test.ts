import { describe, expect, it, jest } from "@jest/globals";

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
});
