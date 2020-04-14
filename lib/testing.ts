import { assert } from "https://deno.land/std/testing/asserts.ts";

import { Version, Variant } from "./common.ts";

interface AssertArgon2EncodedOptions {
  variant: Variant;
  version: Version;
  memoryCost: number;
  timeCost: number;
  lanes: number;
}

export function assertArgon2Encoded(
  password: string,
  options: Partial<AssertArgon2EncodedOptions> = {},
): asserts password {
  let variant = options.variant
    ? options.variant
    : "argon2(i|d|id)";

  let version = options.version
    ? options.version
    : "(16|19)";

  let memoryCost = options.memoryCost
    ? options.memoryCost
    : "([0-9])+";

  let timeCost = options.timeCost
    ? options.timeCost
    : "([0-9])+";

  let lanes = options.lanes
    ? options.lanes
    : "([0-9])+";

  let rx = new RegExp(
    `^\\$${variant}\\$v=${version}\\$m=${memoryCost},t=${timeCost},p=${lanes}\\$.+$`,
  );

  assert(rx.test(password));
}
