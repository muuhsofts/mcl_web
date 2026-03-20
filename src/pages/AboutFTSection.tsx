import { lazy, Suspense, useEffect, useState, memo, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useInView, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet";
import CountUp from "react-countup";
import axiosInstance from "../axios";

// Lazy load heavy components
const Footer = lazy(() => import("../components/Footer"));

// Icons
import {
  ArrowRightIcon,
  ChevronDownIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  CalendarIcon,
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  HeartIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UsersIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

// Styles
import "react-toastify/dist/ReactToastify.css";

/* ────────────────────── CONSTANTS ────────────────────── */
const API_BASE_URL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
const SLIDE_INTERVAL = 5000;

/* ────────────────────── TYPES ────────────────────── */
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
}

interface AboutCardData {
  id: number;
  type: "Brand" | "News" | "Events";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
}

interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: number;
  logo_img_file: string;
}

interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
}

/* ────────────────────── UTILITIES ────────────────────── */
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
};

const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

/* ────────────────────── SIMPLE LOADER ────────────────────── */
const SimpleLoader = memo(() => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-[#007aff] via-[#2980b9] to-[#1f618d]">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-white text-base mt-6 font-medium animate-pulse">MWANANCHI COMMUNICATION LIMITED...</p>
    </div>
  </div>
));

SimpleLoader.displayName = 'SimpleLoader';

/* ============================================================
   SECTION 1: HERO -
   ============================================================ */
const HeroSection = memo(({ data, subscriptions }: { data: AboutSliderData[]; subscriptions: SubscriptionData[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (!isAutoPlaying || data.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, data.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  if (!data.length) return null;

  const slide = data[currentSlide];
  const imageUrl = buildImageUrl(slide.home_img);
  const displaySubs = subscriptions.slice(0, 8);

  // Floating particles data
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div 
        className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image with Parallax */}
        <motion.img
          src={imageUrl}
          alt={slide.heading || "Hero image"}
          className="absolute top-0 left-0 w-full h-full object-contain md:object-cover object-top"
          style={{
            scale: 1.05,
            x: useTransform(springX, [-10, 10], [-15, 15]),
            y: useTransform(springY, [-10, 10], [-15, 15]),
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Animated Gradient Overlay */}
        <motion.div
          animate={{
            background: [
              "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)",
              "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
              "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/20 backdrop-blur-sm"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Animated Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[GlobeAltIcon, ChartBarIcon, UsersIcon, TrophyIcon].map((Icon, idx) => (
            <motion.div
              key={idx}
              className="absolute text-white/10"
              style={{
                left: `${20 + idx * 20}%`,
                top: `${30 + (idx % 3) * 20}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 30, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 15 + idx * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 2,
              }}
            >
              <Icon className="w-24 h-24 md:w-32 md:h-32 opacity-20" />
            </motion.div>
          ))}
        </div>

        {/* Animated Light Rays */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -rotate-45" />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              {/* Animated Heading with Typewriter Effect */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight font-sans"
              >
                {slide.heading || "Shaping Tanzania's Media Landscape"}
              </motion.h1>
              
              {/* Animated Description with Stagger Words */}
              {slide.description && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-base md:text-lg text-white/80 mb-8 max-w-xl font-sans"
                >
                  {cleanText(slide.description)}
                </motion.p>
              )}

              {/* Animated CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap items-center gap-5"
              >
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden px-10 py-4 rounded-full font-bold text-white shadow-2xl text-lg font-sans"
                  >
                    <motion.div
                      animate={{
                        background: [
                          "linear-gradient(to right, #FF3520, #FF3520)",
                          "linear-gradient(to right, #FF3520, #007aff)",
                          "linear-gradient(to right, #FF3520, #FF3520)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF3520] to-[#007aff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      Welcome
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                       
                      </motion.span>
                    </span>
                  </motion.button>
                </Link>
                
                {/* Animated Slide Indicators */}
                <div className="flex gap-2">
                  {data.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className="transition-all cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          width: idx === currentSlide ? 40 : 8,
                          backgroundColor: idx === currentSlide ? '#FF3520' : 'rgba(255,255,255,0.4)'
                        }}
                        whileHover={{ scale: 1.2 }}
                        className="h-1.5 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* DIGITAL REACH CARDS - WHITE CARDS WITH ANIMATIONS */}
      {displaySubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative -mt-28 md:-mt-36 z-30 pb-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Single Row - 8 Cards */}
            <div className="overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="flex gap-5 min-w-max lg:grid lg:grid-cols-8 lg:gap-6">
                {displaySubs.map((sub, idx) => (
                  <motion.div
                    key={sub.subscription_id}
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + idx * 0.05, type: "spring", stiffness: 200 }}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className="w-[180px] lg:w-auto flex-shrink-0"
                  >
                    <motion.div 
                      className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100"
                      whileHover={{
                        boxShadow: "0 20px 40px rgba(0,122,255,0.2)",
                      }}
                    >
                      <motion.div 
                        className="w-16 h-16 mx-auto mb-3 p-2 rounded-xl bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10 flex items-center justify-center"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <img
                          src={buildImageUrl(sub.logo_img_file)}
                          alt={sub.category}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </motion.div>
                      
                      <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-1 font-sans">{sub.category}</h3>
                      
                      <motion.div 
                        className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent font-sans"
                        whileHover={{ scale: 1.05 }}
                      >
                        <CountUp end={sub.total_viewers} duration={2.5} separator="," />
                      </motion.div>
                      
                      <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wide font-sans"></p>
                      
                      {/* Animated Progress Bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 1.2 + idx * 0.05 }}
                        
                        style={{ width: "0%" }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-white/50 uppercase tracking-wider font-sans"
          >
            Explore
          </motion.span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ChevronDownIcon className="w-5 h-5 text-white/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

/* ============================================================
   SECTION 2: ABOUT -
   ============================================================ */
const AboutSection = memo(({ content }: { content: MwananchiAboutData | null }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  if (!content) return null;

  const paragraphs = useMemo(() => 
    content.description
      .split(/\n\s*\n/)
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 2)
  , [content.description]);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden bg-gradient-to-br from-[#007aff]/5 via-white to-[#FF3520]/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#007aff]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF3520]/10 rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007aff] shadow-lg"
            >
              <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-white font-sans">About</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-black text-gray-900 leading-tight font-sans"
            >
              {content.category}
            </motion.h2>
            
            <div className="space-y-6 text-gray-700 text-base md:text-lg font-sans">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="leading-relaxed"
                >
                  {p}
                </motion.p>
              ))}
            </div>

           
          </motion.div>

          {content.video_link && (
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 15 }}
              animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video ring-4 ring-[#007aff]/30"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#007aff]/30 to-[#FF3520]/30 z-10 pointer-events-none" />
                <iframe
                  src={`${content.video_link}?autoplay=0&mute=1&controls=1&modestbranding=1`}
                  title={content.category}
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

/* ============================================================
   SECTION 3: VISION & MISSION - ENHANCED WITH GLOW EFFECTS
   ============================================================ */
const VisionMissionSection = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania.",
      gradient: "from-[#007aff] to-[#5dade2]",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich the lives of people and empower them to promote positive change in society through superior Media content.",
      gradient: "from-[#007aff] to-[#5dade2]",
    }
  ];

  return (
    <section ref={ref} className="py-28 relative overflow-hidden bg-gradient-to-br from-[#007aff] via-[#2980b9] to-[#1f618d]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat opacity-30" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-block px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-5"
          >
            <span className="text-sm font-bold text-white tracking-wider font-sans">OUR DIRECTION</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 font-sans"
          >
            Vision & Mission
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "8rem" } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-white to-white/50 mx-auto rounded-full"
          />
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group"
            >
              <motion.div
                whileHover={{ rotateY: 5 }}
                className="relative bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20 h-full"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center mb-8 shadow-xl`}
                >
                  <item.icon className="w-12 h-12 text-white" />
                </motion.div>
                
                <h3 className="text-4xl font-bold text-white mb-5 font-sans">{item.title}</h3>
                <p className="text-white/90 text-lg leading-relaxed font-sans">{item.description}</p>
                
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "3rem" }}
                  className="mt-10 flex items-center gap-3 text-white/70 group-hover:text-white transition-colors"
                >
                  <div className="w-10 h-px bg-white/50" />
                  <span className="text-sm font-medium tracking-wide font-sans"></span>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';

/* ============================================================
   SECTION 4: VALUES -
   ============================================================ */
const ValuesSection = memo(({ values, onCardClick }: { values: ValueData[]; onCardClick: (v: ValueData) => void }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const colorSchemes = [
    { bg: "#007aff", light: "from-[#007aff]/20 to-transparent", text: "#007aff", gradient: "from-[#007aff] to-[#5dade2]" },
    { bg: "#FF3520", light: "from-[#FF3520]/20 to-transparent", text: "#FF3520", gradient: "from-[#FF3520] to-[#ff6b4a]" },
    { bg: "#10B981", light: "from-[#10B981]/20 to-transparent", text: "#10B981", gradient: "from-[#10B981] to-[#34d399]" },
    { bg: "#8B5CF6", light: "from-[#8B5CF6]/20 to-transparent", text: "#8B5CF6", gradient: "from-[#8B5CF6] to-[#a78bfa]" },
    { bg: "#F59E0B", light: "from-[#F59E0B]/20 to-transparent", text: "#F59E0B", gradient: "from-[#F59E0B] to-[#fbbf24]" },
    { bg: "#EC4899", light: "from-[#EC4899]/20 to-transparent", text: "#EC4899", gradient: "from-[#EC4899] to-[#f472b6]" },
  ];
  
  const displayValues = values.slice(0, 6);
  const leftColumnValues = displayValues.filter((_, i) => i % 2 === 0);
  const rightColumnValues = displayValues.filter((_, i) => i % 2 === 1);

  if (!displayValues.length) return null;

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-gradient-to-br from-[#007aff]/5 via-[#FF3520]/5 to-[#10B981]/5">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#007aff]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF3520]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#10B981]/10 to-[#8B5CF6]/10 rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
      
           <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-black text-gray-900 mb-5 font-sans tracking-tight"
          >
            Our Values<span className="bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent"></span>
          </motion.h2>
        </motion.div>
        
       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="space-y-10">
            {leftColumnValues.map((value, idx) => {
              const scheme = colorSchemes[(idx * 2) % colorSchemes.length];
              const isActive = activeIndex === value.value_id;
              
              return (
                <motion.div
                  key={value.value_id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ x: 15 }}
                  onMouseEnter={() => setActiveIndex(value.value_id)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="group cursor-pointer"
                  onClick={() => onCardClick(value)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${scheme.light} rounded-2xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`} />
                  <div className="relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border-l-4" style={{ borderLeftColor: scheme.bg }}>
                    <div className="flex items-start gap-6">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-md"
                        style={{ background: `linear-gradient(135deg, ${scheme.bg}20, ${scheme.bg}05)` }}
                      >
                        <img 
                          src={buildImageUrl(value.img_file)} 
                          alt={value.category} 
                          className="w-10 h-10 object-contain" 
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 font-sans" style={{ color: scheme.bg }}>{value.category}</h3>
                        <p className="text-gray-600 leading-relaxed font-sans">
                          {value.description}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                          className="mt-4"
                        >
                          <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: scheme.bg }}>
                            Learn more about this value
                            <ArrowRightIcon className="w-3 h-3" />
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="space-y-10 mt-8 lg:mt-16">
            {rightColumnValues.map((value, idx) => {
              const scheme = colorSchemes[(idx * 2 + 1) % colorSchemes.length];
              const isActive = activeIndex === value.value_id;
              
              return (
                <motion.div
                  key={value.value_id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ x: -15 }}
                  onMouseEnter={() => setActiveIndex(value.value_id)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="group cursor-pointer"
                  onClick={() => onCardClick(value)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-l ${scheme.light} rounded-2xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`} />
                  <div className="relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border-r-4" style={{ borderRightColor: scheme.bg }}>
                    <div className="flex items-start gap-6 flex-row-reverse text-right">
                      <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-bl flex items-center justify-center overflow-hidden shadow-md"
                        style={{ background: `linear-gradient(225deg, ${scheme.bg}20, ${scheme.bg}05)` }}
                      >
                        <img 
                          src={buildImageUrl(value.img_file)} 
                          alt={value.category} 
                          className="w-10 h-10 object-contain" 
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 font-sans" style={{ color: scheme.bg }}>{value.category}</h3>
                        <p className="text-gray-600 leading-relaxed font-sans">
                          {value.description}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 }}
                          className="mt-4 flex justify-end"
                        >
                          <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: scheme.bg }}>
                            Learn more about this value
                            <ArrowRightIcon className="w-3 h-3" />
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="relative mt-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full"
        />
      </div>
    </section>
  );
});

ValuesSection.displayName = 'ValuesSection';

/* ============================================================
   SECTION 5: DISCOVER STORIES - WHITE CARDS ON DARK BACKGROUND
   ============================================================ */
const DiscoverCards = memo(({ cards }: { cards: AboutCardData[] }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const displayCards = cards.slice(0, 6);

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-[#007aff] to-[#5dade2]",
      "from-[#FF3520] to-[#ff6b4a]",
      "from-[#10B981] to-[#34d399]",
      "from-[#8B5CF6] to-[#a78bfa]",
      "from-[#F59E0B] to-[#fbbf24]",
      "from-[#EC4899] to-[#f472b6]",
    ];
    return gradients[index % gradients.length];
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return BuildingOfficeIcon;
    }
  };

  if (!displayCards.length) return null;

  return (
    <section ref={ref} className="py-28 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              y: [null, -100, 100],
              x: [null, 50, -50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-[#007aff]/30 rounded-full"
          />
        ))}
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat opacity-30" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] mb-5 shadow-lg"
          >
            <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm font-bold uppercase text-white tracking-wider font-sans">Featured Stories</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 font-sans"
          >
            Discover <span className="bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent">Stories</span>
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-[#007aff] to-[#FF3520] mx-auto rounded-full"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-gray-300 mt-6 max-w-2xl mx-auto font-sans"
          >
            Explore our latest news, events, and brand stories that shape the media landscape in Tanzania
          </motion.p>
        </motion.div>
        
        {/* Modern Card Grid Layout - WHITE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Featured Card - White Card */}
          {displayCards[0] && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white"
            >
              <div className="relative h-[500px] overflow-hidden">
                <motion.img
                  src={buildImageUrl(displayCards[0].imageUrl)}
                  alt={displayCards[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white text-sm font-bold shadow-lg"
                    >
                      {displayCards[0].type}
                    </motion.div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <ClockIcon className="w-4 h-4 animate-pulse" />
                      <span>Featured Story</span>
                    </div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-3 font-sans drop-shadow-lg"
                  >
                    {displayCards[0].title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 }}
                    className="text-gray-200 mb-6 line-clamp-2 font-sans drop-shadow"
                  >
                    {displayCards[0].description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7 }}
                  >
                    <Link to={displayCards[0].linkUrl}>
                      <motion.button
                        whileHover={{ x: 10 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold hover:bg-white/30 transition-all font-sans border border-white/30"
                      >
                        Read Full Story
                        <ArrowRightIcon className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Right side cards - White Cards */}
          <div className="space-y-8">
            {displayCards.slice(1, 3).map((card, idx) => {
              const Icon = getIcon(card.type);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group relative overflow-hidden rounded-2xl shadow-xl bg-white border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden bg-gray-100">
                      <motion.img
                        src={buildImageUrl(card.imageUrl)}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:bg-gradient-to-r" />
                    </div>
                    
                    <div className="flex-1 p-6">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 mb-3"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-r from-[#007aff]/10 to-[#FF3520]/10">
                          <Icon className="w-4 h-4 text-[#007aff]" />
                        </div>
                        <span className="text-sm font-semibold text-[#007aff] font-sans">{card.type}</span>
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 font-sans">{card.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">{card.description}</p>
                      
                      <Link to={card.linkUrl}>
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="inline-flex items-center gap-2 text-[#007aff] text-sm font-semibold hover:text-[#FF3520] transition-colors font-sans"
                        >
                          Explore Story
                          <ArrowRightIcon className="w-3 h-3" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom Row Cards - White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCards.slice(3, 6).map((card, idx) => {
            const Icon = getIcon(card.type);
            const gradient = getCardGradient(idx);
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <motion.div
                  whileHover={{ rotateY: 2 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <motion.img
                      src={buildImageUrl(card.imageUrl)}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      onClick={() => setSelectedImage({ url: buildImageUrl(card.imageUrl), title: card.title })}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <motion.div
                      initial={{ x: 100 }}
                      whileHover={{ x: 0 }}
                      className="absolute top-4 right-4"
                    >
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-bold shadow-lg`}>
                        {card.type}
                      </div>
                    </motion.div>
                    
                    <button
                      onClick={() => setSelectedImage({ url: buildImageUrl(card.imageUrl), title: card.title })}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                      >
                        <PlayIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="w-4 h-4 text-[#007aff]" />
                      </div>
                      <span className="text-xs text-gray-500 font-sans uppercase tracking-wider">{card.type}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 font-sans">{card.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">{card.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Link to={card.linkUrl}>
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="inline-flex items-center gap-2 text-[#007aff] font-semibold text-sm group-hover:text-[#FF3520] transition-colors font-sans"
                        >
                          Discover More
                          <ArrowRightIcon className="w-3 h-3" />
                        </motion.button>
                      </Link>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1 text-gray-400 text-xs"
                      >
                        <HeartIcon className="w-3 h-3" />
                        <span>Trending</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* View All Button */}
        {cards.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link to="/discover-more">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden px-10 py-4 rounded-full font-bold text-white text-lg shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#007aff] to-[#FF3520]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF3520] to-[#007aff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2 font-sans">
                  View All Stories
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
      
      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative max-w-6xl w-full"
            >
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="w-full h-auto rounded-2xl shadow-2xl" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                <h3 className="text-white text-xl font-bold font-sans">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

DiscoverCards.displayName = 'DiscoverCards';

/* ────────────────────── VALUE MODAL ────────────────────── */
const ValueModal = memo(({ value, onClose }: { value: ValueData; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full p-10 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center p-4 bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10"
          >
            <img 
              src={buildImageUrl(value.img_file)} 
              alt={value.category} 
              className="w-full h-full object-contain" 
            />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent font-sans">
            {value.category}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-sans">{value.description}</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white font-semibold hover:shadow-xl transition-shadow font-sans"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

ValueModal.displayName = 'ValueModal';

/* ────────────────────── MAIN PAGE ────────────────────── */
const AboutFTSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [aboutContent, setAboutContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const [hero, subs, about, vals, brand, news, event] = await Promise.all([
          axiosInstance.get("/api/slider-imgs", { signal: controller.signal }),
          axiosInstance.get("/api/allsubscriptions", { signal: controller.signal }),
          axiosInstance.get("/api/about-mwananchi/all", { signal: controller.signal }),
          axiosInstance.get("/api/values/all", { signal: controller.signal }),
          axiosInstance.get("/api/latestbrand", { signal: controller.signal }),
          axiosInstance.get("/api/latestnew", { signal: controller.signal }),
          axiosInstance.get("/api/latestEvent", { signal: controller.signal }),
        ]);

        if (!mounted) return;

        setSliderData(hero.data || []);
        setSubscriptions(subs.data?.data || []);
        setAboutContent(about.data?.records?.[0] || null);
        setValues(vals.data?.values || []);

        const cardItems: AboutCardData[] = [];
        
        if (brand.data?.brand_id) {
          cardItems.push({
            id: brand.data.brand_id,
            type: "Brand",
            title: brand.data.category || "Brand",
            description: cleanText(brand.data.description || ""),
            imageUrl: brand.data.brand_img || null,
            linkUrl: "/our-brands",
          });
        }

        if (news.data?.news?.news_id) {
          cardItems.push({
            id: news.data.news.news_id,
            type: "News",
            title: news.data.news.category || "News",
            description: stripHtml(news.data.news.description || ""),
            imageUrl: news.data.news.news_img || null,
            linkUrl: "/company/news",
          });
        }

        if (event.data?.event?.event_id) {
          cardItems.push({
            id: event.data.event.event_id,
            type: "Events",
            title: event.data.event.event_category || "Event",
            description: cleanText(event.data.event.description || ""),
            imageUrl: event.data.event.img_file || null,
            linkUrl: "/all-events",
          });
        }

        setCards(cardItems);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_CANCELED') {
          return;
        }
        console.error("Error loading data:", err);
        setError("Unable to load content. Please check your connection.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleValueClick = useCallback((value: ValueData) => {
    setSelectedValue(value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedValue(null);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <XMarkIcon className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-white text-lg mb-6 font-sans">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-white rounded-full text-base font-semibold bg-gradient-to-r from-[#007aff] to-[#FF3520] hover:shadow-xl transition-all font-sans"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
      
      <AnimatePresence mode="wait">
        {isLoading && <SimpleLoader />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedValue && (
          <ValueModal value={selectedValue} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {!isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Helmet>
            <title>About Us | Mwananchi Communications - Leading Media Company in Tanzania</title>
            <meta 
              name="description" 
              content={aboutContent ? cleanText(aboutContent.description).slice(0, 155) : "Leading digital multimedia company in Tanzania, shaping the future of media with innovation and integrity."} 
            />
            <meta name="keywords" content="media, tanzania, digital, multimedia, news, brands, mwananchi, communication" />
            <meta property="og:title" content="About Us | Mwananchi Communications" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={window.location.href} />
          </Helmet>

          <HeroSection data={sliderData} subscriptions={subscriptions} />
          
          <main>
            <AboutSection content={aboutContent} />
            <VisionMissionSection />
            <ValuesSection values={values} onCardClick={handleValueClick} />
            <DiscoverCards cards={cards} />
          </main>
          
          <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse" />}>
            <Footer />
          </Suspense>
        </motion.div>
      ) : (
        <div className="min-h-screen bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default memo(AboutFTSection);