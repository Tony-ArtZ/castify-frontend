"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { FaMusic } from "react-icons/fa";
import { motion } from "motion/react";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  if (session) {
    window.location.href = "/";
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        redirectTo: "/",
      });
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-card p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-lg rounded-xl border border-border/50 shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                <FaMusic className="h-8 w-8" />
              </div>
            </motion.div>

            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Welcome to Castify
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue to your account
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 font-medium relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
                <FaGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
                {isLoading && (
                  <div className="absolute right-4 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="px-8 py-4 bg-secondary/30 text-center text-sm text-muted-foreground"
          >
            <p>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} MIT Castify. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
