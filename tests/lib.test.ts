import {
  assert,
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";

import { hash, verify, Variant, Version } from "../lib/dev.ts";

let password =
  "2gnF!WAcyhp#kB@tcYQa2$A%P64jEmXY!@8n2GSH$GggfgGfP*qH!EWwDaB%5mdB6pW2fK!KD@YNjvqwREfRCCAPc54c5@Sk";
let hashed =
  "$argon2i$v=19$m=4096,t=3,p=1$i8Pd309cCOP75oN8vz8FHA$qUk1NgsxOmz3nWc54jyuOnr+3hHbZz3k0Sb13id7Ai8";

await hash("");

Deno.test({
  name: "hashing a password omitting the salt",
  async fn() {
    let hashed = await hash(password);

    assert(hashed);
    assertEquals(typeof hashed, "string");
  },
});

Deno.test({
  name: "hashing a password specifying the salt",
  async fn() {
    let salt = crypto.getRandomValues(new Uint8Array(8));
    let hashed1 = await hash(password, { salt });
    let hashed2 = await hash(password, { salt });

    assertEquals(hashed1, hashed2);
  },
});

Deno.test({
  name: "failure when hashing a password with salt shorter then 8",
  async fn() {
    let salt = crypto.getRandomValues(new Uint8Array(7));

    assertThrowsAsync(async () => {
      await hash(password, { salt });
    });
  },
});

Deno.test({
  name: "hashing a password specifying a secret",
  async fn() {
    let secret = crypto.getRandomValues(new Uint8Array(8));
    let hashed = await hash(password, { secret });

    assert(hashed);
  },
});

Deno.test({
  name: "hashing a password specifying a salt and a secret",
  async fn() {
    let secret = crypto.getRandomValues(new Uint8Array(8));
    let salt = crypto.getRandomValues(new Uint8Array(8));
    let hashed = await hash(password, { salt, secret });

    assert(hashed);
  },
});

Deno.test({
  name: "hashing a password specifying an attached set of data",
  async fn() {
    let hashed = await hash(password, {
      data: {
        hashedAt: Date.now(),
        requestId: "69e442b3-ea81-409a-89f0-1af1ba623d52",
      },
    });

    assert(hashed);
  },
});

Deno.test({
  name:
    "hashing a password specifying an attached set of data, a salt and a secret",
  async fn() {
    let secret = crypto.getRandomValues(new Uint8Array(8));
    let salt = crypto.getRandomValues(new Uint8Array(8));
    let hashed = await hash(password, {
      secret,
      salt,
      data: {
        hashedAt: Date.now(),
        requestId: "69e442b3-ea81-409a-89f0-1af1ba623d52",
      },
    });

    assert(hashed);
  },
});

Deno.test({
  name: "hashing a password specifying the memory cost",
  async fn() {
    let hashed = await hash(password, {
      memoryCost: 1024,
    });

    assert(/\$m=1024/.test(hashed));
  },
});

Deno.test({
  name: "hashing a password specifying the time cost",
  async fn() {
    let hashed = await hash(password, {
      timeCost: 6,
    });

    assert(/,t=6,/.test(hashed));
  },
});

Deno.test({
  name: "hashing a password specifying the variant",
  async fn() {
    let hashed = await hash(password, {
      variant: Variant.Argon2id,
    });

    assert(/^\$argon2id/.test(hashed));
  },
});

Deno.test({
  name: "hashing a password specifying the version",
  async fn() {
    let hashed = await hash(password, {
      version: Version.V10,
    });

    assert(/\$v=16/.test(hashed));
  },
});

Deno.test({
  name: "password verification",
  async fn() {
    let resultTrue = await verify(hashed, password);
    let resultFalse = await verify(hashed, "fail");

    assertEquals(resultTrue, true);
    assertEquals(resultFalse, false);
  },
});
