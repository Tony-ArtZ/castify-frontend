"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Session } from "next-auth";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
};

type LandingPageProps = {
  session: Session | null;
};

// Animated stars background
const StarryBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, Math.random() * 0.5 + 0.3, 0.1],
            scale: [1, Math.random() * 0.3 + 1, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Cosmic nebula effect
const CosmicNebula = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-5 opacity-60">
      <motion.div
        className="absolute w-full h-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(90, 20, 150, 0.2) 0%, rgba(10, 10, 30, 0) 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 800 + 400,
            height: Math.random() * 800 + 400,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(${Math.floor(
              Math.random() * 100 + 50
            )}, ${Math.floor(Math.random() * 20 + 10)}, ${Math.floor(
              Math.random() * 150 + 100
            )}, 0.15) 0%, rgba(10, 10, 30, 0) 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * 40 - 20],
          }}
          transition={{
            duration: Math.random() * 40 + 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Interactive audio waves animation
const AudioWaveform = () => {
  const bars = Array.from({ length: 20 });

  return (
    <div className="flex items-end justify-center h-14 gap-[2px] my-8">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm bg-gradient-to-t from-purple-700 via-fuchsia-600 to-violet-400"
          animate={{
            height: [
              Math.random() * 10 + 5,
              Math.random() * 35 + 10,
              Math.random() * 10 + 5,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        ></motion.div>
      ))}
    </div>
  );
};

// Animated feature card with depth and interaction
const FeatureCard = ({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute -inset-0.5 ${color} rounded-xl blur opacity-60`}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-xl p-6 border border-purple-800/20 overflow-hidden z-10"
        whileHover={{
          y: -8,
          boxShadow: "0 20px 40px -15px rgba(124, 58, 237, 0.3)",
          transition: { duration: 0.3 },
        }}
      >
        {/* Animated accent element */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-purple-800/10 blur-2xl" />
        <div className="absolute -left-12 -top-12 w-24 h-24 rounded-full bg-violet-800/10 blur-2xl" />

        <div className="relative z-10">
          <motion.div
            className={`${
              isHovered ? "text-white" : "text-purple-400"
            } mb-5 text-4xl transition-colors duration-300`}
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>

          <motion.h3
            className="text-xl font-semibold mb-3 text-white/90"
            animate={isHovered ? { color: "#ffffff" } : {}}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>

          <motion.p
            className="text-purple-200/70 text-sm"
            animate={isHovered ? { color: "rgba(233, 213, 255, 0.9)" } : {}}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Interactive corner accent */}
        <motion.div
          className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
          animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute bottom-2 right-2 w-12 h-12 border-t border-l border-purple-400/30 rounded-tl-xl" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Orbiting particles around elements
const OrbitingParticles = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-0.75px",
              marginTop: "-0.75px",
            }}
            animate={{
              x: [x, x * Math.cos(0.5), x],
              y: [y, y * Math.sin(0.5), y],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        );
      })}
      {children}
    </div>
  );
};

// Floating elements animation
const FloatingElement = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPageClient({ session }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for parallax effects
  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10"
        >
          <path
            fillRule="evenodd"
            d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
            clipRule="evenodd"
          />
          <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
        </svg>
      ),
      title: "Multi-Speaker Synthesis",
      description:
        "Create dynamic podcasts with uniquely crafted AI voices that engage in natural, fluid conversations with distinct personalities.",
      color: "bg-gradient-to-r from-purple-600 to-violet-600",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10"
        >
          <path
            fillRule="evenodd"
            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
            clipRule="evenodd"
          />
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
        </svg>
      ),
      title: "PDF Content Analysis",
      description:
        "Transform documents into engaging audio content with our advanced extraction system that captures key insights and themes.",
      color: "bg-gradient-to-r from-indigo-600 to-blue-600",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10"
        >
          <path
            fillRule="evenodd"
            d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Semantic Embeddings",
      description:
        "Our AI understands content meaning, not just keywords, creating a truly intelligent system for content organization and discovery.",
      color: "bg-gradient-to-r from-fuchsia-600 to-pink-600",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10"
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Neural Recommendations",
      description:
        "Discover perfectly matched content through our neural recommendation system that analyzes deep semantic connections between podcasts.",
      color: "bg-gradient-to-r from-blue-600 to-cyan-600",
    },
  ];

  return (
    <>
      <StarryBackground />
      <CosmicNebula />

      <div
        ref={containerRef}
        className="relative min-h-screen w-full overflow-hidden"
      >
        {/* Animated floating shapes */}
        <div className="absolute inset-0 -z-5 overflow-hidden">
          <motion.div
            className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-purple-900/10 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-indigo-900/10 blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 -z-5 opacity-10">
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.1)_1px,transparent_1px)]"
            style={{ backgroundSize: "30px 30px" }}
          />
        </div>

        {/* User profile with glowing effect and logout section */}
        {session?.user && (
          <motion.div
            className="absolute top-6 right-6 flex items-center gap-4 z-30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="flex items-center gap-3 bg-black/40 p-2 rounded-xl pr-5 backdrop-blur-lg border border-purple-500/30 relative overflow-hidden"
              whileHover={{
                boxShadow: "0 0 25px rgba(139,92,246,0.4)",
                scale: 1.03,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 opacity-20 -z-10"
                animate={{
                  background: [
                    "radial-gradient(circle at 30% 50%, rgba(124,58,237,0.5), rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle at 70% 50%, rgba(139,92,246,0.5), rgba(0,0,0,0) 70%)",
                    "radial-gradient(circle at 30% 50%, rgba(124,58,237,0.5), rgba(0,0,0,0) 70%)",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {session.user.image && (
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-500/50 blur-sm"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={44}
                    height={44}
                    className="rounded-full relative z-10 border-2 border-purple-500/30"
                  />
                </div>
              )}
              <div className="text-white">
                <p className="font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-purple-300/80">
                  {session.user.email}
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={() => signOut({ callbackUrl: "/register" })}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Animated border effect */}
              <motion.span
                className="absolute inset-0 rounded-md bg-gradient-to-r from-red-500 to-pink-500 opacity-70 blur-sm group-hover:opacity-100 group-hover:blur transition-all duration-300"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(239,68,68,0.7), rgba(236,72,153,0.7))",
                    "linear-gradient(180deg, rgba(239,68,68,0.7), rgba(236,72,153,0.7))",
                    "linear-gradient(270deg, rgba(239,68,68,0.7), rgba(236,72,153,0.7))",
                    "linear-gradient(0deg, rgba(239,68,68,0.7), rgba(236,72,153,0.7))",
                    "linear-gradient(90deg, rgba(239,68,68,0.7), rgba(236,72,153,0.7))",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative block bg-black/70 text-white py-2 px-5 rounded-md backdrop-blur-sm border border-red-500/20 font-medium">
                Logout
              </span>
            </motion.button>
          </motion.div>
        )}

        <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto px-6 pt-32 pb-20">
          {/* Hero Section with 3D effect */}
          <motion.div
            className="text-center mb-32 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{
              transform: isMounted
                ? `perspective(1000px) rotateY(${
                    mousePosition.x * 0.005
                  }deg) rotateX(${-mousePosition.y * 0.005}deg)`
                : "none",
            }}
          >
            {/* Animated glowing orb */}
            <motion.div
              className="absolute left-1/2 -top-16 -translate-x-1/2 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main title with animated gradient */}
            <div className="relative inline-block">
              {/* <motion.div
                className="absolute -inset-px rounded-2xl opacity-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  background: [
                    "linear-gradient(90deg, rgba(139,92,246,0.8), rgba(168,85,247,0.8), rgba(139,92,246,0.8))",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              /> */}

              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative text-7xl font-black tracking-tight mb-4 bg-clip-text text-transparent p-2"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #c084fc, #a855f7, #8b5cf6, #a855f7, #c084fc)",
                  backgroundSize: "200% auto",
                  animation: "gradient 8s linear infinite",
                }}
              >
                Castify
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-2xl text-purple-100 max-w-2xl mx-auto mt-6 leading-relaxed">
                Where AI crafts the perfect
                <span className="relative inline-block mx-2 px-1">
                  <span className="absolute inset-0 bg-purple-500/20 rounded blur-sm"></span>
                  <span className="relative">podcast experience</span>
                </span>
              </p>

              <p className="text-purple-300/70 mt-3">
                Crafted by Team Neurocraft for the MIT Hackathon
              </p>
            </motion.div>

            <AudioWaveform />

            {/* Action buttons with advanced hover effects */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 justify-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/new" className="group relative">
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg opacity-75 blur-sm group-hover:opacity-100 group-hover:blur"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="relative flex items-center justify-center gap-2 bg-black/80 text-white py-3.5 px-7 rounded-lg border border-purple-500/20 backdrop-blur-xl font-medium text-lg overflow-hidden z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Animated particles */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white/80"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                      }}
                      transition={{
                        duration: Math.random() + 0.5,
                        delay: Math.random() * 0.3,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create New Podcast
                </motion.div>
              </Link>

              <Link href="/playlist" className="group relative">
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/70 to-fuchsia-600/70 rounded-lg opacity-75 blur-sm group-hover:opacity-100 group-hover:blur"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="relative flex items-center justify-center gap-2 bg-black/80 text-white py-3.5 px-7 rounded-lg border border-indigo-500/20 backdrop-blur-xl font-medium text-lg z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Browse Podcasts
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* About section with animated border */}
          <motion.div
            className="w-full mb-24 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-violet-500/20 blur-lg -z-10"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(139,92,246,0.2), rgba(192,132,252,0.2), rgba(139,92,246,0.2))",
                  "linear-gradient(90deg, rgba(139,92,246,0.2), rgba(192,132,252,0.2), rgba(139,92,246,0.2))",
                  "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(192,132,252,0.2), rgba(139,92,246,0.2))",
                  "linear-gradient(45deg, rgba(139,92,246,0.2), rgba(192,132,252,0.2), rgba(139,92,246,0.2))",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="relative bg-black/40 rounded-xl border border-purple-500/20 backdrop-blur-lg p-8"
              whileHover={{ boxShadow: "0 0 30px rgba(139,92,246,0.2)" }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-3xl font-bold text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <OrbitingParticles>
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-fuchsia-200 px-4">
                    Redefining Podcast Creation
                  </span>
                </OrbitingParticles>
              </motion.h2>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <div className="text-purple-100/90">
                  <h3 className="text-xl font-semibold mb-3 text-fuchsia-300">
                    AI Voice Technology
                  </h3>
                  <p className="text-purple-200/80">
                    Our cutting-edge voice synthesis creates remarkably natural
                    conversations between multiple AI speakers, each with their
                    own distinct personality and speaking style.
                  </p>
                </div>

                <div className="text-purple-100/90">
                  <h3 className="text-xl font-semibold mb-3 text-violet-300">
                    Intelligent Content
                  </h3>
                  <p className="text-purple-200/80">
                    Castify analyzes documents and prompts to create
                    semantically rich, contextually relevant podcast content
                    that feels professionally produced and deeply engaging.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Feature grid with enhanced visual styling */}
          <motion.div
            className="w-full mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <FloatingElement>
              <motion.h2
                className="text-3xl font-bold text-center mb-16 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.span
                  className="absolute -inset-8 rounded-full blur-lg opacity-30"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(139,92,246,0.6), rgba(192,132,252,0.6))",
                      "linear-gradient(90deg, rgba(192,132,252,0.6), rgba(139,92,246,0.6))",
                      "linear-gradient(135deg, rgba(139,92,246,0.6), rgba(192,132,252,0.6))",
                      "linear-gradient(45deg, rgba(139,92,246,0.6), rgba(192,132,252,0.6))",
                    ],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-fuchsia-200 to-violet-200">
                  Cutting-Edge Features
                </span>
              </motion.h2>
            </FloatingElement>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                  delay={1.4 + index * 0.1}
                />
              ))}
            </div>
          </motion.div>

          {/* MIT Hackathon Badge with advanced animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            whileHover={{ scale: 1.03, rotate: [0, 1, 0, -1, 0] }}
            className="relative group"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 rounded-xl opacity-75 blur group-hover:opacity-100 group-hover:blur-md transition-all duration-300"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(139,92,246,0.8), rgba(192,132,252,0.8), rgba(139,92,246,0.8))",
                  "linear-gradient(90deg, rgba(192,132,252,0.8), rgba(167,139,250,0.8), rgba(192,132,252,0.8))",
                  "linear-gradient(135deg, rgba(167,139,250,0.8), rgba(139,92,246,0.8), rgba(167,139,250,0.8))",
                  "linear-gradient(45deg, rgba(139,92,246,0.8), rgba(192,132,252,0.8), rgba(139,92,246,0.8))",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative p-8 bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden">
              {/* Abstract shapes */}
              <motion.div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, 360],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              <div className="flex items-center justify-center relative z-10">
                <motion.div
                  className="mr-6"
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30 5L5 17.5L30 30L55 17.5L30 5Z"
                      stroke="url(#grad1)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 42.5L30 55L55 42.5"
                      stroke="url(#grad2)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 30L30 42.5L55 30"
                      stroke="url(#grad3)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="grad1"
                        x1="5"
                        y1="17.5"
                        x2="55"
                        y2="17.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#C084FC" />
                        <stop offset="1" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient
                        id="grad2"
                        x1="5"
                        y1="48.75"
                        x2="55"
                        y2="48.75"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#C084FC" />
                        <stop offset="1" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient
                        id="grad3"
                        x1="5"
                        y1="36.25"
                        x2="55"
                        y2="36.25"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#C084FC" />
                        <stop offset="1" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 2 }}
                >
                  <p className="text-lg font-medium text-purple-200 mb-1 opacity-90">
                    Created for
                  </p>
                  <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-fuchsia-300 mb-1">
                    MIT Hackathon
                  </h3>
                  <p className="text-sm text-purple-300/70">
                    by Team Neurocraft
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Animated footer line */}
          <motion.div
            className="w-full mt-20 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 2 }}
          />
        </div>

        {/* CSS for gradient animation */}
        <style jsx global>{`
          @keyframes gradient {
            0% {
              background-position: 0% center;
            }
            100% {
              background-position: 200% center;
            }
          }
        `}</style>
      </div>
    </>
  );
}
