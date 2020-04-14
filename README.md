# Argon2 for Deno

[Argon2](https://github.com/P-H-C/phc-winner-argon2) encryption library for [Deno](https://deno.land).

It uses [rust-argon2](https://github.com/sru-systems/rust-argon2) under the hood.

## API

- `hash(password: string, options?: HashOptions): Promise<string>`

- `verify(hash: string, password: string): Promise<boolean>`

### Error handling

In case of error, all methods of this library will throw an [`Argon2Error`](src/error.ts) type.

## Usage
```ts
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { hash, verify } from "https://deno.land/x/argon2/mod.ts"

let hash = await hash("test");

assert(await verify(hash, "test"));
```

### CLI

It is possible to install deno-argon2 as a CLI tool insatiable via `deno install`.

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

This library automatically download the static library and initialize Deno plugin via [plugin_prepare](https://github.com/manyuanrong/deno-plugin-prepare) and it requires `--allow-read .deno_plugins`, `--allow-write .deno_plugins` and `--allow-plugin` to be specified.

<details>

  ```sh
  deno \
    --allow-read .deno_plugins \
    --allow-write .deno_plugins \
    --allow-net
    --allow-plugin \
    src/mod.ts
  ```
</details>

## Examples

In the `examples/` folder there you can find some usage examples.

> To run examples you must `--allow-run` since dev environment builds and initialize the Rust crate.

## Contributing

### Project structure
```
src/
native/
tests/
benches/
examples/
```

## License
