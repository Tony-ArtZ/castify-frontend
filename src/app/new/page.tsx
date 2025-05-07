"use client";
import { useState, useRef } from "react";
import { motion } from "motion/react";
import { FiUpload, FiFile } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createPodcast } from "@/actions/createPodcast";
// Import our new server action instead of the client-side function
import { extractTextFromPDF } from "@/actions/processPdf";

// Simplified status types
type Status = "IDLE" | "PROCESSING" | "SUCCESS" | "FAILURE";

const Page = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("IDLE");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    try {
      // Reset states
      setError(null);
      setStatus("PROCESSING");
      setStatusMessage("Creating your podcast...");

      // Process file through RAG if available
      let enhancedPrompt = prompt;
      if (file) {
        try {
          setStatusMessage("Processing PDF content...");
          // Use the server action to extract text from PDF
          const formData = new FormData();
          formData.append("pdf", file);

          // Call the server action
          const result = await extractTextFromPDF(formData);

          if (result.success && result.text) {
            enhancedPrompt = `Based on the following document: ${result.text}\n\nPrompt: ${prompt}`;
            console.log("PDF processed successfully:", result.text);
            setStatusMessage("PDF processed successfully, creating podcast...");
          } else if (result.error) {
            console.error("PDF processing error:", result.error);
            // Continue with just the prompt if PDF processing fails
            setStatusMessage(
              "PDF processing had issues, continuing with basic prompt..."
            );
          }
        } catch (error) {
          console.error("Error processing PDF:", error);
          // Continue with just the prompt if PDF processing fails
        }
      }

      // Call the createPodcast function directly
      const result = await createPodcast(enhancedPrompt);

      if (result.success && result.id) {
        setStatus("SUCCESS");
        setStatusMessage("Podcast created successfully!");
        // Navigate to player page with the podcast ID
        router.push(`/player/${result.id}`);
      } else {
        throw new Error(result.message || "Failed to create podcast");
      }
    } catch (err) {
      console.error("Podcast creation error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setStatus("FAILURE");
    }
  };

  // Determine button text based on status
  const getButtonText = () => {
    switch (status) {
      case "PROCESSING":
        return "Creating...";
      case "SUCCESS":
        return "Success!";
      case "FAILURE":
        return "Try Again";
      default:
        return "Generate";
    }
  };

  // Dynamic animation based on task status
  const getBarAnimations = (index: number) => {
    const baseDelay = index * 0.1;

    if (status === "IDLE") {
      return {
        height: [12, 24, 12],
        transition: {
          duration: 0.8 + Math.random() * 0.5,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else if (status === "PROCESSING") {
      // Most active during processing
      return {
        height: [8, 38, 8],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else if (status === "SUCCESS") {
      // Celebratory wave on success
      return {
        height: [10, 25, 10],
        scale: [1, 1.1, 1],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else {
      // Subdued for failure
      return {
        height: [5, 10, 5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    }
  };

  const renderSubmitButton = () => (
    <motion.button
      type="submit"
      className={`w-full py-3 px-6 rounded-full font-medium flex items-center justify-center ${
        status === "SUCCESS"
          ? "bg-chart-2 text-white"
          : status === "FAILURE"
          ? "bg-destructive/90 text-white"
          : "bg-primary text-primary-foreground"
      }`}
      disabled={!prompt || (status !== "IDLE" && status !== "FAILURE")}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {status === "PROCESSING" ? (
        <div className="flex items-center">
          <motion.div
            className="h-4 w-4 rounded-full bg-primary-foreground mr-2"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8],
              transition: { repeat: Infinity, duration: 1.5 },
            }}
          />
          {getButtonText()}
        </div>
      ) : (
        getButtonText()
      )}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-background h-full flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center"
      >
        <FaSpotify className="text-primary text-4xl mr-3" />
        <h1 className="text-4xl font-bold text-foreground">Castify</h1>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-destructive/20 text-destructive p-3 rounded-lg mb-4 text-center"
        >
          {error}
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* PDF Upload Area */}
        <motion.div
          className={`border-2 border-dashed rounded-xl p-10 mb-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : status === "SUCCESS"
              ? "border-chart-2 bg-chart-2/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={status === "IDLE" ? handleDragOver : undefined}
          onDragLeave={status === "IDLE" ? handleDragLeave : undefined}
          onDrop={status === "IDLE" ? handleDrop : undefined}
          onClick={status === "IDLE" ? triggerFileInput : undefined}
          whileHover={status === "IDLE" ? { scale: 1.01 } : {}}
          whileTap={status === "IDLE" ? { scale: 0.99 } : {}}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={status !== "IDLE" && status !== "FAILURE"}
          />

          {file ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center mb-2">
                <FiFile className="text-primary text-3xl" />
              </div>
              <p className="text-foreground font-medium text-lg">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              {status === "PROCESSING" && (
                <p className="text-primary mt-2">{statusMessage}</p>
              )}
            </motion.div>
          ) : (
            <motion.div className="flex flex-col items-center">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  transition: { duration: 2, repeat: Infinity },
                }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
              >
                <FiUpload className="text-primary text-2xl" />
              </motion.div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Drop your PDF file here (Optional)
              </h3>
              <p className="text-muted-foreground">or click to browse</p>
            </motion.div>
          )}
        </motion.div>

        {/* Prompt Input Area */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Enter your prompt (Required)
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-xl bg-card text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none min-h-[120px]"
              placeholder="What topics would you like to learn about today?"
              disabled={status !== "IDLE" && status !== "FAILURE"}
            />
            <motion.div
              className="absolute bottom-3 right-3 h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: prompt ? `${Math.min(prompt.length / 2, 100)}%` : "0%",
              }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </motion.div>

        {/* Submit button */}
        {renderSubmitButton()}
      </motion.form>

      {/* Dynamic Sound Wave Animation */}
      <motion.div
        className="flex items-center gap-1 mt-10 min-h-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 ${
              status === "SUCCESS"
                ? "bg-chart-2"
                : status === "FAILURE"
                ? "bg-destructive/70"
                : "bg-primary"
            }`}
            animate={getBarAnimations(i)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Page;
