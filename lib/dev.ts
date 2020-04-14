import { installPlugin } from "./internal.ts";

export * from "./common.ts";
export * from "./error.ts";

export let { verify, hash } = await installPlugin("file://target/debug", {
  buildPlugin: "dev",
  printLog: true,
  checkCache: false,
});
