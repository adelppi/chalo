// 法的文書(利用規約・プライバシーポリシー・App Store のプライバシー申告)の
// 見直しが要りそうな変更を、前回のタグとの差分から拾う(docs/adr/0028)。
// I/O を持たない純粋関数だけを置き、Jest でテストする(adr/0014)。

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// キーの順序に依らない比較のため、オブジェクトのキーを並べ替えて文字列にする。
const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isPlainObject(value)) {
    const body = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const isEqual = (a, b) => stableStringify(a) === stableStringify(b);

const sortedKeys = (object) => Object.keys(object ?? {}).sort();

/**
 * 2つのオブジェクトのキーを比べ、追加・削除・値が変わったキーを返す。
 * いずれも名前順。
 */
const diffKeys = (before = {}, after = {}) => {
  const added = sortedKeys(after).filter((key) => !(key in before));
  const removed = sortedKeys(before).filter((key) => !(key in after));
  const changed = sortedKeys(after).filter(
    (key) => key in before && !isEqual(before[key], after[key]),
  );
  return { added, removed, changed };
};

/**
 * package.json の dependencies を比べる。
 *
 * 追加・削除は名前を返し、版だけ変わったものは件数だけ返す。データの扱いを
 * 変えるのは主に新しく入ったライブラリで、SDK 更新のような版上げは件数が多く
 * 本命を埋もれさせるため。
 */
exports.diffDependencies = (before = {}, after = {}) => {
  const { added, removed, changed } = diffKeys(before, after);
  return {
    added: added.map((name) => ({ name, version: after[name] })),
    removed,
    versionChangedCount: changed.length,
  };
};

/** app.json の plugins の1要素("name" か ["name", options])を name と options に分ける。 */
const normalizePlugin = (entry) =>
  Array.isArray(entry)
    ? { name: entry[0], options: entry[1] ?? {} }
    : { name: entry, options: {} };

const pluginMap = (plugins = []) =>
  Object.fromEntries(
    plugins.map(normalizePlugin).map(({ name, options }) => [name, options]),
  );

// Expo の config plugin は権限の文言を `xxxPermission` という名前のオプションで受け取る
// (calendarPermission・photosPermission など。false で権限を持たない)。
const PERMISSION_OPTION = /Permission$/;

/**
 * app.json の `expo` を比べ、plugins・ios.infoPlist・権限の文言の変化を返す。
 *
 * - plugins: 追加・削除・オプションが変わったプラグイン名
 * - infoPlist: 追加・削除・値が変わったキー
 * - permissionTexts: プラグインの権限オプションのうち、値が変わったもの
 *   (追加・削除されたプラグインの分も含む)
 */
exports.diffAppConfig = (before = {}, after = {}) => {
  const beforePlugins = pluginMap(before.plugins);
  const afterPlugins = pluginMap(after.plugins);

  const permissionTexts = [];
  const names = [
    ...new Set([...sortedKeys(beforePlugins), ...sortedKeys(afterPlugins)]),
  ].sort();
  for (const plugin of names) {
    const beforeOptions = beforePlugins[plugin] ?? {};
    const afterOptions = afterPlugins[plugin] ?? {};
    const keys = [
      ...new Set([...sortedKeys(beforeOptions), ...sortedKeys(afterOptions)]),
    ]
      .filter((key) => PERMISSION_OPTION.test(key))
      .sort();
    for (const key of keys) {
      if (!isEqual(beforeOptions[key], afterOptions[key])) {
        permissionTexts.push({
          plugin,
          key,
          before: beforeOptions[key],
          after: afterOptions[key],
        });
      }
    }
  }

  return {
    plugins: diffKeys(beforePlugins, afterPlugins),
    infoPlist: diffKeys(before.ios?.infoPlist, after.ios?.infoPlist),
    permissionTexts,
  };
};

const NAME_STATUS = { A: "追加", M: "変更", D: "削除", R: "名前変更" };

/**
 * `git diff --name-status` の出力を { status, path } の配列にする。
 * status は 追加・変更・削除・名前変更 のいずれか(それ以外の記号は 変更 とみなす)。
 * 名前変更は新しいパスを返す。
 */
exports.parseNameStatus = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, ...paths] = line.split("\t");
      return {
        status: NAME_STATUS[code[0]] ?? NAME_STATUS.M,
        path: paths[paths.length - 1],
      };
    });

// ホスト名にドットを含むものだけを URL とみなす(プレースホルダの "https://…" を除く)。
const EXTERNAL_URL =
  /https?:\/\/[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+[^\s"'`<>()]*/g;

/** テキストから外部の URL を取り出す。重複を除いて名前順で返す。 */
exports.extractExternalUrls = (text) =>
  [...new Set(text.match(EXTERNAL_URL) ?? [])].sort();

/** 2つの文字列配列を比べ、増えたもの・減ったものを返す。 */
exports.diffLists = (before, after) => ({
  added: after.filter((item) => !before.includes(item)),
  removed: before.filter((item) => !after.includes(item)),
});

const formatValue = (value) =>
  value === undefined ? "(なし)" : JSON.stringify(value);

/**
 * 各差分から、PR に貼れる Markdown のレポートを作る。
 *
 * candidateCount は見直しの候補の件数。dependencies の版だけの変更は候補に数えない。
 */
exports.buildReport = ({
  from,
  to,
  dependencies,
  appConfig,
  supabase,
  urls,
}) => {
  const sections = [];
  let candidateCount = 0;

  // items は候補として数える。notes は参考として並べるだけで数えない。
  const section = (title, items, notes = []) => {
    candidateCount += items.length;
    sections.push(
      `### ${title}`,
      "",
      ...(items.length > 0 ? items : ["- 変更なし"]),
      ...notes,
      "",
    );
  };

  section(
    "app/package.json の dependencies",
    [
      ...dependencies.added.map(
        ({ name, version }) => `- 追加: \`${name}\` ${version}`,
      ),
      ...dependencies.removed.map((name) => `- 削除: \`${name}\``),
    ],
    dependencies.versionChangedCount > 0
      ? [`- (参考)版だけ変わった: ${dependencies.versionChangedCount} 件`]
      : [],
  );

  const { plugins, infoPlist, permissionTexts } = appConfig;
  section("app/app.json の plugins・infoPlist・権限の文言", [
    ...plugins.added.map((name) => `- plugin 追加: \`${name}\``),
    ...plugins.removed.map((name) => `- plugin 削除: \`${name}\``),
    ...plugins.changed.map((name) => `- plugin のオプション変更: \`${name}\``),
    ...infoPlist.added.map((key) => `- infoPlist 追加: \`${key}\``),
    ...infoPlist.removed.map((key) => `- infoPlist 削除: \`${key}\``),
    ...infoPlist.changed.map((key) => `- infoPlist 変更: \`${key}\``),
    ...permissionTexts.map(
      ({ plugin, key, before, after }) =>
        `- 権限の文言: \`${plugin}\` の \`${key}\`: ${formatValue(before)} → ${formatValue(after)}`,
    ),
  ]);

  section(
    "app/supabase/migrations・functions",
    supabase.map(({ status, path }) => `- ${status}: \`${path}\``),
  );

  section("legalLinks と外部の URL(app/src・app/supabase/functions)", [
    ...urls.added.map((url) => `- 追加: ${url}`),
    ...urls.removed.map((url) => `- 削除: ${url}`),
  ]);

  const summary =
    candidateCount > 0
      ? `見直しの候補が ${candidateCount} 件ある。外部への送信・外部サービス・権限が変わっていないかを確かめ、変わっていればプライバシーポリシー・利用規約・App Store の申告を直す。`
      : "見直しの候補は無い。";

  return {
    candidateCount,
    markdown: [
      `## 法的文書の見直し(${from}..${to})`,
      "",
      ...sections,
      summary,
      "",
      "バンプ PR の本文に「法的文書: 更新した(PR 番号)」か「法的文書: 変更なし(理由)」を書く。",
    ].join("\n"),
  };
};
