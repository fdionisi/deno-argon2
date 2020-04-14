import { hash, Variant, Version, ThreadMode } from "../lib/dev.ts";
import { encode } from "../lib/deps.ts";

let salt = crypto.getRandomValues(
  new Uint8Array(20),
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
  hashLength: 32,
  data: {
    hashedAt: Date.now(),
    requestId: "a00d22c0-4681-4351-8c8f-6f02a42dd941",
  },
}));
