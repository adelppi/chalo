#!/usr/bin/env node
// バージョン上げ PR のマージコミットに vX.Y.Z の annotated タグを付けて push する。
//
//   npm run release:tag              作成して push する
//   npm run release:tag -- --dry-run 対象コミットを表示するだけ
//
// 対象は「main の一次系列上で package.json の version が今の値に切り替わった
// コミット」= バンプ PR のマージコミット。規約は docs/adr/0025。

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const {
  isReleaseVersion,
  selectVersionBumpCommits,
  tagMessageFor,
  tagNameFor,
} = require("./version-bump-commit");

const REMOTE = "origin";
const MAIN_BRANCH = "main";
// 版の切り替わりを探す範囲。これより古い履歴までは遡らない。
const MAX_CANDIDATES = 50;

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

// git のパス指定はリポジトリルート起点に揃える(npm script の cwd は app/)。
const packageJsonPath = path
  .relative(repoRoot, require.resolve("../package.json"))
  .split(path.sep)
  .join("/");

// quiet: 失敗を想定して呼ぶとき(親にファイルが無い等)に stderr を出さない。
function git(args, { quiet = false } = {}) {
  return execFileSync("git", args, {
    encoding: "utf8",
    cwd: repoRoot,
    stdio: quiet ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "inherit"],
  }).trim();
}

function fail(message) {
  console.error(`release:tag: ${message}`);
  process.exit(1);
}

function versionAt(ref) {
  try {
    return JSON.parse(
      git(["show", `${ref}:${packageJsonPath}`], { quiet: true }),
    ).version;
  } catch {
    // 親が無い(最初のコミット)か、その時点でファイルがまだ無い。
    return null;
  }
}

function main() {
  const dryRun = process.argv.slice(2).includes("--dry-run");
  const { version } = require("../package.json");

  if (!isReleaseVersion(version)) {
    fail(`package.json の version が x.y.z 形式ではない: ${String(version)}`);
  }

  const tag = tagNameFor(version);
  const mainRef = `${REMOTE}/${MAIN_BRANCH}`;

  git(["fetch", REMOTE, MAIN_BRANCH, "--tags"]);

  if (git(["tag", "--list", tag])) {
    fail(
      `${tag} はローカルにすでにある。付け替えるなら手動で消してから実行する。`,
    );
  }
  if (git(["ls-remote", "--tags", REMOTE, `refs/tags/${tag}`])) {
    fail(`${tag} は ${REMOTE} にすでにある。公開済みのタグは付け替えない。`);
  }

  const shas = git([
    "log",
    "--first-parent",
    "--format=%H",
    mainRef,
    "--",
    packageJsonPath,
  ])
    .split("\n")
    .filter(Boolean)
    .slice(0, MAX_CANDIDATES);

  const entries = shas.map((sha) => ({
    sha,
    version: versionAt(sha),
    parentVersion: versionAt(`${sha}^1`),
  }));

  const matches = selectVersionBumpCommits(entries, version);

  if (matches.length === 0) {
    fail(
      `${mainRef} に version を ${version} にしたコミットが無い。` +
        `バンプ PR がマージ済みか確認する。`,
    );
  }
  if (matches.length > 1) {
    fail(
      `version を ${version} にしたコミットが複数ある:\n  ${matches.join("\n  ")}\n` +
        `どれを指すか判断できないため、手動で ` +
        `git tag -a ${tag} -m "${tagMessageFor(version)}" <sha> を実行する。`,
    );
  }

  const target = matches[0];
  try {
    git(["merge-base", "--is-ancestor", target, mainRef], { quiet: true });
  } catch {
    fail(`${target} は ${mainRef} の履歴に含まれていない。`);
  }

  console.log(`${tag} -> ${git(["log", "-1", "--format=%h %s", target])}`);

  if (dryRun) {
    console.log("--dry-run のため、タグの作成と push はしない。");
    return;
  }

  git(["tag", "-a", tag, "-m", tagMessageFor(version), target]);
  git(["push", REMOTE, tag]);
  console.log(`${tag} を ${REMOTE} に push した。`);
}

main();
