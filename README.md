# Argon2 for Deno

[Argon2](https://github.com/P-H-C/phc-winner-argon2) encryption library for [Deno](https://deno.land).

It uses [rust-argon2](https://github.com/sru-systems/rust-argon2) under the hood.

## API

- `hash(password: string, options?: HashOptions): Promise<string>`

- `verify(hash: string, password: string): Promise<boolean>`

### Error handling

In case of error, all methods of this library will throw an [`Argon2Error`](lib/error.ts) type.

## Usage

### Library

```ts
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { hash, verify } from "https://deno.land/x/argon2/lib/mod.ts";

let hash = await hash("test");

assert(await verify(hash, "test"));
```

#### Testing

```ts
import { Variant } from "https://deno.land/x/argon2/lib/mod.ts";
import { assertArgon2Encoded } from "https://deno.land/x/argon2/lib/testing.ts";

Deno.test("User#password should be an argon2id variant password", async () => {
  assertArgon2Encoded(user.password, {
    variant: Variant.Argon2id
  });
});
```

### CLI

The library can be installed as a CLI tool via `deno install`.

<details>

  <summary>Installation snippet</summary>

  ```sh
  deno install \
    --allow-env \
    --allow-run \
    --allow-read \
    --allow-write \
    --allow-plugin \
    --allow-net \
    argon2 https://deno.land/x/argon2/cli/mod.ts
  ```
</details>

After install run `--help` to inspect all possible commands.

## Permissions

The library automatically download the static library and initialize Deno plugin via [plugin_prepare](https://github.com/manyuanrong/deno-plugin-prepare) and it requires `--allow-read`, `--allow-write`, `--allow-net` and `--allow-plugin`.

<details>

  ```sh
  deno \
    --allow-read .deno_plugins \
    --allow-write .deno_plugins \
    --allow-net
    --allow-plugin \
    lib/mod.ts
  ```
</details>

## Examples

In the `examples/` folder there you can find some usage examples.

> To run examples you must `--allow-run` since dev environment builds and initialize the Rust crate.

***Available examples***

- [Hash](examples/hash.ts)
- [Hash with options](examples/hash-with-options.ts)
- [Verify](examples/hash-with-options.ts)

## Contributing

### Project structure
```sh
deno-argon2
  ├── lib/      # Core library
  ├── native/   # Native glue code
  ├── cli/      # CLI wrapper
  ├── tests/    # TypeScript tests
  ├── benches/  # TypeScript benchmarks
  └── examples/ # Development examples
```

## License

[MIT](LICENSE)
