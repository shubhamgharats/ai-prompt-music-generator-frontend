import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { generateSong } from "./function";

export const { GET, POST, PUT } = serve(inngest, [
  generateSong,
]);