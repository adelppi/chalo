#!/usr/bin/env node
// アルバムの E2E(.maestro/plans/plan-album.yaml)の fixtures を、中身はそのままで
// ファイルごと作り直す。
//
//   npm run e2e:fixtures
//
// addMedia(simctl addmedia)で入る PNG の撮影日時は、ファイルの作成日時(birthtime)に
// なる。touch では更新日時しか変わらないので、コピーして置き換えることで作成日時を
// 「今」にし、アルバム対象日=今日の写真として入るようにする(Issue #133)。

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const fixturesDir = path.join(repoRoot, ".maestro/fixtures");

const pngs = fs
  .readdirSync(fixturesDir)
  .filter((name) => name.endsWith(".png"));

for (const name of pngs) {
  const file = path.join(fixturesDir, name);
  const tmp = `${file}.tmp`;
  // copyFileSync は macOS で時刻まで引き継ぐ(birthtime が古いまま)ので、中身を
  // 読んで新しいファイルとして書き出す。
  fs.writeFileSync(tmp, fs.readFileSync(file));
  fs.renameSync(tmp, file);
}

console.log(`fixtures を作り直しました(${pngs.length} 枚): ${fixturesDir}`);
