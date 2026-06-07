import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { generateSong } from "./function";
// Create an API that serves zero functions
export const runtime = "nodejs";

export const { GET, POST } = serve({
  client: inngest,
  functions: [generateSong],
});