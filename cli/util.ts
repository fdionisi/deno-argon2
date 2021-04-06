let decoder = new TextDecoder();

export async function readStdin() {
  return decoder.decode(await Deno.readAll(Deno.stdin));
}
