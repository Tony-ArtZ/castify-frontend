"use server";

import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getPodcast = async (userId: string) => {
  const podcast = await db
    .select()
    .from(podcasts)
    .where(eq(podcasts.generatedById, userId))
    .execute();

  if (podcast.length === 0) {
    return null;
  }
  return podcast;
};
