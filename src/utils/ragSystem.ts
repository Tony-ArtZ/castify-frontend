interface RagChunk {
  prompt: string;
  document: string;
}

export class RAGSystem {
  private documents: string[] = [];
  private prompts: string[] = [];
  private chunks: string[] = [];
  private chunkSize: number;

  constructor(chunkSize: number = 500) {
    this.chunkSize = chunkSize;
  }

  addDocument(document: string): void {
    this.documents.push(document);
    this.chunks = this._splitIntoChunks(document);
  }

  addPrompt(prompt: string): void {
    this.prompts.push(prompt);
  }

  private _splitIntoChunks(text: string): string[] {
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      // If adding this sentence doesn't exceed chunk size, add it
      if (currentChunk.length + sentence.length < this.chunkSize) {
        currentChunk += currentChunk ? " " + sentence : sentence;
      } else {
        // If current chunk is already close to the chunk size, store it
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        // If the sentence itself is longer than chunk size, split it further
        if (sentence.length >= this.chunkSize) {
          const words = sentence.split(/\s+/);
          let sentenceChunk = "";

          for (const word of words) {
            if (sentenceChunk.length + word.length + 1 < this.chunkSize) {
              sentenceChunk += sentenceChunk ? " " + word : word;
            } else {
              chunks.push(sentenceChunk.trim());
              sentenceChunk = word;
            }
          }

          if (sentenceChunk) {
            currentChunk = sentenceChunk;
          } else {
            currentChunk = "";
          }
        } else {
          // Start a new chunk with this sentence
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  retrieveRelevantChunks(query: string, topK: number = 3): string[] {
    if (this.chunks.length === 0) {
      return [];
    }

    // Normalize and tokenize the query
    const queryWords = query.toLowerCase().match(/\w+/g) || [];
    const queryWordSet = new Set(queryWords);

    const scoredChunks: [number, string][] = [];

    for (const chunk of this.chunks) {
      const chunkLower = chunk.toLowerCase();
      const chunkWords = chunkLower.match(/\w+/g) || [];
      const chunkWordSet = new Set(chunkWords);

      // Calculate multiple relevance signals
      let exactMatchScore = 0;
      let containsScore = 0;
      let partialMatchScore = 0;

      // 1. Exact word matches
      queryWordSet.forEach((word) => {
        if (chunkWordSet.has(word)) exactMatchScore += 10;
      });

      // 2. Contains matches (substring)
      queryWords.forEach((word) => {
        if (word.length > 3 && chunkLower.includes(word)) {
          containsScore += 5;
        }
      });

      // 3. Partial word matches (prefixes/suffixes)
      queryWords.forEach((queryWord) => {
        if (queryWord.length > 4) {
          chunkWords.forEach((chunkWord) => {
            // Check if the chunk word contains the query word or vice versa
            if (
              chunkWord.length > 4 &&
              (chunkWord.includes(queryWord) || queryWord.includes(chunkWord))
            ) {
              partialMatchScore += 2;
            }
          });
        }
      });

      // Calculate final score as weighted sum of all signals
      const totalScore = exactMatchScore + containsScore + partialMatchScore;

      // Always include some base score so chunks are ranked even without matches
      const finalScore = totalScore + 0.1; // Small base score

      scoredChunks.push([finalScore, chunk]);
    }

    // Sort by score (descending) and return top K
    return scoredChunks
      .sort((a, b) => b[0] - a[0])
      .slice(0, topK)
      .map(([_, chunk]) => chunk);
  }

  createRagStructure(): RagChunk[] {
    const ragStructure: RagChunk[] = [];

    for (const prompt of this.prompts) {
      const relevantChunks = this.retrieveRelevantChunks(prompt);
      for (const chunk of relevantChunks) {
        ragStructure.push({
          prompt,
          document: chunk,
        });
      }
    }

    return ragStructure;
  }

  generateResponse(query: string): string {
    const relevantChunks = this.retrieveRelevantChunks(query);
    if (relevantChunks.length === 0) {
      return "No relevant documents found.";
    }
    return `Generated response based on: ${JSON.stringify(relevantChunks)}`;
  }
}

export function createRagStructure(text: string, prompt: string): RagChunk[] {
  const rag = new RAGSystem();
  rag.addDocument(text);
  rag.addPrompt(prompt);
  return rag.createRagStructure();
}

export function isPdfJsAvailable(): boolean {
  return false; // We're now using server-side processing
}
