#!/usr/bin/env node
// 前回のタグから HEAD までの変更のうち、法的文書(利用規約・プライバシーポリシー・
// App Store のプライバシー申告)の見直しが要りそうなものを一覧にする。
//
//   npm run release:legal-check                 直近の vX.Y.Z タグと HEAD を比べる
//   npm run release:legal-check -- --from <ref> 比べる起点を指定する
//
// 出力は PR にそのまま貼れる Markdown。候補の有無にかかわらず終了コードは 0。
// 見るのはコミット済みの内容だけ(作業ツリーの未コミットの変更は見ない)。
// 規約は docs/adr/0028。

const { execFileSync } = require("node:child_process");

const {
  buildReport,
  diffAppConfig,
  diffDependencies,
  diffLists,
  extractExternalUrls,
  parseNameStatus,
} = require("./legal-impact");

const TO = "HEAD";
const PACKAGE_JSON = "app/package.json";
const APP_JSON = "app/app.json";
// Edge Function のテストは送信の中身を変えないため除く。
const SUPABASE_PATHSPECS = [
  "app/supabase/migrations",
  "app/supabase/functions",
  ":(exclude)*.test.*",
];
// legalLinks(app/src/global/constants/legalLinks.ts)もここに含まれる。
// テストの例示 URL は送信先ではないため除く。
const URL_PATHSPECS = [
  "app/src",
  "app/supabase/functions",
  ":(exclude)*.test.*",
];

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function fail(message) {
  console.error(`release:legal-check: ${message}`);
  process.exit(1);
}

function jsonAt(ref, file) {
  try {
    return JSON.parse(
      execFileSync("git", ["show", `${ref}:${file}`], {
        encoding: "utf8",
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    // その時点でファイルがまだ無い。
    return {};
  }
}

function urlsAt(ref) {
  try {
    const text = execFileSync(
      "git",
      ["grep", "-hIE", "https?://", ref, "--", ...URL_PATHSPECS],
      { encoding: "utf8", cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] },
    );
    return extractExternalUrls(text);
  } catch {
    // git grep は一致が無いと終了コード 1 を返す。
    return [];
  }
}

function resolveFrom(argv) {
  const index = argv.indexOf("--from");
  if (index !== -1) {
    const ref = argv[index + 1];
    if (!ref) fail("--from の後ろに比べる起点(タグやコミット)を書く。");
    return ref;
  }
  try {
    return git([
      "describe",
      "--tags",
      "--abbrev=0",
      "--match",
      "v[0-9]*",
      TO,
    ]).trim();
  } catch {
    fail("HEAD から辿れる vX.Y.Z のタグが無い。--from で起点を指定する。");
  }
}

function main() {
  const from = resolveFrom(process.argv.slice(2));

  const report = buildReport({
    from,
    to: TO,
    dependencies: diffDependencies(
      jsonAt(from, PACKAGE_JSON).dependencies,
      jsonAt(TO, PACKAGE_JSON).dependencies,
    ),
    appConfig: diffAppConfig(
      jsonAt(from, APP_JSON).expo,
      jsonAt(TO, APP_JSON).expo,
    ),
    supabase: parseNameStatus(
      git(["diff", "--name-status", from, TO, "--", ...SUPABASE_PATHSPECS]),
    ),
    urls: diffLists(urlsAt(from), urlsAt(TO)),
  });

  console.log(report.markdown);
}

main();
