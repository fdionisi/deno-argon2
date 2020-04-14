import { assertThrows } from "https://deno.land/std/testing/asserts.ts";

import { decode } from "../lib/deps.ts";
import { hash, Variant } from "../lib/dev.ts";
import { assertArgon2Encoded } from "../lib/testing.ts";

let password =
  "2gnF!WAcyhp#kB@tcYQa2$A%P64jEmXY!@8n2GSH$GggfgGfP*qH!EWwDaB%5mdB6pW2fK!KD@YNjvqwREfRCCAPc54c5@Sk";

let hashed1 =
  "$argon2i$v=19$m=4096,t=3,p=1$i8Pd309cCOP75oN8vz8FHA$qUk1NgsxOmz3nWc54jyuOnr+3hHbZz3k0Sb13id7Ai8";
let hashed2 =
  "$argon2id$v=16$m=4096,t=10,p=1$i8Pd309cCOP75oN8vz8FHA$qUk1NgsxOmz3nWc54jyuOnr+3hHbZz3k0Sb13id7Ai8";
let hashed3 =
  "$argon2d$v=16$m=8192,t=10,p=3$i8Pd309cCOP75oN8vz8FHA$qUk1NgsxOmz3nWc54jyuOnr+3hHbZz3k0Sb13id7Ai8";

await hash("");

Deno.test({
  name: "assertion testing functionality",
  async fn() {
    let hashed = await hash(password);

    assertArgon2Encoded(hashed);
  },
});

Deno.test({
  name: "assertion testing functionality with different mocks",
  fn() {
    assertArgon2Encoded(hashed1);
    assertArgon2Encoded(hashed2);
    assertArgon2Encoded(hashed3);
  },
});

Deno.test({
  name: "assertion testing functionality specifying variant",
  fn() {
    assertArgon2Encoded(hashed1, {
      variant: Variant.Argon2i,
    });
    assertThrows(() => {
      assertArgon2Encoded(hashed1, {
        variant: Variant.Argon2id,
      });
    });

    assertArgon2Encoded(hashed2, {
      variant: Variant.Argon2id,
    });
    assertThrows(() => {
      assertArgon2Encoded(hashed2, {
        variant: Variant.Argon2d,
      });
    });

    assertArgon2Encoded(hashed3, {
      variant: Variant.Argon2d,
    });
    assertThrows(() => {
      assertArgon2Encoded(hashed3, {
        variant: Variant.Argon2i,
      });
    });
  },
});

Deno.test({
  name: "assertion testing failure with non argon2 alike strings",
  fn() {
    let start = Date.now();
    while (Date.now() - start < 1000) {
      assertThrows(() => {
        assertArgon2Encoded(
          decode(crypto.getRandomValues(new Uint8Array(Math.random() * 100))),
        );
      });
    }
  },
});
