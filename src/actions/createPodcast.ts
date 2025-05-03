"use server";

import { db } from "@/db";
import { podcasts } from "@/db/schema";
import { auth } from "../../auth";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export const createPodcast = async (url: string, promptm: string) => {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("User not authenticated");
    }
    const userId = session.user?.id;

    const result = await generateObject({
      model: openai("gpt-4o", {
        structuredOutputs: true,
      }),
      schemaName: "summary",
      schemaDescription: "Summary of prompt",
      schema: z.object({
        name: z.string(),
        tags: z.string(),
        categories: z.string(),
      }),
      prompt:
        "Generate name, tags, categories for the following prompt: " + promptm,
    });

    await db.insert(podcasts).values({
      url: url,
      name: result.object.name,
      tags: result.object.tags,
      categories: result.object.categories,
      description: promptm,
      generatedById: userId,
    });
    return { success: true, message: "Podcast created successfully" };
  } catch (error) {
    console.error("Error creating podcast:", error);
    return { success: false, message: "Failed to create podcast" };
  }
};
