"use server";

import pdf from "pdf-parse";

export async function extractTextFromPDF(
  formData: FormData
): Promise<{ text: string; success: boolean; error?: string }> {
  try {
    const file = formData.get("pdf") as File;

    if (!file) {
      return { text: "", success: false, error: "No PDF file provided" };
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use pdf-parse to extract text
    const data = await pdf(buffer);

    // data.text contains all the text content
    const fullText = data.text;

    console.log(
      `Successfully extracted text from PDF (${data.numpages} pages)`
    );
    return {
      text: fullText.trim(),
      success: true,
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
