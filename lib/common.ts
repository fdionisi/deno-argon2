export let MIN_SALT_SIZE = 8;

export enum Variant {
  Argon2i = "argon2i",
  Argon2d = "argon2d",
  Argon2id = "argon2id",
}

export enum Version {
  V10 = "16",
  V13 = "19",
}

export enum ThreadMode {
  Sequential,
  Parallel,
}

export interface HashOptions<T extends {} = {}> {
  salt: Uint8Array;
  secret: Uint8Array;
  data: T;
  variant: Variant;
  version: Version;
  memoryCost: number;
  timeCost: number;
  threadMode: ThreadMode;
  lanes: number;
  hashLength: number;
}

export function version() {
  return "0.5.2";
}
