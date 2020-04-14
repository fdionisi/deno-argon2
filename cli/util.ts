import { decode } from "./deps.ts";

export async function readStdin() {
  return decode(await Deno.readAll(Deno.stdin));
}
