import { HashOptions, MIN_SALT_SIZE, version } from "./common.ts";
import { Argon2Error, Argon2ErrorType } from "./error.ts";
import { dlopen, type FetchOptions } from "./deps.ts";

const FETCH_OPTIONS: FetchOptions = {
  name: "deno_argon2",
  url:
    `https://github.com/fdionisi/deno-argon2/releases/download/v${version()}/`,
  cache: "use",
};

// constant for local testing (please refer to "test-with-local-build.sh")
const _FETCH_OPTIONS_FOR_DEV: FetchOptions = {
  ...FETCH_OPTIONS,
  url: "./target/release/",
  cache: "reloadAll",
};

const SYMBOLS = {
  hash: {
    parameters: ["buffer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  verify: {
    parameters: ["buffer", "usize"],
    result: "pointer",
    nonblocking: true,
  },
  free_buf: {
    parameters: ["pointer", "usize"],
    result: "void",
  },
} as const;

const lib = await dlopen(FETCH_OPTIONS, SYMBOLS);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readAndFreeBuffer(ptr: Deno.PointerValue): Uint8Array {
  const ptrView = new Deno.UnsafePointerView(ptr);
  const len = new DataView(ptrView.getArrayBuffer(4)).getUint32(0);

  const buf = new Uint8Array(len);
  ptrView.copyInto(buf, 4);

  lib.symbols.free_buf(ptr, len + 4);

  return buf;
}

export async function hash(
  password: string,
  options: Partial<HashOptions> = {},
) {
  if (typeof password !== "string") {
    throw new Argon2Error(
      Argon2ErrorType.InvalidInput,
      "Password argument must be a string.",
    );
  }

  const salt = options.salt ? options.salt : crypto.getRandomValues(
    new Uint8Array(
      Math.max(Math.round(Math.random() * 32), MIN_SALT_SIZE),
    ),
  );

  if (salt.length < MIN_SALT_SIZE) {
    throw new Argon2Error(
      Argon2ErrorType.InvalidInput,
      `Input salt is too short: ${salt.length}`,
    );
  }

  const args = encoder.encode(JSON.stringify({
    password,
    options: {
      ...options,
      salt: [...salt.values()],
      secret: options.secret ? [...options.secret.values()] : undefined,
      data: options.data
        ? [...encoder.encode(JSON.stringify(options.data)).values()]
        : undefined,
    },
  }));

  const result_buf_ptr = await lib.symbols.hash(
    args,
    args.byteLength,
  );

  const result = JSON.parse(
    decoder.decode(readAndFreeBuffer(result_buf_ptr)),
  ) as {
    result: Array<number>;
    error: string | null;
  };

  if (result.error) {
    throw new Argon2Error(
      Argon2ErrorType.Native,
      "An error occurred executing `hash`",
      result.error,
    );
  }

  return decoder.decode(Uint8Array.from(result.result));
}

export async function verify(
  hash: string,
  password: string,
) {
  const args = encoder.encode(JSON.stringify({
    hash: hash,
    password: password,
  }));

  const result_buf_ptr = await lib.symbols.verify(
    args,
    args.byteLength,
  );

  const result = JSON.parse(
    decoder.decode(readAndFreeBuffer(result_buf_ptr)),
  ) as {
    result: boolean;
    error: string | null;
  };

  if (result.error) {
    throw new Argon2Error(
      Argon2ErrorType.Native,
      "An error occurred executing `verify`",
      result.error,
    );
  }

  return result.result;
}
