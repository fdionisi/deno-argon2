import { Command, encode, argon2 } from "../deps.ts";
import { readStdin } from "../util.ts";

export let hash = new Command()
  .version(argon2.version())
  .description("Hash a new password or verify an already existing one.")
  .option("-s, --salt <arg:string>", "")
  .option("-S, --secret <arg:string>", "")
  .option("-m, --memory-cost <arg:number>", "")
  .option("-t, --time-cost <arg:number>", "")
  .option("-l, --lanes <arg:number>", "")
  .option("-T, --thread-mode <arg:thread-mode>", "")
  .option("-v, --variant <arg:variant>", "")
  .option("-d, --data <arg:json>", "")
  .option("-H, --hash-length <arg:number>", "")
  .type("thread-mode", (option, _, value) => {
    switch (value) {
      case "sequential": {
        return argon2.ThreadMode.Sequential;
      }
      case "parallel": {
        return argon2.ThreadMode.Parallel;
      }
      case undefined: {}
      default: {
        throw new Error(
          `Option --${option.name} must be either "sequential" or "parallel": ${value}`,
        );
      }
    }
  })
  .type("variant", (option, _, value) => {
    switch (value) {
      case argon2.Variant.Argon2i:
      case argon2.Variant.Argon2d:
      case argon2.Variant.Argon2id: {
        return value;
      }
      case undefined: {}
      default: {
        throw new Error(
          `Option --${option.name} must be either "${argon2.Variant.Argon2i}", "${argon2.Variant.Argon2d}" or "${argon2.Variant.Argon2id}": ${value}`,
        );
      }
    }
  })
  .type("json", (option, _, value) => {
    try {
      if (value !== undefined) {
        return JSON.parse(value);
      }
    } catch (_) {
      throw new Error(
        `Option --${option.name} must be a valid json object: ${value}`,
      );
    }
  })
  .action(async (options) => {
    let password = await readStdin();

    console.log(await argon2.hash(password, {
      salt: options.salt ? encode(options.salt) : undefined,
      secret: options.secret ? encode(options.secret) : undefined,
      memoryCost: options.memoryCost ? options.memoryCost : undefined,
      timeCost: options.timeCost ? options.timeCost : undefined,
      lanes: options.lanes ? options.lanes : undefined,
      threadMode: "threadMode" in options ? options.threadMode : undefined,
      variant: options.variant ? options.variant : undefined,
      data: options.data ? options.data : undefined,
      hashLength: options.hashLength ? options.hashLength : undefined,
    }));
  });
