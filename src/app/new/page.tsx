"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FiUpload, FiFile, FiDownload } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createPodcast } from "@/actions/createPodcast";

// API status types
type TaskStatus =
  | "IDLE"
  | "UPLOADING"
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILURE";

// Status response type
interface StatusResponse {
  state: string;
  status?: string;
  result?: {
    audio_url: string;
  };
}

const Page = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("IDLE");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  //   const { data: session } = useSession();
  //   useEffect(() => {
  //     if (!session) {
  //       router.push("/register");
  //     }
  //   }, [session, router]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll for status updates when we have a task ID
  useEffect(() => {
    if (!taskId || taskStatus === "SUCCESS" || taskStatus === "FAILURE") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/status/${taskId}`);
        const data: StatusResponse = await response.json();

        if (data.status === "PENDING" || data.status === "PROCESSING") {
          setTaskStatus(data.status === "PENDING" ? "PENDING" : "PROCESSING");
          setStatusMessage(
            data.status === "PROCESSING"
              ? "Processing your content..."
              : "Waiting for processing to begin..."
          );
        } else if (data.status === "COMPLETED") {
          setTaskStatus("SUCCESS");
          await createPodcast(
            data.result?.audio_url.split("/")[2] || "",
            prompt
          );
          if (data.result?.audio_url) {
            setAudioUrl(`${data.result.audio_url.split("/")[2]}`);
          }
          // Stop polling once successful
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (data.status === "FAILED") {
          setTaskStatus("FAILURE");
          setError(data.result?.error || "An error occurred during processing");
          // Stop polling on failure
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Error polling status:", err);
        setError("Failed to check processing status. Please try again.");
        setTaskStatus("FAILURE");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Start polling
    pollStatus(); // Poll immediately
    pollingIntervalRef.current = setInterval(pollStatus, 2000); // Then every 2 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [taskId, taskStatus]);

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

  const downloadAudio = () => {
    if (audioUrl) {
      router.push("/player/" + audioUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Changed condition to only require prompt
    if (!prompt) {
      setError("Please enter a prompt");
      return;
    }

    try {
      // Reset states
      setError(null);
      setTaskStatus("UPLOADING");
      setStatusMessage("Uploading your request...");

      // Get the form element from the event
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Ensure prompt is added (it should already be there from the form, but just to be safe)
      formData.set("prompt", prompt);

      // Only append file if one is selected and it's not already in the form
      if (file && !formData.has("file")) {
        formData.append("file", file);
      }

      // Update API URL to include correct port 5000
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        // Don't set Content-Type header - fetch will automatically set it with the correct boundary
        // when using FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setTaskStatus("PENDING");
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setTaskStatus("FAILURE");
    }
  };

  // Determine button text based on status
  const getButtonText = () => {
    switch (taskStatus) {
      case "UPLOADING":
        return "Uploading...";
      case "PENDING":
        return "Processing...";
      case "PROCESSING":
        return "Processing...";
      case "SUCCESS":
        return "Play";
      case "FAILURE":
        return "Try Again";
      default:
        return "Generate";
    }
  };

  // Dynamic animation based on task status
  const getBarAnimations = (index: number) => {
    const baseDelay = index * 0.1;

    if (taskStatus === "IDLE") {
      return {
        height: [12, 24, 12],
        transition: {
          duration: 0.8 + Math.random() * 0.5,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else if (["UPLOADING", "PENDING"].includes(taskStatus)) {
      // More active, faster animation during upload/pending
      return {
        height: [5, 30, 5],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else if (taskStatus === "PROCESSING") {
      // Most active during processing
      return {
        height: [8, 38, 8],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          delay: baseDelay,
        },
      };
    } else if (taskStatus === "SUCCESS") {
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

  // Update button disabled state to make file optional
  // This should be in your render section near the button
  const renderSubmitButton = () => (
    <motion.button
      type={taskStatus === "SUCCESS" ? "button" : "submit"}
      className={`w-full py-3 px-6 rounded-full font-medium flex items-center justify-center ${
        taskStatus === "SUCCESS"
          ? "bg-chart-2 text-white"
          : taskStatus === "FAILURE"
          ? "bg-destructive/90 text-white"
          : "bg-primary text-primary-foreground"
      }`}
      // Only require prompt, file is optional now
      disabled={
        !prompt ||
        (taskStatus !== "IDLE" &&
          taskStatus !== "SUCCESS" &&
          taskStatus !== "FAILURE")
      }
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={taskStatus === "SUCCESS" ? downloadAudio : undefined}
    >
      {["UPLOADING", "PENDING", "PROCESSING"].includes(taskStatus) ? (
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
        <>
          {taskStatus === "SUCCESS" && <FiDownload className="mr-2" />}
          {getButtonText()}
        </>
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

      {/* Updated form with encType attribute */}
      <motion.form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
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
              : taskStatus === "SUCCESS"
              ? "border-chart-2 bg-chart-2/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={taskStatus === "IDLE" ? handleDragOver : undefined}
          onDragLeave={taskStatus === "IDLE" ? handleDragLeave : undefined}
          onDrop={taskStatus === "IDLE" ? handleDrop : undefined}
          onClick={taskStatus === "IDLE" ? triggerFileInput : undefined}
          whileHover={taskStatus === "IDLE" ? { scale: 1.01 } : {}}
          whileTap={taskStatus === "IDLE" ? { scale: 0.99 } : {}}
        >
          <input
            type="file"
            name="file" // Important: add name attribute for form submission
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={taskStatus !== "IDLE" && taskStatus !== "FAILURE"}
          />

          {file ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center mb-2">
                {taskStatus === "SUCCESS" ? (
                  <FiDownload className="text-chart-2 text-3xl" />
                ) : (
                  <FiFile className="text-primary text-3xl" />
                )}
              </div>
              <p className="text-foreground font-medium text-lg">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              {taskStatus !== "IDLE" && taskStatus !== "FAILURE" && (
                <p className="text-primary mt-2">{statusMessage}</p>
              )}

              {taskStatus === "SUCCESS" && (
                <motion.button
                  type="button"
                  onClick={downloadAudio}
                  className="mt-4 bg-chart-2 text-white px-4 py-2 rounded-full flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiDownload className="mr-2" /> Download Audio
                </motion.button>
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

        {/* Prompt Input Area - Updated to indicate it's required */}
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
              name="prompt" // Important: add name attribute for form submission
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-xl bg-card text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none min-h-[120px]"
              placeholder="What topics would you like to learn about today?"
              disabled={taskStatus !== "IDLE" && taskStatus !== "FAILURE"}
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

        {/* Use the updated submit button */}
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
              taskStatus === "SUCCESS"
                ? "bg-chart-2"
                : taskStatus === "FAILURE"
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
