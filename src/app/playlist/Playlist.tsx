"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InferSelectModel } from "drizzle-orm";
import { podcasts } from "@/db/schema";
import { getNewRecommendations } from "@/actions/getRecommendations";
import { getPodcastFromQuery } from "@/actions/getPodcast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define podcast type based on expected schema
type Podcast = InferSelectModel<typeof podcasts>;

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
    }[] = [];

    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 2 + 0.5;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: `rgba(${140 + Math.random() * 50}, ${20 + Math.random() * 50}, ${
          220 + Math.random() * 35
        }, ${0.2 + Math.random() * 0.3})`,
        velocity: {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
        },
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        if (particle.x < 0 || particle.x > canvas.width)
          particle.velocity.x *= -1;
        if (particle.y < 0 || particle.y > canvas.height)
          particle.velocity.y *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#0c0414]" />
  );
};

const MusicVisualizer = ({ active = false }) => {
  const bars = Array(12).fill(0);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-6 px-4">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] bg-purple-400/70 mx-[1px] rounded-t"
          initial={{ height: Math.random() * 8 + 2 }}
          animate={{
            height: active
              ? [
                  Math.random() * 10 + 4,
                  Math.random() * 18 + 6,
                  Math.random() * 10 + 4,
                ]
              : Math.random() * 8 + 2,
          }}
          transition={{
            duration: 0.4,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeatDelay: Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const PlaylistPage = ({ fetchedPodcasts }: { fetchedPodcasts: Podcast[] }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>(fetchedPodcasts);
  const [loading, setLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [recommendedPodcasts, setRecommendedPodcasts] = useState<Podcast[]>([]);
  const router = useRouter();

  // Search related state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Podcast[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handlePodcastClick = (url: string) => {
    router.push(`/player/${url}`);
  };

  // Function to handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getPodcastFromQuery(searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Error searching podcasts:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to clear search results
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // Function to get recommended podcasts (empty for now)
  const getRecommendedPodcasts = async () => {
    const podcastsRecommendations = await getNewRecommendations();
    if (podcastsRecommendations) {
      setRecommendedPodcasts(podcastsRecommendations as Podcast[]);
    }
    return [];
  };

  useEffect(() => {
    setLoading(true);
    getRecommendedPodcasts()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recommended podcasts:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-8 overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,31,162,0.15),rgba(12,4,20,0))]" />

        <motion.div
          className="relative z-10 w-full max-w-7xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl font-bold mb-12 text-white text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Your Podcasts
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="bg-purple-900/10 border-purple-700/30 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full bg-purple-800/20" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2 bg-purple-800/20" />
                    <Skeleton className="h-4 w-full mb-2 bg-purple-800/20" />
                    <Skeleton className="h-4 w-1/2 bg-purple-800/20" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Decorative radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,31,162,0.15),rgba(12,4,20,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(76,29,149,0.15),rgba(12,4,20,0))]" />

      {/* Decorative shapes */}
      <div className="absolute top-[20%] left-[5%] w-60 h-60 rounded-full bg-purple-600/5 blur-3xl" />
      <div className="absolute bottom-[10%] right-[10%] w-40 h-40 rounded-full bg-indigo-600/5 blur-2xl" />

      <ScrollArea className="h-screen">
        <div className="min-h-screen p-8 max-w-7xl mx-auto relative z-10">
          {/* Search bar */}
          <motion.div
            className="max-w-lg mx-auto mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-purple-900/20 border-purple-700/30 text-purple-100 placeholder-purple-300/50 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-md"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-purple-400" />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-purple-300 hover:text-purple-100"
                    onClick={clearSearch}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="bg-purple-800/70 hover:bg-purple-700 text-purple-100 border border-purple-600/30"
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-purple-100">
                    Search Results
                    <span className="text-sm text-purple-400 ml-3">
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "podcast" : "podcasts"}{" "}
                      found
                    </span>
                  </h2>
                  <Button
                    variant="link"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={clearSearch}
                  >
                    Back to all podcasts
                  </Button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 bg-purple-900/10 border border-purple-800/20 rounded-xl backdrop-blur-sm">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-purple-900/30 mb-4">
                      <Search className="h-8 w-8 text-purple-400/70" />
                    </div>
                    <h3 className="text-xl font-medium text-purple-200">
                      No podcasts found
                    </h3>
                    <p className="text-purple-400 mt-2">
                      Try different keywords or browse recommendations
                    </p>
                  </div>
                ) : (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {searchResults.map((podcast, index) => (
                      <motion.div
                        key={podcast.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.03 }}
                        className="h-full"
                        onHoverStart={() => setHoverIndex(index)}
                        onHoverEnd={() => setHoverIndex(null)}
                      >
                        <Card
                          className="h-full overflow-hidden border-none bg-gradient-to-br from-purple-950/40 to-indigo-950/40 backdrop-blur-md relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                          onClick={() => handlePodcastClick(podcast.id)}
                        >
                          <CardContent className="p-0">
                            <div className="relative h-48 w-full overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-purple-800 to-indigo-900 h-full w-full flex items-center justify-center relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                              >
                                {/* Background circles */}
                                <motion.div
                                  className="absolute h-[300%] w-[100%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-purple-700/30"
                                  animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 360],
                                  }}
                                  transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                                <motion.div
                                  className="absolute h-[200%] w-[70%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-indigo-700/20"
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [360, 0],
                                  }}
                                  transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />

                                <motion.span
                                  className="text-5xl font-bold text-white/90 relative z-10"
                                  animate={
                                    hoverIndex === index
                                      ? { scale: [1, 1.2, 1] }
                                      : {}
                                  }
                                  transition={{ duration: 0.6 }}
                                >
                                  {podcast.name.charAt(0)}
                                </motion.span>
                              </motion.div>

                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-950/80" />

                              <motion.div
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0"
                                whileHover={{ opacity: 1 }}
                              >
                                <Button
                                  variant="secondary"
                                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                  </svg>
                                  Play
                                </Button>
                              </motion.div>

                              <MusicVisualizer active={hoverIndex === index} />
                            </div>

                            <div className="p-6">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-purple-800/30 text-purple-300 text-xs rounded-full border border-purple-700/30">
                                  Search Result
                                </span>
                              </div>
                              <motion.h2
                                className="text-xl font-semibold mb-2 text-purple-50"
                                animate={
                                  hoverIndex === index
                                    ? { color: "#f0abfc" }
                                    : {}
                                }
                                transition={{ duration: 0.3 }}
                              >
                                {podcast.name}
                              </motion.h2>
                              {podcast.description && (
                                <p className="text-purple-200/80 text-sm line-clamp-2 mb-3">
                                  {podcast.description}
                                </p>
                              )}

                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-700/20">
                                <p className="text-purple-300/70 text-xs">
                                  {new Date(
                                    podcast.createdAt
                                  ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <div className="flex space-x-1">
                                  {[1, 2, 3].map((dot) => (
                                    <motion.div
                                      key={dot}
                                      className="w-1.5 h-1.5 rounded-full bg-purple-400/60"
                                      animate={
                                        hoverIndex === index
                                          ? {
                                              scale: [1, 1.5, 1],
                                              opacity: [0.6, 1, 0.6],
                                            }
                                          : {}
                                      }
                                      transition={{
                                        duration: 0.8,
                                        repeat:
                                          hoverIndex === index ? Infinity : 0,
                                        delay: dot * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h1
            className="text-5xl font-bold mb-3 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-fuchsia-200 to-purple-300">
              Your Podcasts
            </span>
          </motion.h1>

          <motion.div
            className="w-28 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-12"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 112, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />

          <AnimatePresence>
            {podcasts.length === 0 ? (
              <motion.div
                className="text-center p-10 bg-purple-900/10 border border-purple-700/20 rounded-xl max-w-md mx-auto backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="mb-6">
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-full bg-purple-900/30 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(168, 85, 247, 0.4)",
                        "0 0 20px rgba(168, 85, 247, 0.2)",
                        "0 0 0 rgba(168, 85, 247, 0.4)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                        stroke="#d8b4fe"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 14V10M6.5 17.5V6.5M13.5 20V4M17 14V10M20.5 17.5V6.5"
                        stroke="#d8b4fe"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                </div>
                <p className="text-xl text-purple-100">
                  You don't have any podcasts yet.
                </p>
                <p className="text-purple-300/70 mt-2 text-sm">
                  Create your first podcast to get started
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {podcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="h-full perspective-1000"
                    onHoverStart={() => setHoverIndex(index)}
                    onHoverEnd={() => setHoverIndex(null)}
                  >
                    <Card
                      className="h-full overflow-hidden border-none bg-gradient-to-br from-purple-950/40 to-indigo-950/40 backdrop-blur-md relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                      onClick={() => handlePodcastClick(podcast.id)}
                    >
                      <CardContent className="p-0">
                        <div className="relative h-48 w-full overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-purple-800 to-indigo-900 h-full w-full flex items-center justify-center relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          >
                            {/* Background circles */}
                            <motion.div
                              className="absolute h-[300%] w-[100%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-purple-700/30"
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <motion.div
                              className="absolute h-[200%] w-[70%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-indigo-700/20"
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [360, 0],
                              }}
                              transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />

                            <motion.span
                              className="text-5xl font-bold text-white/90 relative z-10"
                              animate={
                                hoverIndex === index
                                  ? { scale: [1, 1.2, 1] }
                                  : {}
                              }
                              transition={{ duration: 0.6 }}
                            >
                              {podcast.name.charAt(0)}
                            </motion.span>
                          </motion.div>

                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-950/80" />

                          <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0"
                            whileHover={{ opacity: 1 }}
                          >
                            <Button
                              variant="secondary"
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                              </svg>
                              Play
                            </Button>
                          </motion.div>

                          <MusicVisualizer active={hoverIndex === index} />
                        </div>

                        <div className="p-6">
                          <motion.h2
                            className="text-xl font-semibold mb-2 text-purple-50"
                            animate={
                              hoverIndex === index ? { color: "#f0abfc" } : {}
                            }
                            transition={{ duration: 0.3 }}
                          >
                            {podcast.name}
                          </motion.h2>
                          {podcast.description && (
                            <p className="text-purple-200/80 text-sm line-clamp-2 mb-3">
                              {podcast.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-700/20">
                            <p className="text-purple-300/70 text-xs">
                              {new Date(podcast.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((dot) => (
                                <motion.div
                                  key={dot}
                                  className="w-1.5 h-1.5 rounded-full bg-purple-400/60"
                                  animate={
                                    hoverIndex === index
                                      ? {
                                          scale: [1, 1.5, 1],
                                          opacity: [0.6, 1, 0.6],
                                        }
                                      : {}
                                  }
                                  transition={{
                                    duration: 0.8,
                                    repeat: hoverIndex === index ? Infinity : 0,
                                    delay: dot * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommended Section */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-6 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-purple-400">
                Recommended For You
              </span>
            </motion.h2>

            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent mx-auto mb-10"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 96, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            />

            {recommendedPodcasts.length === 0 ? (
              <motion.div
                className="text-center p-8 bg-purple-900/10 border border-purple-700/20 rounded-xl max-w-lg mx-auto backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <p className="text-lg text-purple-200">
                  No recommendations available yet
                </p>
                <p className="text-purple-300/70 mt-2 text-sm">
                  Listen to more podcasts to get personalized recommendations
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {recommendedPodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 1.0 }}
                    whileHover={{ scale: 1.03 }}
                    className="h-full perspective-1000"
                    onHoverStart={() => setHoverIndex(podcasts.length + index)}
                    onHoverEnd={() => setHoverIndex(null)}
                  >
                    <Card
                      className="h-full overflow-hidden border-none bg-gradient-to-br from-indigo-950/40 to-fuchsia-950/40 backdrop-blur-md relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.2)]"
                      onClick={() => handlePodcastClick(podcast.id)}
                    >
                      <CardContent className="p-0">
                        <div className="relative h-48 w-full overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-indigo-800 to-fuchsia-900 h-full w-full flex items-center justify-center relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          >
                            {/* Background circles - different colors for recommendations */}
                            <motion.div
                              className="absolute h-[300%] w-[100%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-indigo-700/30"
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <motion.div
                              className="absolute h-[200%] w-[70%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-full bg-fuchsia-700/20"
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [360, 0],
                              }}
                              transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />

                            <motion.div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
                              <span className="text-xs font-medium text-white/80">
                                Recommended
                              </span>
                            </motion.div>

                            <motion.span
                              className="text-5xl font-bold text-white/90 relative z-10"
                              animate={
                                hoverIndex === podcasts.length + index
                                  ? { scale: [1, 1.2, 1] }
                                  : {}
                              }
                              transition={{ duration: 0.6 }}
                            >
                              {podcast.name.charAt(0)}
                            </motion.span>
                          </motion.div>

                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-950/80" />

                          <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0"
                            whileHover={{ opacity: 1 }}
                          >
                            <Button
                              variant="secondary"
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                              </svg>
                              Play
                            </Button>
                          </motion.div>

                          <MusicVisualizer
                            active={hoverIndex === podcasts.length + index}
                          />
                        </div>

                        <div className="p-6">
                          <motion.h2
                            className="text-xl font-semibold mb-2 text-purple-50"
                            animate={
                              hoverIndex === podcasts.length + index
                                ? { color: "#e879f9" }
                                : {}
                            }
                            transition={{ duration: 0.3 }}
                          >
                            {podcast.name}
                          </motion.h2>
                          {podcast.description && (
                            <p className="text-purple-200/80 text-sm line-clamp-2 mb-3">
                              {podcast.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-indigo-700/20">
                            <p className="text-indigo-300/70 text-xs">
                              {new Date(podcast.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((dot) => (
                                <motion.div
                                  key={dot}
                                  className="w-1.5 h-1.5 rounded-full bg-fuchsia-400/60"
                                  animate={
                                    hoverIndex === podcasts.length + index
                                      ? {
                                          scale: [1, 1.5, 1],
                                          opacity: [0.6, 1, 0.6],
                                        }
                                      : {}
                                  }
                                  transition={{
                                    duration: 0.8,
                                    repeat:
                                      hoverIndex === podcasts.length + index
                                        ? Infinity
                                        : 0,
                                    delay: dot * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPage;
