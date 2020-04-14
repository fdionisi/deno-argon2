import { verify } from "../lib/dev.ts";

let hash =
  "$argon2i$v=19$m=4096,t=3,p=1$AQIDBAUGBwg$u87PDHPaaimrdwCIQSwMxRQgjo22ufjWoL3urtrePU0";

console.log(await verify(hash, "test"));
