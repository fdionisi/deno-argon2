import { bench, runBenchmarks } from "https://deno.land/std/testing/bench.ts";

import { ThreadMode } from "../lib/common.ts";
import { installPlugin } from "../lib/internal.ts";

let { verify, hash } = await installPlugin("file://target/release", {
  buildPlugin: "release",
  printLog: false,
  checkCache: false,
});

let password =
  "2gnF!WAcyhp#kB@tcYQa2$A%P64jEmXY!@8n2GSH$GggfgGfP*qH!EWwDaB%5mdB6pW2fK!KD@YNjvqwREfRCCAPc54c5@Sk";
let hashed =
  "$argon2i$v=19$m=4096,t=3,p=1$i8Pd309cCOP75oN8vz8FHA$qUk1NgsxOmz3nWc54jyuOnr+3hHbZz3k0Sb13id7Ai8";

bench({
  name: "hash 100 times",
  runs: 100,
  async func(handler) {
    handler.start();
    await hash(
      password,
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with random salt",
  runs: 100,
  async func(handler) {
    let salt = crypto.getRandomValues(
      new Uint8Array(Math.max(8, Math.random() * 32)),
    );
    handler.start();
    await hash(
      password,
      { salt },
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with random data, secret and salt",
  runs: 100,
  async func(handler) {
    let salt = crypto.getRandomValues(
      new Uint8Array(Math.max(8, Math.random() * 32)),
    );
    let secret = crypto.getRandomValues(
      new Uint8Array(Math.max(8, Math.random() * 32)),
    );
    let data = {
      hashedAt: Date.now(),
    };
    handler.start();
    await hash(
      password,
      {
        salt,
        secret,
        data,
      },
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with memoryCost set at 1024",
  runs: 100,
  async func(handler) {
    handler.start();
    await hash(
      password,
      {
        memoryCost: 1024,
      },
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with timeCost set at 10",
  runs: 100,
  async func(handler) {
    handler.start();
    await hash(
      password,
      {
        timeCost: 6,
      },
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with 16 lanes on parallel mode",
  runs: 100,
  async func(handler) {
    handler.start();
    await hash(
      password,
      {
        threadMode: ThreadMode.Parallel,
        lanes: 16,
      },
    );
    handler.stop();
  },
});

bench({
  name: "hash 100 times with 16 lanes on sequential mode",
  runs: 100,
  async func(handler) {
    handler.start();
    await hash(
      password,
      {
        threadMode: ThreadMode.Sequential,
        lanes: 16,
      },
    );
    handler.stop();
  },
});

bench({
  name: "verify 100 times",
  runs: 100,
  async func(handler) {
    handler.start();
    await verify(
      hashed,
      password,
    );
    handler.stop();
  },
});

runBenchmarks();
