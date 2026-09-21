// バージョン上げコミットの特定とタグ名の規約(docs/adr/0025)。
// I/O を持たない純粋関数だけを置き、Jest でテストする(adr/0014)。

const RELEASE_VERSION = /^\d+\.\d+\.\d+$/;

/** ストアに出すバージョン(x.y.z)の形式か。プレリリース表記は使わない。 */
exports.isReleaseVersion = (version) =>
  typeof version === "string" && RELEASE_VERSION.test(version);

/** タグ名の規約: vX.Y.Z */
exports.tagNameFor = (version) => `v${version}`;

/** アノテーションタグのメッセージの規約: vX.Y.Z release */
exports.tagMessageFor = (version) => `v${version} release`;

/**
 * main の一次系列上で「バージョンが targetVersion に切り替わったコミット」を選ぶ。
 *
 * entries は新しい順の { sha, version, parentVersion }。version が目的の値で、
 * かつ第一親がまだ別の値だったコミットが、版の切り替わった点(= バンプ PR の
 * マージコミット)。parentVersion が null のもの(親に package.json が無い)も
 * 切り替わりとして扱う。
 *
 * 返すのは新しい順の sha の配列。通常は1件で、0件・複数件は呼び出し側で止める。
 */
exports.selectVersionBumpCommits = (entries, targetVersion) =>
  entries
    .filter(
      (entry) =>
        entry.version === targetVersion &&
        entry.parentVersion !== targetVersion,
    )
    .map((entry) => entry.sha);
