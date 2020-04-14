import { Command, argon2 } from "./deps.ts";

import { hash } from "./commands/hash.ts";
import { verify } from "./commands/verify.ts";

await new Command()
  .version(argon2.version())
  .description("Hash a new password or verify an existing one.")
  .command("hash", hash)
  .command("verify", verify)
  .parse(Deno.args);
