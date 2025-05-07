"use server";

import { db } from "@/db";
import { podcasts, podcastAudio } from "@/db/schema";
import { auth } from "../../auth";
import { z } from "zod";
import { embed, experimental_generateSpeech, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const SPEAKER_VOICES = {
  S1: "alloy", // Default voice for Speaker 1
  S2: "ash", // Default voice for Speaker 2
};

const generateVoice = async (text: string, voice: string) => {
  try {
    const audio = await experimental_generateSpeech({
      model: openai.speech("tts-1"),
      text,
      voice,
    });

    return audio.audio.uint8Array;
  } catch (error) {
    console.error("Error generating voice:", error);
    throw new Error("Failed to generate voice");
  }
};

const generateConversation = async (conversation: string) => {
  try {
    const lines = conversation.split("\n");
    const speechPromises = [];

    for (const line of lines) {
      const match = line.match(/^\[(S[12])\]\s*(.*)/);

      if (!match) {
        console.warn("Skipping invalid line format:", line);
        continue;
      }

      const [, speaker, text] = match;
      const voice =
        SPEAKER_VOICES[speaker.trim() as keyof typeof SPEAKER_VOICES];
      if (!voice) {
        console.warn("No voice found for speaker:", speaker);
        continue;
      }
      const speechPromise = generateVoice(text, voice);
      speechPromises.push(speechPromise);
    }
    const audioChunks = await Promise.all(speechPromises);

    const combinedAudio = Buffer.concat(
      audioChunks.map((chunk) => Buffer.from(chunk))
    );

    return combinedAudio;
  } catch (error) {
    console.error("Error generating conversation audio:", error);
    throw new Error("Failed to generate conversation audio");
  }
};

export const createPodcast = async (prompt: string) => {
  try {
    console.log("Creating podcast with prompt:", prompt);

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
        conversation: z
          .string()
          .describe(
            "#IMPORTANT : Conversation in Format of as [S1] or [S2] at the start, alternating between speakers. Keep it short and maximum 5 lines. \n\n"
          ),
        tags: z.string(),
      }),
      prompt:
        "You are a Podcast generator. Generate name, the conversation and tags, for the following prompt. For converation Format each line as [S1] or [S2] at the start, alternating between speakers. The provided information is: " +
        prompt,
    });

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: result.object.name + " " + result.object.tags,
    });
    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    if (!result.object) {
      throw new Error("Failed to generate podcast data");
    }

    const audio = await generateConversation(result.object.conversation);

    const [audioEntry] = await db
      .insert(podcastAudio)
      .values({
        audioData: audio,
      })
      .returning({ id: podcastAudio.id });

    if (!audioEntry || !audioEntry.id) {
      throw new Error("Failed to save audio data");
    }

    // Use the audio ID as the podcast URL
    const [data] = await db
      .insert(podcasts)
      .values({
        url: audioEntry.id,
        name: result.object.name,
        tags: result.object.tags,
        description: prompt,
        embedding: embedding,
        generatedById: userId,
      })
      .returning({
        id: podcasts.id,
      });

    return {
      success: true,
      message: "Podcast created successfully",
      id: data.id,
    };
  } catch (error) {
    console.error("Error creating podcast:", error);
    return { success: false, message: "Failed to create podcast" };
  }
};
