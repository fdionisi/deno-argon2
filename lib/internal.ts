import { prepare } from "./deps.ts";

import { HashOptions, MIN_SALT_SIZE } from "./common.ts";
import { Argon2Error, Argon2ErrorType } from "./error.ts";

let encoder = new TextEncoder();

interface InstallPluginConfig {
  buildPlugin: "dev" | "release";
  printLog: boolean;
  checkCache: boolean;
}

export async function buildNativePlugin(forRelease = false) {
  let cmd = ["cargo", "build"];

  if (forRelease) {
    cmd.push("--release");
  }

  let buildNativePlugin = Deno.run({
    cmd,
    stdout: "piped",
  });

  await buildNativePlugin.output();
}

export async function installPlugin(
  baseUrl: string,
  config: Partial<InstallPluginConfig> = {},
) {
  let shouldBuild = "buildPlugin" in config;

  await checkPermissions(shouldBuild);

  if (shouldBuild) {
    await buildNativePlugin(config.buildPlugin === "release");
  }

  let preparing = prepare({
    name: "argon2",
    printLog: config.printLog,
    checkCache: config.checkCache,
    urls: {
      darwin: `${baseUrl}/libdeno_argon2.dylib`,
      windows: `${baseUrl}/deno_argon2.dll`,
      linux: `${baseUrl}/libdeno_argon2.so`,
    },
  });

  return {
    async hash(
      password: string,
      options: Partial<HashOptions> = {},
    ) {
      await preparing;

      if (typeof password !== "string") {
        throw new Argon2Error(
          Argon2ErrorType.InvalidInput,
          "Password argument must be a string.",
        );
      }

      let salt = options.salt ? options.salt : crypto.getRandomValues(
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

      try {
        // @ts-ignore
        return Deno.core.opSync("op_argon2_hash", {
          password,
          options: {
            ...options,
            salt: [...salt.values()],
            secret: options.secret ? [...options.secret.values()] : undefined,
            data: options.data
              ? [...encoder.encode(JSON.stringify(options.data)).values()]
              : undefined,
          },
        })!;
      } catch (error) {
        console.log(error);
        throw new Argon2Error(
          Argon2ErrorType.Native,
          "An error occurred executing `hash`",
          error,
        );
      }
    },
    async verify(
      hash: string,
      password: string,
    ) {
      await preparing;

      try {
        // @ts-ignore
        return Deno.core.opSync("op_argon2_verify", { password, hash })!;
      } catch (error) {
        throw new Argon2Error(
          Argon2ErrorType.Native,
          "An error occurred executing `verify`",
          error,
        );
      }
    },
  };
}

async function checkPermissions(shouldBuild: boolean) {
  let permissions = [
    Deno.permissions.query({ name: "plugin" }),
    Deno.permissions.query({ name: "read", path: "./.deno_plugins" }),
    Deno.permissions.query({ name: "write", path: "./.deno_plugins" }),
  ];

  if (shouldBuild) {
    permissions.push(Deno.permissions.query({ name: "run" }));
  }

  let [pluginPermission, readPermission, writePermission, runPermissions] =
    await Promise.all(permissions);

  if (pluginPermission.state !== "granted") {
    throw new Argon2Error(
      Argon2ErrorType.UnmeetPermission,
      "Plugin permission is not set. Run the script with `--allow-plugin` flag.",
    );
  }

  if (readPermission.state !== "granted") {
    throw new Argon2Error(
      Argon2ErrorType.UnmeetPermission,
      "Read permission is not set. Run the script with `--allow-read` flag.",
    );
  }

  if (writePermission.state !== "granted") {
    throw new Argon2Error(
      Argon2ErrorType.UnmeetPermission,
      "Write permission is not set. Run the script with `--allow-write` flag.",
    );
  }

  if (shouldBuild && runPermissions && runPermissions.state !== "granted") {
    throw new Argon2Error(
      Argon2ErrorType.UnmeetPermission,
      "Run permission is not set. Run the script with `--allow-run` flag.",
    );
  }
}
