"use server";

import { db } from "@/db";
import { podcastAudio, podcasts, users } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

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

export const getPodcastFromQuery = async (query: string) => {
  const podcast = await db
    .select()
    .from(podcasts)
    .where(
      or(
        like(podcasts.name, `%${query}%`),
        like(podcasts.description, `%${query}%`)
      )
    )
    .execute();

  if (podcast.length === 0) {
    return null;
  }
  return podcast;
};

export const getPodcastAudio = async (podcastId: string) => {
  const podcast = await db
    .select()
    .from(podcasts)
    .innerJoin(users, eq(podcasts.generatedById, users.id))
    .where(eq(podcasts.id, podcastId))
    .execute();

  if (podcast.length === 0) {
    return null;
  }

  const podcastData = await db
    .select()
    .from(podcastAudio)
    .where(eq(podcastAudio.id, podcast[0].podcast.url))
    .execute();
  if (podcastData.length === 0) {
    return null;
  }

  // Convert Uint8Array to base64 string for serialization
  const base64Data = Buffer.from(podcastData[0].audioData).toString("base64");
  return {
    name: podcast[0].podcast.name,
    data: base64Data,
    tags: podcast[0].podcast.tags,
    description: podcast[0].podcast.description,
    userName: podcast[0].user.name,
    userPhoto: podcast[0].user.image,
  };
};
