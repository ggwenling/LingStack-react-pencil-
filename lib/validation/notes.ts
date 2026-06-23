import { z } from "zod";

import { NOTE_TAGS } from "@/lib/notes/types";

export const noteTagsSchema = z
  .array(z.enum(NOTE_TAGS))
  .min(1)
  .max(NOTE_TAGS.length)
  .transform((tags) => Array.from(new Set(tags)));

export const noteContentSchema = z.string().max(80_000);
