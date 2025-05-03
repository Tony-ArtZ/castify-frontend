"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

// Define podcast type based on expected schema
type Podcast = {
  id: string;
  name: string;
  description?: string;
  url: string;
  generatedById: string;
  createdAt: Date;
};

const PlaylistPage = ({ fetchedPodcasts }: { fetchedPodcasts: Podcast[] }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>(fetchedPodcasts);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePodcastClick = (url: string) => {
    router.push(`/player/${url}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 p-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Podcasts
      </motion.h1>

      {podcasts.length === 0 ? (
        <motion.div
          className="text-center p-10 bg-purple-900/50 rounded-xl max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xl text-white">You don't have any podcasts yet.</p>
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
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(0,0,0,0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePodcastClick(podcast.url)}
              className="bg-purple-900 rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="relative h-48 w-full">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-800 h-full w-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {podcast.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
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
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-white">
                  {podcast.title}
                </h2>
                {podcast.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {podcast.description}
                  </p>
                )}
                <p className="text-purple-200 text-xs">
                  {new Date(podcast.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
export default PlaylistPage;
