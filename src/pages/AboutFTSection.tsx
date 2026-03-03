import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  CalendarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ChartBarIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import { useEffect, useState, ElementType, ComponentType, JSX, useRef } from "react";
import { Helmet } from "react-helmet";

/* ────────────────────── CONSTANTS ────────────────────── */
const PRIMARY_COLOR = "#0069B4";
const SECONDARY_COLOR = "#ed1c24";

/* ────────────────────── UTILITIES ────────────────────── */
const stripHtml = (html: string): string => {
  const txt = html.replace(/<[^>]+>/g, "");
  const el = document.createElement("textarea");
  el.innerHTML = txt;
  return el.value;
};

const cleanForSEO = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/([.!?])\s*([A-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\bIsasubsidiary\b/gi, "Is a subsidiary")
    .replace(/\basa\b/gi, "as a")
    .replace(/\bwithprintaswellasonlineplatforms\b/gi, "with print as well as online platforms")
    .replace(/\bItistheleading\b/gi, "It is the leading")
    .replace(/\bItwasestablished\b/gi, "It was established")
    .replace(/\bMediaCommunicationLimited\b/gi, "Media Communication Limited");
};

const API_BASE_URL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
const buildImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

/* ────────────────────── INTERFACES ────────────────────── */
interface AboutSliderData {
  about_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
}
interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
  pdf_file: string | null;
}
interface AboutCardData {
  id: number;
  type: "Company" | "Service" | "News" | "Events" | "Brand";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  createdAt: string;
}
interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: number;
  logo_img_file: string;
  created_at: string;
  updated_at: string;
}
interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/* ────────────────────── BACKGROUND MOTION WITH RECT WIRE FRAMES ────────────────────── */
const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.4 } }
};

// Flowing gradient animation with #0069B4
const backgroundFlow: Variants = {
  initial: { 
    backgroundPosition: "0% 0%",
  },
  animate: { 
    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
    transition: { 
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    }
  }
};

// Pulsing effect with #0069B4
const pulseEffect: Variants = {
  initial: { opacity: 0.1 },
  animate: { 
    opacity: [0.1, 0.2, 0.1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Floating particles with #0069B4
const floatAnimation = (delay: number): Variants => ({
  initial: { y: 0, x: 0, opacity: 0.1 },
  animate: { 
    y: [0, -30, 0, 30, 0],
    x: [0, 20, -20, 20, 0],
    opacity: [0.1, 0.15, 0.1, 0.15, 0.1],
    transition: {
      duration: 15 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }
  }
});

// Rotating ring with #0069B4
const rotateRing: Variants = {
  initial: { rotate: 0, scale: 1 },
  animate: { 
    rotate: 360,
    scale: [1, 1.1, 1],
    transition: {
      rotate: {
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      },
      scale: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Wire frame animation
const wireFrameAnimation: Variants = {
  initial: { opacity: 0, pathLength: 0 },
  animate: { 
    opacity: [0.1, 0.3, 0.1],
    pathLength: [0, 1, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Moving wire frame grid
const wireFrameGrid: Variants = {
  initial: { x: "-100%", y: "-100%" },
  animate: { 
    x: ["-100%", "100%", "-100%"],
    y: ["-100%", "100%", "-100%"],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

/* ────────────────────── ANIMATION VARIANTS FOR CONTENT ────────────────────── */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const slideUpBounce: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.8 
    }
  }
};

/* ────────────────────── BACKGROUND WRAPPER WITH RECT WIRE FRAMES #0069B4 ────────────────────── */
const AnimatedBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    {/* Base gradient with #0069B4 flowing animation */}
    <motion.div
      className="absolute inset-0"
      variants={backgroundFlow}
      initial="initial"
      animate="animate"
      style={{ 
        background: `linear-gradient(125deg, 
          ${PRIMARY_COLOR}03 0%, 
          ${PRIMARY_COLOR}08 20%, 
          transparent 40%, 
          ${PRIMARY_COLOR}05 60%, 
          ${PRIMARY_COLOR}01 80%, 
          transparent 100%)`,
        backgroundSize: "300% 300%",
      }}
    />

    {/* Second gradient layer with opposite flow */}
    <motion.div
      className="absolute inset-0"
      animate={{ 
        backgroundPosition: ["100% 100%", "0% 0%", "100% 100%"],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{ 
        background: `radial-gradient(circle at 30% 50%, ${PRIMARY_COLOR}05 0%, transparent 50%)`,
        backgroundSize: "200% 200%",
      }}
    />

    {/* Pulsing glow with #0069B4 */}
    <motion.div
      className="absolute inset-0"
      variants={pulseEffect}
      initial="initial"
      animate="animate"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${PRIMARY_COLOR}10 0%, transparent 70%)`,
      }}
    />

    {/* Grid pattern with #0069B4 - Base grid */}
    <motion.div
      className="absolute inset-0"
      animate={{ 
        opacity: [0.02, 0.04, 0.02],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{
        backgroundImage: `linear-gradient(to right, ${PRIMARY_COLOR} 1px, transparent 1px), 
                          linear-gradient(to bottom, ${PRIMARY_COLOR} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />

    {/* RECTANGULAR WIRE FRAMES - Main Feature */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
      <defs>
        <pattern id="wireframe-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Horizontal lines */}
          <motion.line
            x1="0" y1="0" x2="200" y2="0"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
          />
          <motion.line
            x1="0" y1="50" x2="200" y2="50"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.line
            x1="0" y1="100" x2="200" y2="100"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 2 }}
          />
          <motion.line
            x1="0" y1="150" x2="200" y2="150"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 3 }}
          />
          <motion.line
            x1="0" y1="200" x2="200" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 4 }}
          />

          {/* Vertical lines */}
          <motion.line
            x1="0" y1="0" x2="0" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          />
          <motion.line
            x1="50" y1="0" x2="50" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 1.5 }}
          />
          <motion.line
            x1="100" y1="0" x2="100" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 2.5 }}
          />
          <motion.line
            x1="150" y1="0" x2="150" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 3.5 }}
          />
          <motion.line
            x1="200" y1="0" x2="200" y2="200"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="5,5"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 4.5 }}
          />

          {/* Rectangular frames */}
          <motion.rect
            x="20" y="20" width="160" height="160"
            fill="none"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="8,8"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.rect
            x="40" y="40" width="120" height="120"
            fill="none"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="6,6"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 2 }}
          />
          <motion.rect
            x="60" y="60" width="80" height="80"
            fill="none"
            stroke={PRIMARY_COLOR}
            strokeWidth="1"
            strokeDasharray="4,4"
            variants={wireFrameAnimation}
            initial="initial"
            animate="animate"
            transition={{ delay: 3 }}
          />
        </pattern>
      </defs>
      
      {/* Apply the pattern as a fill */}
      <motion.rect
        x="0" y="0" width="100%" height="100%"
        fill="url(#wireframe-pattern)"
        variants={wireFrameGrid}
        initial="initial"
        animate="animate"
      />
    </svg>

    {/* Additional floating rectangular wire frames */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`wire-rect-${i}`}
        className="absolute border-2"
        style={{
          borderColor: PRIMARY_COLOR,
          borderStyle: "dashed",
          opacity: 0.15,
          width: `${150 + i * 50}px`,
          height: `${100 + i * 40}px`,
          left: `${Math.random() * 80}%`,
          top: `${Math.random() * 80}%`,
          borderRadius: i % 2 === 0 ? "0px" : "8px",
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15 + i * 2,
          repeat: Infinity,
          ease: "linear",
          delay: i * 2,
        }}
      />
    ))}

    {/* Floating particles with #0069B4 */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        variants={floatAnimation(i * 2)}
        initial="initial"
        animate="animate"
        style={{
          width: Math.random() * 200 + 50,
          height: Math.random() * 200 + 50,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `radial-gradient(circle at center, ${PRIMARY_COLOR}15 0%, transparent 70%)`,
          filter: "blur(40px)",
          mixBlendMode: "multiply",
        }}
      />
    ))}

    {/* Rotating rings with #0069B4 */}
    <motion.div
      className="absolute inset-0"
      variants={rotateRing}
      initial="initial"
      animate="animate"
      style={{
        background: `conic-gradient(from 0deg at 50% 50%, 
          transparent 0deg, 
          ${PRIMARY_COLOR}10 90deg, 
          transparent 180deg, 
          ${PRIMARY_COLOR}05 270deg, 
          transparent 360deg)`,
        filter: "blur(30px)",
      }}
    />

    {/* Animated lines with #0069B4 */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={`line-${i}`}
        className="absolute h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${PRIMARY_COLOR}20, transparent)`,
          top: `${30 + i * 20}%`,
        }}
        animate={{
          x: ["-100%", "100%"],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "linear",
          delay: i * 2,
        }}
      />
    ))}

    {/* Animated dots with #0069B4 */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={`dot-${i}`}
        className="absolute w-1 h-1 rounded-full"
        style={{
          backgroundColor: PRIMARY_COLOR,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 4,
        }}
      />
    ))}

    {/* Content */}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

/* ────────────────────── LOADER WITH #0069B4 ────────────────────── */
const LandingLoader: React.FC = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
    className="fixed inset-0 flex flex-col items-center justify-center z-50"
    style={{ background: PRIMARY_COLOR }}
  >
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-2xl font-bold text-white tracking-wide mt-4"
    >
      Loading Our Story...
    </motion.div>
  </motion.div>
);

/* ────────────────────── HERO SECTION ────────────────────── */
const HeroSection: React.FC<{ data: AboutSliderData[] }> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % data.length), 8000);
    return () => clearInterval(timer);
  }, [data.length]);

  if (!data.length) return null;

  const slide = data[currentSlide];
  const img = buildImageUrl(slide.home_img) || "https://via.placeholder.com/1920x1080";

  return (
    <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img src={img} alt={slide.heading || ""} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Animated overlay with #0069B4 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `linear-gradient(45deg, ${PRIMARY_COLOR}10 0%, transparent 50%, ${PRIMARY_COLOR}05 100%)`,
            `linear-gradient(45deg, ${PRIMARY_COLOR}05 0%, transparent 50%, ${PRIMARY_COLOR}10 100%)`,
            `linear-gradient(45deg, ${PRIMARY_COLOR}10 0%, transparent 50%, ${PRIMARY_COLOR}05 100%)`,
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ mixBlendMode: "overlay" }}
      />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
              animate={{ 
                textShadow: [
                  `0 0 20px ${PRIMARY_COLOR}`,
                  `0 0 40px ${PRIMARY_COLOR}`,
                  `0 0 20px ${PRIMARY_COLOR}`,
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {slide.heading || "Shaping Tanzania's Media Landscape"}
            </motion.h1>
            
            {slide.description && (
              <motion.p 
                className="text-base md:text-lg text-gray-200 mb-6 leading-relaxed max-w-xl"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {cleanForSEO(slide.description)}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <motion.button 
                className="group relative px-6 py-3 text-white rounded-full overflow-hidden text-sm font-semibold"
                style={{ backgroundColor: SECONDARY_COLOR }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Discover Our Story</span>
                <motion.div
                  className="absolute inset-0"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <div className="flex gap-2">
                {data.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: idx === currentSlide ? 32 : 12,
                      backgroundColor: idx === currentSlide ? SECONDARY_COLOR : 'rgba(255,255,255,0.3)'
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <span className="text-white/60 text-xs font-medium">Scroll</span>
          <ChevronDownIcon className="w-4 h-4 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ────────────────────── ABOUT SECTION ────────────────────── */
const AboutSection: React.FC<{ content: MwananchiAboutData | null }> = ({ content }) => {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!content) return null;

  const paragraphs = content.description
    .split(/\n\s*\n/)
    .map(cleanForSEO)
    .filter(p => p.trim())
    .slice(0, 2);

  const togglePlay = () => {
    if (iframeRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-16 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            <motion.div variants={fadeInLeft} className="space-y-4">
              <motion.span 
                variants={fadeInUp}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR }}
              >
                Who We Are
              </motion.span>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900"
                variants={fadeInUp}
              >
                {content.category}
              </motion.h2>
              
              <div className="space-y-3">
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    variants={fadeInUp}
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {content.video_link && (
              <motion.div 
                variants={fadeInRight} 
                className="relative"
                onHoverStart={() => setIsVideoHovered(true)}
                onHoverEnd={() => setIsVideoHovered(false)}
              >
                <div className="relative group">
                  <motion.div
                    className="absolute -inset-4 rounded-3xl blur-2xl"
                    style={{ background: PRIMARY_COLOR }}
                    animate={{ 
                      scale: isVideoHovered ? 1.1 : 1,
                      opacity: isVideoHovered ? 0.2 : 0.1
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div
                    className="absolute -inset-2 border-2 border-dashed rounded-2xl"
                    style={{ borderColor: `${PRIMARY_COLOR}30` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-video">
                    <iframe
                      ref={iframeRef}
                      src={`${content.video_link}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                      title={content.category}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isVideoHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center justify-between">
                          <motion.div 
                            className="flex items-center gap-2"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: isVideoHovered ? 1 : 0 }}
                          >
                            <motion.button
                              onClick={togglePlay}
                              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
                              whileHover={{ scale: 1.1, backgroundColor: SECONDARY_COLOR }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isPlaying ? (
                                <PauseCircleIcon className="w-5 h-5 text-white" />
                              ) : (
                                <PlayCircleIcon className="w-5 h-5 text-white" />
                              )}
                            </motion.button>
                            
                            <motion.span className="text-white text-xs font-medium">
                              Watch
                            </motion.span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>
    </AnimatedBackground>
  );
};

/* ────────────────────── VISION MISSION SECTION ────────────────────── */
const VisionMissionSection: React.FC = () => {
  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania.",
      color: PRIMARY_COLOR,
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich lives and empower positive change through superior media.",
      color: SECONDARY_COLOR,
    }
  ];

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-16 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10"
          >
            Our Vision & Mission
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                variants={slideUpBounce}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5"
                    style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` }}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                      style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </AnimatedBackground>
  );
};

/* ────────────────────── VALUES SECTION ────────────────────── */
const ValuesSection: React.FC<{ values: ValueData[]; onCardClick: (v: ValueData) => void }> = ({ values, onCardClick }) => {
  const getIcon = (index: number) => {
    const icons = [ShieldCheckIcon, HeartIcon, LightBulbIcon, UsersIcon, AcademicCapIcon, BriefcaseIcon, GlobeAltIcon, ChartBarIcon];
    return icons[index % icons.length];
  };

  const displayValues = values.slice(0, 4);

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-16 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10"
          >
            Our Core Values
          </motion.h2>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {displayValues.map((value, idx) => {
              const Icon = getIcon(idx);
              
              return (
                <motion.button
                  key={value.value_id}
                  variants={scaleIn}
                  onClick={() => onCardClick(value)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative text-left"
                >
                  <div 
                    className="relative bg-white/90 backdrop-blur-sm p-5 rounded-xl border hover:shadow-lg transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <motion.div 
                      className="w-10 h-10 mb-3 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}15 0%, ${SECONDARY_COLOR}15 100%)` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: PRIMARY_COLOR }} />
                    </motion.div>
                    
                    <h3 className="text-sm font-bold text-gray-900 mb-1 transition-colors duration-300 group-hover" 
                        style={{ color: '#111827' }}>
                      {value.category}
                    </h3>
                    
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {value.description ? value.description.substring(0, 50) + "..." : "Click to learn more"}
                    </p>

                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-px origin-left"
                      style={{ background: `linear-gradient(90deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})` }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </motion.section>
    </AnimatedBackground>
  );
};

/* ────────────────────── REACH SECTION ────────────────────── */
const ReachSection: React.FC<{ subscriptions: SubscriptionData[] }> = ({ subscriptions }) => {
  const displaySubs = subscriptions.slice(0, 5);

  if (!displaySubs.length) return null;

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-16 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10"
          >
            Our Reach
          </motion.h2>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {displaySubs.map((sub, idx) => (
              <motion.div
                key={sub.subscription_id}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <div 
                  className="relative bg-white/90 backdrop-blur-sm p-4 rounded-xl border hover:shadow-lg transition-all text-center"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <img
                      src={buildImageUrl(sub.logo_img_file) || "https://via.placeholder.com/56x56"}
                      alt={sub.category}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  
                  <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">
                    {sub.category}
                  </h3>
                  
                  <div className="text-lg font-bold transition-colors duration-300 group-hover" 
                       style={{ color: PRIMARY_COLOR }}>
                    <CountUp
                      end={sub.total_viewers}
                      duration={2}
                      formattingFn={(v) => 
                        new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v)
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500"></p>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px origin-left"
                    style={{ background: `linear-gradient(90deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})` }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </AnimatedBackground>
  );
};

/* ────────────────────── IMAGE MODAL FOR DISCOVER CARDS ────────────────────── */
const ImageModal: React.FC<{ imageUrl: string; title: string; onClose: () => void }> = ({ imageUrl, title, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="relative max-w-5xl w-full max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-contain"
      />
    </motion.div>
  </motion.div>
);

/* ────────────────────── DISCOVER CARDS WITH FULL IMAGE VIEW ────────────────────── */
const DiscoverCards: React.FC<{ cards: AboutCardData[] }> = ({ cards }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  
  const getIcon = (type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return InformationCircleIcon;
    }
  };

  const displayCards = cards.slice(0, 3);

  if (!displayCards.length) return null;

  return (
    <AnimatedBackground>
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <motion.section 
        className="py-16 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10"
          >
            Discover More
          </motion.h2>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {displayCards.map((card, idx) => {
              const Icon = getIcon(card.type);
              const imageUrl = buildImageUrl(card.imageUrl) || "https://via.placeholder.com/600x400";
              
              return (
                <motion.div
                  key={`${card.type}-${card.id}`}
                  variants={slideUpBounce}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200">
                    {/* Image Container */}
                    <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                      <motion.img
                        src={imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        onClick={() => setSelectedImage({ url: imageUrl, title: card.title })}
                      />
                      
                      {/* Image overlay with view fullscreen button */}
                      <motion.div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        initial={false}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedImage({ url: imageUrl, title: card.title })}
                          className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30"
                        >
                          <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                        </motion.button>
                      </motion.div>
                      
                      {/* Type badge */}
                      <div className="absolute top-3 left-3">
                        <div 
                          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-white/90 backdrop-blur-sm border"
                          style={{ 
                            color: card.type === "Brand" ? PRIMARY_COLOR : 
                                   card.type === "News" ? SECONDARY_COLOR : "#7C3AED",
                            borderColor: card.type === "Brand" ? `${PRIMARY_COLOR}30` : 
                                        card.type === "News" ? `${SECONDARY_COLOR}30` : "#E9D5FF"
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{card.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {card.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {card.description.length > 100 ? `${card.description.slice(0, 100)}...` : card.description}
                      </p>
                      
                      <motion.div whileHover={{ x: 5 }}>
                        <Link
                          to={card.linkUrl}
                          className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-300"
                          style={{ color: PRIMARY_COLOR }}
                        >
                          <span>Learn More</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      </motion.div>
                    </div>

                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-px origin-left"
                      style={{ background: `linear-gradient(90deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})` }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>
    </AnimatedBackground>
  );
};

/* ────────────────────── VALUE MODAL ────────────────────── */
const ValueModal: React.FC<{ value: ValueData; onClose: () => void }> = ({ value, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: -30 }}
      transition={{ type: "spring", damping: 25 }}
      className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <XMarkIcon className="w-5 h-5" />
      </motion.button>

      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}15 0%, ${SECONDARY_COLOR}15 100%)` }}
        >
          <img
            src={buildImageUrl(value.img_file) || "https://via.placeholder.com/80x80"}
            alt={value.category}
            className="w-12 h-12 object-contain"
          />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {value.category}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {value.description || "No description available."}
        </p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4 }}
          className="h-0.5 w-16 rounded-full mx-auto mt-6"
          style={{ background: `linear-gradient(90deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)` }}
        />
      </div>
    </motion.div>
  </motion.div>
);

/* ────────────────────── MAIN PAGE ────────────────────── */
const AboutFTSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [mwananchiContent, setMwananchiContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);

  useEffect(() => {
    const load = async () => {
      const [hero, subs, about, vals, brand, news, event] = await Promise.allSettled([
        axiosInstance.get<AboutSliderData[]>("/api/slider-imgs"),
        axiosInstance.get<{ data: SubscriptionData[] }>("/api/allsubscriptions"),
        axiosInstance.get<{ records: MwananchiAboutData[] }>("/api/about-mwananchi/all"),
        axiosInstance.get<{ values: ValueData[] }>("/api/values/all"),
        axiosInstance.get("/api/latestbrand"),
        axiosInstance.get("/api/latestnew"),
        axiosInstance.get("/api/latestEvent"),
      ]);

      await new Promise(r => setTimeout(r, 800));

      if (hero.status === "fulfilled") setSliderData(hero.value.data ?? []);
      if (subs.status === "fulfilled") setSubscriptions(subs.value.data?.data ?? []);
      if (about.status === "fulfilled" && about.value.data?.records?.length) setMwananchiContent(about.value.data.records[0]);
      if (vals.status === "fulfilled") setValues(vals.value.data?.values ?? []);

      const makeCard = (
        data: any,
        type: AboutCardData["type"],
        idKey: string,
        titleKey: string,
        descKey: string,
        imgKey: string,
        link: string,
        dateKey: string
      ): AboutCardData | null => {
        if (!data?.[idKey]) return null;
        const desc = descKey === "description" && type === "News" ? stripHtml(data[descKey] ?? "") : cleanForSEO(data[descKey] ?? "");
        return {
          id: data[idKey],
          type,
          title: data[titleKey] ?? data.category ?? "Untitled",
          description: desc,
          imageUrl: data[imgKey] ?? null,
          linkUrl: link,
          createdAt: data[dateKey] ?? new Date().toISOString(),
        };
      };

      const potential: (AboutCardData | null)[] = [];
      if (brand.status === "fulfilled") potential.push(makeCard(brand.value.data, "Brand", "brand_id", "category", "description", "brand_img", "/our-brands", "created_at"));
      if (news.status === "fulfilled") potential.push(makeCard(news.value.data.news, "News", "news_id", "category", "description", "news_img", "/company/news", "created_at"));
      if (event.status === "fulfilled") potential.push(makeCard(event.value.data?.event, "Events", "event_id", "event_category", "description", "img_file", "/all-events", "created_at"));

      setCards(potential.filter((c): c is AboutCardData => c !== null));
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-white font-sans"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <ToastContainer position="top-right" theme="colored" />
      
      <AnimatePresence>
        {selectedValue && <ValueModal value={selectedValue} onClose={() => setSelectedValue(null)} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Helmet>
            <title>About Us | Leading Digital Multimedia Company in Tanzania</title>
            <meta name="description" content={mwananchiContent ? cleanForSEO(mwananchiContent.description).slice(0, 155) + "..." : "Default description"} />
          </Helmet>

          <HeroSection data={sliderData} />
          
          <main>
            <AboutSection content={mwananchiContent} />
            <VisionMissionSection />
            <ValuesSection values={values} onCardClick={setSelectedValue} />
            <ReachSection subscriptions={subscriptions} />
            <DiscoverCards cards={cards} />
          </main>
          
          <Footer />
        </>
      )}
    </motion.div>
  );
};

export default AboutFTSection;