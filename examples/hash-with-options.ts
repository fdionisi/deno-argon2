import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { hash, Variant, Version, ThreadMode } from "../src/dev.ts";

let salt = crypto.getRandomValues(
  new Uint8Array(Math.max(8, Math.random() * 32)),
);

let secret = encode("my-super-secret");

console.log(await hash("test", {
  salt,
  secret,
  variant: Variant.Argon2id,
  version: Version.V13,
  memoryCost: 8192,
  timeCost: 10,
  threadMode: ThreadMode.Parallel,
  lanes: 4,
  data: {
    hashedAt: Date.now(),
    requestId: "a00d22c0-4681-4351-8c8f-6f02a42dd941",
  },
}));
