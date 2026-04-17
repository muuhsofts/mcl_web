// components/about/aboutCommon.tsx
import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
  total_viewers: string;   // ✅ changed from number to string
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

export const LandingLoader: React.FC = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 z-50"
  >
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
    >
      <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    </motion.div>
    <AnimatedText
      text="Empowering The Nation"
      className="text-2xl font-bold text-white tracking-wide font-inter"
    />
  </motion.div>
);