"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import AudioSpectrum from "react-audio-spectrum";

// Task response interface
interface TaskResponse {
  id: string;
  status: string;
  created_at: string;
  result?: {
    audio_url: string;
    message: string;
  };
  error?: string;
}

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  // const { data: session } = useSession();

  // // Use effect for authentication check to avoid React hydration errors
  // useEffect(() => {
  //   if (!session) {
  //     router.push("/register");
  //   }
  // }, [session, router]);

  return <WavPlayer id={id as string} />;
}

function WavPlayer({ id }: { id: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Additional state for task info
  const [taskInfo, setTaskInfo] = useState<TaskResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Loading...");

  // Fetch task status on component mount
  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch task status from the backend
        const response = await fetch(`http://localhost:5000/audio/${id}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch task status: ${response.statusText}`
          );
        }

        // Check content type before parsing
        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          // Handle JSON response
          const data: TaskResponse = await response.json();
          setTaskInfo(data);

          // Check if task is completed and has audio URL
          if (data.status === "COMPLETED" && data.result?.audio_url) {
            // Set the full audio URL with the server base URL
            setAudioUrl(`http://localhost:5000${data.result.audio_url}`);

            // Extract a title from the audio URL
            const audioFileName =
              data.result.audio_url.split("/").pop() || "Audio";
            setTitle(decodeURIComponent(audioFileName).replace(/_/g, " "));
          } else if (data.status === "FAILED") {
            setError(data.error || "Task processing failed");
          } else if (["PENDING", "PROCESSING"].includes(data.status)) {
            setError(
              "Audio is still being processed. Please check back later."
            );
          }
        } else if (contentType.includes("audio/")) {
          // Handle direct audio file response
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);

          setAudioUrl(audioUrl);
          setTaskInfo({
            id: id as string,
            status: "COMPLETED",
            created_at: new Date().toISOString(),
            result: {
              audio_url: audioUrl,
              message: "Audio retrieved successfully",
            },
          });

          // Extract title from URL or use ID
          const filename = id.toString().split("-").pop() || "Audio Track";
          setTitle(filename.replace(/_/g, " "));
        } else {
          throw new Error(`Unexpected content type: ${contentType}`);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch task information"
        );
        console.error("Error fetching task:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTaskStatus();
    }
  }, [id]);

  // Setup audio element when audio URL is available
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;

      // Set the audio source
      audio.src = audioUrl;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoaded(true);
        setAudioReady(true);
        console.log("Audio metadata loaded, ready for playback");
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("canplaythrough", () => setAudioReady(true));
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      audio.load();

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("canplaythrough", () => setAudioReady(true));
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => {
          setAudioReady(true);
        })
        .catch((err) => console.error("Playback error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = Number(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = Number(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-xl bg-card/80 backdrop-blur-xl shadow-2xl p-6 border border-primary/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Now Playing
          </h1>
          <p className="text-primary text-lg">{title}</p>

          {/* Task status info */}
          {taskInfo && taskInfo.status !== "COMPLETED" && (
            <div className="mt-2 text-sm text-muted-foreground">
              Status: <span className="text-primary">{taskInfo.status}</span>
            </div>
          )}
        </div>

        <audio
          ref={audioRef}
          preload="auto"
          id="audio-element"
          crossOrigin="anonymous"
          className="hidden"
        />

        {/* React Audio Spectrum Visualizer with loading/error states */}
        <motion.div
          className="bg-background/30 rounded-2xl mb-8 h-64 flex items-center justify-center relative overflow-hidden border border-primary/5"
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{
            scale: isPlaying ? 1 : 0.98,
            opacity: 1,
          }}
          transition={{ duration: 0.6 }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-primary">Loading audio information...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full w-full text-destructive p-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>{error}</p>
            </div>
          ) : audioRef.current && audioUrl ? (
            <div className="w-full h-full flex flex-col justify-center">
              <AudioSpectrum
                id="audio-spectrum"
                height={250}
                width={900}
                audioId="audio-element"
                audioEle={audioRef.current}
                capColor={"rgba(216, 180, 254, 0.9)"}
                capHeight={2}
                meterWidth={2}
                meterCount={512}
                meterColor={[
                  { stop: 0, color: "rgba(137, 87, 229, 0.8)" },
                  { stop: 0.5, color: "rgba(168, 85, 247, 0.8)" },
                  { stop: 1, color: "rgba(217, 70, 239, 0.7)" },
                ]}
                gap={1}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full text-primary">
              <div className="animate-pulse">Initializing audio...</div>
            </div>
          )}
        </motion.div>

        {/* Progress bar - disabled if no audio */}
        <div className="mb-6">
          <div className="flex justify-between text-muted-foreground text-sm mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative w-full h-2">
            <div className="absolute w-full h-1 bg-muted rounded-full top-[3px]"></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className={`w-full h-2 absolute top-0 ${
                !audioUrl || error
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-0 cursor-pointer"
              } z-10`}
              disabled={!audioUrl || !!error}
            />
            <motion.div
              className="h-1 bg-primary rounded-full absolute top-[3px]"
              style={{
                width:
                  duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                opacity: !audioUrl || error ? 0.3 : 1,
              }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-primary absolute top-0 shadow-lg"
              style={{
                left:
                  duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                transform: "translateX(-50%)",
                opacity: !audioUrl || error ? 0.3 : 1,
              }}
              animate={{ scale: isPlaying ? 1.1 : 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
        </div>

        {/* Controls - disabled if no audio */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <motion.button
            whileHover={{ scale: !audioUrl || error ? 1 : 1.1 }}
            whileTap={{ scale: !audioUrl || error ? 1 : 0.9 }}
            className={`text-muted-foreground transition-colors ${
              !audioUrl || error
                ? "opacity-30 cursor-not-allowed"
                : "hover:text-primary"
            }`}
            disabled={!audioUrl || !!error}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
              />
            </svg>
          </motion.button>

          <motion.button
            onClick={togglePlayPause}
            whileHover={{ scale: !audioUrl || error ? 1 : 1.05 }}
            whileTap={{ scale: !audioUrl || error ? 1 : 0.95 }}
            className={`${
              isPlaying ? "bg-primary/90" : "bg-primary"
            } text-primary-foreground rounded-full p-4 shadow-lg transition-all ${
              !audioUrl || error ? "opacity-30 cursor-not-allowed" : ""
            }`}
            disabled={!audioUrl || !!error}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: !audioUrl || error ? 1 : 1.1 }}
            whileTap={{ scale: !audioUrl || error ? 1 : 0.9 }}
            className={`text-muted-foreground transition-colors ${
              !audioUrl || error
                ? "opacity-30 cursor-not-allowed"
                : "hover:text-primary"
            }`}
            disabled={!audioUrl || !!error}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
              />
            </svg>
          </motion.button>
        </div>

        {/* Volume control - disabled if no audio */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            whileHover={{ scale: !audioUrl || error ? 1 : 1.1 }}
            whileTap={{ scale: !audioUrl || error ? 1 : 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-muted-foreground ${
                !audioUrl || error ? "opacity-30" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </motion.div>
          <div className="relative w-24 h-2">
            <div
              className={`absolute w-full h-1 bg-muted rounded-full top-[3px] ${
                !audioUrl || error ? "opacity-30" : ""
              }`}
            ></div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={`w-full h-2 absolute top-0 ${
                !audioUrl || error
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-0 cursor-pointer"
              } z-10`}
              disabled={!audioUrl || !!error}
            />
            <motion.div
              className={`h-1 bg-primary rounded-full absolute top-[3px] ${
                !audioUrl || error ? "opacity-30" : ""
              }`}
              style={{ width: `${volume * 100}%` }}
            />
            <motion.div
              className={`w-2.5 h-2.5 rounded-full bg-primary absolute top-0 shadow-md ${
                !audioUrl || error ? "opacity-30" : ""
              }`}
              style={{
                left: `${volume * 100}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        {/* Player info - with task ID and creation time */}
        <div className="mt-6 pt-4 border-t border-border flex justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-1"
              >
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
              {audioUrl
                ? "HD"
                : "Task ID: " + (id.toString().substring(0, 8) + "...")}
            </span>
            {taskInfo?.created_at && (
              <span className="text-xs opacity-70">
                Created: {new Date(taskInfo.created_at).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: !audioUrl || error ? 1 : 1.2 }}
              whileTap={{ scale: !audioUrl || error ? 1 : 0.9 }}
              className={`text-muted-foreground transition-colors ${
                !audioUrl || error
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:text-primary"
              }`}
              disabled={!audioUrl || !!error}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: !audioUrl || error ? 1 : 1.2 }}
              whileTap={{ scale: !audioUrl || error ? 1 : 0.9 }}
              className={`text-muted-foreground transition-colors ${
                !audioUrl || error
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:text-primary"
              }`}
              disabled={!audioUrl || !!error}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
