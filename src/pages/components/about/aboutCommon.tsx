// src/pages/components/about/aboutCommon.tsx
import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import axiosInstance from "../../../axios";

// ---------- Types ----------
export interface AboutSliderData {
  about_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
}

export interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
  pdf_file: string | null;
}

export interface AboutCardData {
  id: number;
  type: "Company" | "Service" | "News" | "Events" | "Brand";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  createdAt: string;
}

export interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: string;
  logo_img_file: string;
  created_at: string;
  updated_at: string;
}

export interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Utils ----------
export const API_BASE_URL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
export const buildImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

// ---------- Animation Variants ----------
export const lineVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const wordVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const bounceVariants: Variants = {
  hidden: { opacity: 0, x: -50, scale: 0.95 },
  visible: {
    opacity: 1,
    x: [-50, 20, -10, 5, 0],
    scale: [0.95, 1.05, 0.98, 1.02, 1],
    transition: {
      x: { duration: 0.8, times: [0, 0.3, 0.5, 0.7, 1], ease: "easeOut" },
      scale: { duration: 0.8, times: [0, 0.3, 0.5, 0.7, 1], ease: "easeOut" },
      opacity: { duration: 0.6 },
    },
  },
};

// ---------- Shared UI Components ----------
interface AnimatedTextProps {
  text: string;
  className?: string;
  variants?: Variants;
  perWord?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  variants,
  perWord = true,
}) => {
  if (!perWord) {
    return (
      <motion.div
        variants={variants || containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={className}
      >
        {text}
      </motion.div>
    );
  }

  const words = text.split(/\s+/).filter(word => word.length > 0);

  return (
    <motion.div
      variants={variants || containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          key={`word-${index}`}
          variants={wordVariants}
          className="inline-block mr-2 whitespace-nowrap"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial="offscreen"
    whileInView="onscreen"
    viewport={{ once: true, amount: 0.5 }}
    className="relative flex justify-center items-center mb-16"
  >
    <AnimatedText
      text={children?.toString() || ""}
      className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter text-center"
    />
    <motion.div
      className="mt-4 h-1 w-24 bg-[#ed1c24] absolute bottom-0"
      variants={{
        offscreen: { scaleX: 0 },
        onscreen: {
          scaleX: 1,
          transition: { duration: 0.7, delay: 0.3, ease: "easeOut" },
        },
      }}
      style={{ originX: 0.5 }}
    />
  </motion.div>
);

// ---------- Improved LandingLoader (TypeScript-safe, no conditional spread) ----------
export const LandingLoader: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Define transitions without conditional spread
  const spinnerTransition = prefersReducedMotion
    ? { duration: 0 }
    : { repeat: Infinity, duration: 1, ease: "linear" as const };

  const shineAnimation = prefersReducedMotion
    ? {}
    : {
        animate: { x: ["-100%", "100%"] },
        transition: { repeat: Infinity, duration: 3, ease: "linear" as const },
      };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 0.95,
        filter: "blur(4px)",
        transition: { duration: 0.6, ease: "easeInOut" },
      }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 z-50"
      aria-label="Loading, please wait"
      role="status"
    >
      {/* Animated shine overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
        {...shineAnimation}
      />

      {/* Spinner - uses the previously unused spinnerTransition */}
      <motion.div
        className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mb-6"
        animate={{ rotate: 360 }}
        transition={spinnerTransition}
      />

      {/* Logo container – replace with your actual logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <img
          src="/logo-white.svg" // 👈 Replace with your actual logo path
          alt="Company Logo"
          className="w-16 h-16 md:w-20 md:h-20 object-contain"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </motion.div>

      {/* Animated gradient text – conditional animation without spread */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-yellow-300 to-white bg-clip-text text-transparent bg-[length:200%_auto] text-center px-4 font-inter"
        {...(prefersReducedMotion
          ? {}
          : {
              animate: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] },
              transition: { repeat: Infinity, duration: 4, ease: "linear" as const },
            })}
      >
        Empowering The Nation
      </motion.h1>

      {/* Optional loading tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 text-white/60 text-sm font-medium tracking-wide"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};