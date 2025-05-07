"use server";

import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export const getNewRecommendations = async () => {
  const recommendations = await db
    .select()
    .from(podcasts)
    .orderBy(desc(podcasts.createdAt))
    .limit(5)
    .execute();
  if (recommendations.length === 0) {
    return null;
  }
  return recommendations.map((recommendation) => ({
    id: recommendation.id,
    name: recommendation.name,
    url: recommendation.url,
    description: recommendation.description,
    tags: recommendation.tags,
    generatedById: recommendation.generatedById,
    createdAt: recommendation.createdAt,
  }));
};

export const getRecommendations = async (tags: string) => {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: tags,
  });

  const similarity = sql<number>`1 - (${cosineDistance(
    podcasts.embedding,
    embedding
  )})`;
  const recommendations = await db
    .select({
      id: podcasts.id,
      name: podcasts.name,
      url: podcasts.url,
      description: podcasts.description,
      tags: podcasts.tags,
      generatedById: podcasts.generatedById,
      createdAt: podcasts.createdAt,
      similarity,
    })
    .from(podcasts)
    .where(gt(similarity, 0.01))
    .orderBy((t) => desc(t.similarity))
    .limit(5)
    .execute();

  if (recommendations.length === 0) {
    return null;
  }
  return recommendations.map((recommendation) => ({
    id: recommendation.id,
    name: recommendation.name,
    url: recommendation.url,
    description: recommendation.description,
    tags: recommendation.tags,
    generatedById: recommendation.generatedById,
    createdAt: recommendation.createdAt,
  }));
};
