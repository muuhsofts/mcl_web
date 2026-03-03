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
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import { useEffect, useState, ElementType, ComponentType, JSX, useRef } from "react";
import { Helmet } from "react-helmet";

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

/* ────────────────────── UNIFIED BACKGROUND MOTION SYSTEM WITH #0069B4 ────────────────────── */
// Global page transition variants
const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.4 } }
};

// Master background animation with #0069B4 color
const backgroundFlow: Variants = {
  initial: { 
    backgroundPosition: "0% 0%",
    opacity: 0.4
  },
  animate: { 
    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
    opacity: [0.4, 0.6, 0.4],
    transition: { 
      duration: 30,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop"
    }
  }
};

// Secondary ambient animation with #0069B4
const ambientPulse: Variants = {
  initial: { scale: 1, opacity: 0.2 },
  animate: { 
    scale: [1, 1.05, 1],
    opacity: [0.2, 0.3, 0.2],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Original animation variants for content
const lineVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const bounceVariants: Variants = {
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

const staggerScale: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

/* ────────────────────── REUSABLE COMPONENTS ────────────────────── */
const AnimatedText: React.FC<{
  text: string;
  className?: string;
  variants?: Variants;
  perWord?: boolean;
  as?: ElementType;
}> = ({ text, className, variants, perWord = true, as: Component = "div" }) => {
  const Motion = motion(Component as ComponentType<any> | keyof JSX.IntrinsicElements);
  if (!perWord) {
    return (
      <Motion
        variants={variants || containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={className}
      >
        {text}
      </Motion>
    );
  }
  const words = text.split(/\s+/).filter((w) => w);
  return (
    <Motion
      variants={variants || containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`flex flex-wrap ${className}`}
    >
      {words.map((w, i) => (
        <motion.span
          key={`w-${i}`}
          variants={wordVariants}
          className="inline-block mr-2 whitespace-nowrap"
        >
          {w}
        </motion.span>
      ))}
    </Motion>
  );
};

const SectionBadge: React.FC<{ text: string; icon?: React.ReactNode }> = ({ text, icon }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ scale: 1.05 }}
    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0069B4]/10 to-[#ed1c24]/10 rounded-full mb-4 border border-[#0069B4]/20"
  >
    {icon || <SparklesIcon className="w-4 h-4 text-[#0069B4] mr-2" />}
    <span className="text-sm font-semibold text-[#0069B4] tracking-wide">{text}</span>
  </motion.div>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <motion.div 
    variants={fadeInUp} 
    className="text-center mb-12"
    whileInView="visible"
    initial="hidden"
    viewport={{ once: true, amount: 0.3 }}
  >
    <motion.h2 
      className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 relative inline-block"
      whileHover={{ scale: 1.02 }}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        className="text-lg text-gray-600 max-w-2xl mx-auto"
        variants={fadeInUp}
      >
        {subtitle}
      </motion.p>
    )}
    <motion.div
      className="mt-4 h-1 w-20 bg-gradient-to-r from-[#0069B4] to-[#ed1c24] rounded-full mx-auto"
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: 80, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    />
  </motion.div>
);

/* ────────────────────── BACKGROUND WRAPPER WITH #0069B4 ────────────────────── */
const AnimatedBackground: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    {/* Base gradient layer with #0069B4 */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-[#0069B4]/5 via-white to-red-50"
      variants={backgroundFlow}
      initial="initial"
      animate="animate"
      style={{ 
        backgroundSize: "200% 200%",
      }}
    />
    
    {/* Ambient pulse layer with #0069B4 */}
    <motion.div
      className="absolute inset-0"
      variants={ambientPulse}
      initial="initial"
      animate="animate"
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(0,105,180,0.03) 0%, transparent 50%)",
      }}
    />
    
    {/* Dynamic grid overlay with #0069B4 */}
    <motion.div
      className="absolute inset-0 opacity-5"
      animate={{ 
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage: "linear-gradient(to right, #0069B4 1px, transparent 1px), linear-gradient(to bottom, #ed1c24 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }}
    />
    
    {/* Floating particles with #0069B4 */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-[#0069B4]/10 to-[#ed1c24]/10"
        style={{
          width: Math.random() * 300 + 100,
          height: Math.random() * 300 + 100,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
        }}
        transition={{
          duration: 20 + i * 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
    
    {/* Content */}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

/* ────────────────────── ORIGINAL LOADER ────────────────────── */
const LandingLoader: React.FC = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0069B4] to-[#0069B4]/80 z-50"
  >
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
      whileHover={{ scale: 1.1, rotate: 180 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    </motion.div>
    <AnimatedText text="Loading Our Story..." className="text-2xl font-bold text-white tracking-wide font-inter" />
  </motion.div>
);

/* ────────────────────── REFINED HERO SECTION WITH MINIMIZED HEIGHT ────────────────────── */
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
        variants={backgroundFlow}
        initial="initial"
        animate="animate"
        style={{
          background: "linear-gradient(45deg, rgba(237,28,36,0.1) 0%, rgba(0,105,180,0.15) 50%, rgba(237,28,36,0.1) 100%)",
          backgroundSize: "200% 200%",
          mixBlendMode: "overlay",
        }}
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
              variants={bounceVariants}
              initial="hidden"
              animate="visible"
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
                className="group relative px-6 py-3 bg-[#ed1c24] text-white rounded-full overflow-hidden text-sm font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Discover Our Story</span>
                <motion.div
                  className="absolute inset-0 bg-[#0069B4]"
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
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? "w-8 bg-[#ed1c24]" : "w-3 bg-white/30 hover:bg-white/50"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
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
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-white/60 text-xs font-medium">Scroll</span>
          <ChevronDownIcon className="w-4 h-4 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ────────────────────── ENHANCED ABOUT SECTION WITH TALLER VIDEO ────────────────────── */
const AboutSection: React.FC<{ content: MwananchiAboutData | null }> = ({ content }) => {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!content) return null;

  const paragraphs = content.description
    .split(/\n\s*\n/)
    .map(cleanForSEO)
    .filter(p => p.trim());

  const togglePlay = () => {
    if (iframeRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-20 relative"
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
            <motion.div variants={fadeInLeft} className="space-y-6">
              <SectionBadge text="Who We Are" icon={<PlayCircleIcon className="w-4 h-4 text-[#0069B4] mr-2" />} />
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {content.category}
              </motion.h2>
              
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    variants={fadeInUp}
                    className="text-base text-gray-600 leading-relaxed"
                    whileHover={{ x: 5, color: "#0069B4" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {p}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {content.video_link && (
              <motion.div 
                variants={fadeInRight} 
                className="relative h-full flex items-start"
                onHoverStart={() => setIsVideoHovered(true)}
                onHoverEnd={() => setIsVideoHovered(false)}
              >
                <div className="relative group w-full">
                  {/* Animated rings with #0069B4 */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-[#0069B4]/20 to-[#ed1c24]/20 rounded-3xl blur-2xl"
                    animate={{ 
                      scale: isVideoHovered ? 1.1 : 1,
                      opacity: isVideoHovered ? 0.6 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div
                    className="absolute -inset-2 border-2 border-dashed border-[#0069B4]/30 rounded-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-[3/4] max-h-[500px] w-full">
                    <iframe
                      ref={iframeRef}
                      src={`${content.video_link}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                      title={content.category}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    
                    {/* Video overlay */}
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
                            transition={{ delay: 0.1 }}
                          >
                            <motion.button
                              onClick={togglePlay}
                              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
                              whileHover={{ scale: 1.1, backgroundColor: "#ed1c24" }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isPlaying ? (
                                <PauseCircleIcon className="w-5 h-5 text-white" />
                              ) : (
                                <PlayCircleIcon className="w-5 h-5 text-white" />
                              )}
                            </motion.button>
                            
                            <motion.span 
                              className="text-white text-xs font-medium"
                              whileHover={{ x: 5 }}
                            >
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
      color: "from-[#0069B4] to-[#0069B4]/80",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich lives and empower positive change through superior media.",
      color: "from-[#ed1c24] to-[#ed1c24]/80",
    }
  ];

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-20 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Our Vision & Mission" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
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
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-[#0069B4]/30 transition-all duration-300 overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
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

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-20 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Our Core Values" subtitle="The principles that guide everything we do" />
          
          <motion.div
            variants={staggerScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-12"
          >
            {values.map((value, idx) => {
              const Icon = getIcon(idx);
              
              return (
                <motion.button
                  key={value.value_id}
                  variants={scaleIn}
                  onClick={() => onCardClick(value)}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative text-left"
                >
                  <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:border-[#0069B4] transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#0069B4] to-[#ed1c24] rounded-full"
                      initial={{ opacity: 0, width: 0 }}
                      whileHover={{ opacity: 1, width: 48 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#0069B4]/5 to-[#ed1c24]/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative z-10">
                      <motion.div 
                        className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[#0069B4]/10 to-[#ed1c24]/10 flex items-center justify-center border border-gray-200"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-6 h-6 text-[#0069B4] group-hover:text-[#ed1c24] transition-colors duration-300" />
                      </motion.div>
                      
                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#0069B4] transition-colors duration-300">
                        {value.category}
                      </h3>
                      
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {value.description ? value.description.substring(0, 60) + "..." : "Click to learn more"}
                      </p>
                    </div>
                    
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#0069B4] to-[#ed1c24] origin-left"
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
      initial={{ scale: 0.9, y: 30, rotateX: -15 }}
      animate={{ scale: 1, y: 0, rotateX: 0 }}
      exit={{ scale: 0.9, y: -30, rotateX: 15 }}
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
          className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#0069B4]/10 to-[#ed1c24]/10 flex items-center justify-center border border-gray-200"
        >
          <img
            src={buildImageUrl(value.img_file) || "https://via.placeholder.com/80x80"}
            alt={value.category}
            className="w-12 h-12 object-contain"
          />
        </motion.div>

        <motion.h3 
          className="text-2xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {value.category}
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {value.description || "No description available."}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4 }}
          className="h-0.5 w-16 bg-gradient-to-r from-[#0069B4] to-[#ed1c24] rounded-full mx-auto mt-6"
        />
      </div>
    </motion.div>
  </motion.div>
);

/* ────────────────────── REACH SECTION ────────────────────── */
const ReachSection: React.FC<{ subscriptions: SubscriptionData[] }> = ({ subscriptions }) => {
  if (!subscriptions.length) return null;

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-20 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Our Reach" subtitle="Making an impact across Tanzania and beyond" />
          
          <motion.div
            variants={staggerScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-12"
          >
            {subscriptions.map((sub, idx) => (
              <motion.div
                key={sub.subscription_id}
                variants={scaleIn}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="relative bg-white/90 backdrop-blur-sm p-5 rounded-xl border border-gray-200 hover:border-[#0069B4] transition-all duration-300 shadow-sm hover:shadow-xl text-center overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#0069B4] to-[#ed1c24] rounded-full"
                    initial={{ opacity: 0, width: 0 }}
                    whileHover={{ opacity: 1, width: 32 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 border border-gray-100"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <img
                      src={buildImageUrl(sub.logo_img_file) || "https://via.placeholder.com/64x48"}
                      alt={sub.category}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#0069B4] transition-colors duration-300">
                    {sub.category}
                  </h3>
                  
                  <motion.div 
                    className="text-lg font-black text-[#0069B4] group-hover:text-[#ed1c24] transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <CountUp
                      end={sub.total_viewers}
                      duration={2}
                      formattingFn={(v) => 
                        new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v)
                      }
                    />
                  </motion.div>
                  <p className="text-xs text-gray-500">monthly reach</p>
                  
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#0069B4] to-[#ed1c24] origin-left"
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

/* ────────────────────── DISCOVER CARDS ────────────────────── */
const DiscoverCards: React.FC<{ cards: AboutCardData[] }> = ({ cards }) => {
  const getIcon = (type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return InformationCircleIcon;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case "Brand": return "text-[#0069B4] bg-[#0069B4]/10 border-[#0069B4]/20";
      case "News": return "text-[#ed1c24] bg-[#ed1c24]/10 border-[#ed1c24]/20";
      case "Events": return "text-purple-600 bg-purple-100 border-purple-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  if (!cards.length) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          </motion.div>
          <p className="text-base text-gray-600">No content available at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <AnimatedBackground>
      <motion.section 
        className="py-20 relative"
        variants={pageTransition}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Discover More" subtitle="Explore our latest updates and offerings" />
          
          <motion.div
            variants={staggerScale}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {cards.map((card, idx) => {
              const Icon = getIcon(card.type);
              const colorClass = getColor(card.type);
              
              return (
                <motion.div
                  key={`${card.type}-${card.id}`}
                  variants={slideUpBounce}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative"
                >
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#0069B4]/30">
                    <motion.div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#0069B4] to-[#ed1c24] rounded-full z-20"
                      initial={{ opacity: 0, width: 0 }}
                      whileHover={{ opacity: 1, width: 48 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative h-52 w-full overflow-hidden">
                      <motion.img
                        src={buildImageUrl(card.imageUrl) || "https://via.placeholder.com/600x400"}
                        alt={card.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6 }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                        initial={{ opacity: 0.6 }}
                        whileHover={{ opacity: 0.8 }}
                      />
                      
                      <motion.div 
                        className="absolute top-3 left-3 z-10"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border backdrop-blur-sm ${colorClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{card.type}</span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="absolute bottom-3 left-3 right-3 z-10"
                        initial={{ y: 0 }}
                        whileHover={{ y: -5 }}
                      >
                        <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
                          {card.title}
                        </h3>
                      </motion.div>
                    </div>
                    
                    <div className="p-5">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {card.description.length > 120 ? `${card.description.slice(0, 120)}...` : card.description}
                      </p>
                      
                      <motion.div
                        whileHover={{ x: 5 }}
                      >
                        <Link
                          to={card.linkUrl}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#0069B4] group-hover:text-[#ed1c24] transition-colors duration-300"
                        >
                          <span>Learn More</span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRightIcon className="w-3 h-3" />
                          </motion.div>
                        </Link>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#0069B4] to-[#ed1c24] origin-left"
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

      await new Promise(r => setTimeout(r, 1200));

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