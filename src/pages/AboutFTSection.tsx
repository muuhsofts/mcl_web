import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  CalendarIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import { useEffect, useState, memo, useCallback, useMemo } from "react"; // Removed useRef
import { Helmet } from "react-helmet";

/* ────────────────────── COMPANY COLORS ────────────────────── */
const COLORS = {
  primary: {
    base: "#0069B4",
    dark1: "#005A9B",
    dark2: "#004C82",
    dark3: "#003E69",
    light1: "#3388C3",
    light2: "#66A6D2",
    light3: "#99C4E1",
    light4: "#CCE1F0",
  },
  accent: {
    base: "#FF3520",
    dark1: "#E62F1C",
    dark2: "#CC2A19",
    dark3: "#B32416",
    light1: "#FF5D4D",
    light2: "#FF8679",
    light3: "#FFAEA6",
    light4: "#FFD7D2",
  },
  white: {
    base: "#FFFFFF",
    light1: "#F9F9F9",
    light2: "#F2F2F2",
    light3: "#E6E6E6",
    light4: "#CCCCCC",
  },
  // New color for Vision, Values, Reach sections
  lightGray: "#f5f0f0",
};

const API_BASE_URL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
const LOADING_DELAY = 300;
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

const cleanForSEO = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

const buildImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/* ────────────────────── ANIMATION VARIANTS ────────────────────── */
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 } 
  }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 } 
  }
};

const slideInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 } 
  }
};

const slideInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 } 
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 200, damping: 25, duration: 0.4 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// Removed unused cardHover and floatAnimation

/* ────────────────────── SECTION COLOR CONFIG ────────────────────── */
const sectionColors = {
  hero: {
    primary: COLORS.primary.base,
    secondary: COLORS.accent.base,
    gradient: `linear-gradient(135deg, ${COLORS.primary.base} 0%, ${COLORS.accent.base} 100%)`,
    light: COLORS.primary.light4,
    overlay: 'rgba(0,0,0,0.2)',
  },
  about: {
    primary: COLORS.primary.base,
    secondary: COLORS.accent.light1,
    gradient: `linear-gradient(135deg, ${COLORS.primary.light2} 0%, ${COLORS.accent.light2} 100%)`,
    light: COLORS.primary.light4,
    background: COLORS.white.light2,
  },
  vision: {
    primary: COLORS.primary.base, // Changed to blue
    secondary: COLORS.accent.base,
    gradient: `linear-gradient(135deg, ${COLORS.primary.base} 0%, ${COLORS.accent.base} 100%)`,
    light: COLORS.primary.light4,
    background: COLORS.lightGray, // #f5f0f0
  },
  values: {
    primary: COLORS.primary.base, // Changed to blue
    secondary: COLORS.accent.base,
    gradient: `linear-gradient(135deg, ${COLORS.primary.base} 0%, ${COLORS.accent.base} 100%)`,
    light: COLORS.primary.light4,
    background: COLORS.lightGray, // #f5f0f0
  },
  reach: {
    primary: COLORS.primary.base, // Changed to blue
    secondary: COLORS.accent.base,
    gradient: `linear-gradient(135deg, ${COLORS.primary.base} 0%, ${COLORS.accent.base} 100%)`,
    light: COLORS.primary.light4,
    background: COLORS.lightGray, // #f5f0f0
  },
  discover: {
    primary: COLORS.primary.base,
    secondary: COLORS.accent.base,
    gradient: `linear-gradient(135deg, ${COLORS.primary.base} 0%, ${COLORS.accent.base} 100%)`,
    light: COLORS.primary.light4,
    background: COLORS.white.light3,
  },
};

/* ────────────────────── OPTIMIZED BACKGROUND GRID ────────────────────── */
const ModernBackgroundGrid = memo(({ color = COLORS.primary.base, variant = 'default' }: { color?: string; variant?: string }) => {
  const getOpacity = () => {
    switch(variant) {
      case 'light': return '08';
      case 'medium': return '12';
      default: return '05';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform">
      {/* Base gradient with section-specific color */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `radial-gradient(circle at 20% 50%, ${color}${getOpacity()} 0%, transparent 70%)` 
        }}
      />
      
      {/* Grid pattern with section color */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color}15 1px, transparent 1px),
            linear-gradient(to bottom, ${color}15 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Floating orb with section color */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-96 h-96 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
});

ModernBackgroundGrid.displayName = 'ModernBackgroundGrid';

/* ────────────────────── LOADER ────────────────────── */
const LandingLoader = memo(() => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backgroundColor: COLORS.primary.base }} // Changed to #0069B4
  >
    <div className="relative z-10 text-center">
      <div 
        className="w-12 h-12 border-3 rounded-full mx-auto animate-spin"
        style={{ 
          borderColor: `${COLORS.white.base}30`,
          borderTopColor: COLORS.white.base 
        }} 
      />
      <p className="text-sm font-medium text-white mt-3 animate-pulse">
        Loading...
      </p>
    </div>
  </motion.div>
));

LandingLoader.displayName = 'LandingLoader';

/* ────────────────────── HERO SECTION ────────────────────── */
const HeroSection = memo(({ data }: { data: AboutSliderData[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const colors = sectionColors.hero;

  useEffect(() => {
    if (!isAutoPlaying || data.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, SLIDE_INTERVAL);
    
    return () => clearInterval(timer);
  }, [data.length, isAutoPlaying]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, []);

  if (!data.length) return null;

  const slide = data[currentSlide];
  const imageUrl = buildImageUrl(slide.home_img) || "";

  return (
    <section className="relative h-[60vh] min-h-[450px] w-full overflow-hidden">
      <ModernBackgroundGrid color={colors.primary} variant="default" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={imageUrl} 
            alt={slide.heading || "Hero image"} 
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Minimal overlay to show logo/image clearly */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: colors.overlay
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div 
              variants={slideInDown}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-4"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white/90">Welcome</span>
            </motion.div>

            <motion.h1 
              variants={slideInLeft}
              className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg"
            >
              {slide.heading || "Shaping Tanzania's Media Landscape"}
            </motion.h1>
            
            {slide.description && (
              <motion.p 
                variants={slideInRight}
                className="text-base text-white/90 mb-6 max-w-lg line-clamp-2 drop-shadow"
              >
                {cleanForSEO(slide.description)}
              </motion.p>
            )}

            <motion.div 
              variants={slideInUp}
              className="flex items-center gap-3"
            >
              <Link to="/about/journey">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 text-white rounded-full font-medium text-sm hover:shadow-lg transition-all"
                  style={{ backgroundColor: colors.secondary }}
                >
                  Discover Our Journey
                </motion.button>
              </Link>
              
              <div className="flex gap-2">
                {data.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlideChange(idx)}
                    className="h-1.5 rounded-full transition-all cursor-pointer"
                    style={{ 
                      width: idx === currentSlide ? 28 : 8,
                      backgroundColor: idx === currentSlide ? colors.secondary : 'rgba(255,255,255,0.5)'
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2"
      >
        <ChevronDownIcon className="w-4 h-4 text-white/80" />
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

/* ────────────────────── ABOUT SECTION ────────────────────── */
const AboutSection = memo(({ content }: { content: MwananchiAboutData | null }) => {
  const colors = sectionColors.about;

  if (!content) return null;

  const paragraphs = useMemo(() => 
    content.description
      .split(/\n\s*\n/)
      .map(cleanForSEO)
      .filter(Boolean)
      .slice(0, 2)
  , [content.description]);

  return (
    <section className="relative overflow-hidden py-16" style={{ backgroundColor: colors.background }}>
      <ModernBackgroundGrid color={colors.primary} variant="light" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-px" style={{ backgroundColor: colors.primary }} />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: colors.primary }}>
                Who We Are
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.primary }}>
              {content.category}
            </h2>
            
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-base">{p}</p>
              ))}
            </div>
          </motion.div>

          {content.video_link && (
            <motion.div
              variants={slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="relative"
            >
              <div 
                className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video"
                style={{ boxShadow: `0 20px 25px -5px ${colors.primary}40` }}
              >
                <iframe
                  src={`${content.video_link}?autoplay=0&mute=1&controls=1`}
                  title={content.category}
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

/* ────────────────────── VISION MISSION ────────────────────── */
const VisionMissionSection = memo(() => {
  const colors = sectionColors.vision;

  const items = useMemo(() => [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania.",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich lives and empower positive change through superior media.",
    }
  ], []);

  return (
    <section className="relative overflow-hidden py-16" style={{ backgroundColor: colors.background }}>
      <ModernBackgroundGrid color={colors.primary} variant="light" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.primary }}>
            Vision & Mission
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              variants={index === 0 ? slideInLeft : slideInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg"
              style={{ borderLeft: `4px solid ${colors.primary}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: colors.gradient }}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';

/* ────────────────────── VALUES SECTION ────────────────────── */
const ValuesSection = memo(({ values, onCardClick }: { values: ValueData[]; onCardClick: (v: ValueData) => void }) => {
  const colors = sectionColors.values;
  const icons = useMemo(() => [ShieldCheckIcon, HeartIcon, LightBulbIcon, UsersIcon], []);
  const displayValues = values.slice(0, 4);

  if (!displayValues.length) return null;

  return (
    <section className="relative overflow-hidden py-16" style={{ backgroundColor: colors.background }}>
      <ModernBackgroundGrid color={colors.primary} variant="light" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.primary }}>
            Our Values
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayValues.map((value, idx) => {
            const Icon = icons[idx % icons.length];
            
            return (
              <motion.button
                key={value.value_id}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                onClick={() => onCardClick(value)}
                className="text-left group"
              >
                <div 
                  className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border shadow-md hover:shadow-lg transition-all"
                  style={{ 
                    borderColor: `${colors.primary}20`,
                    borderTop: `3px solid ${colors.primary}`
                  }}
                >
                  <div 
                    className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center"
                    style={{ background: `${colors.primary}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{value.category}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {truncateText(value.description || "", 50)}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ValuesSection.displayName = 'ValuesSection';

/* ────────────────────── REACH SECTION ────────────────────── */
const ReachSection = memo(({ subscriptions }: { subscriptions: SubscriptionData[] }) => {
  const colors = sectionColors.reach;
  const displaySubs = subscriptions.slice(0, 5);

  if (!displaySubs.length) return null;

  return (
    <section className="relative overflow-hidden py-16" style={{ backgroundColor: colors.background }}>
      <ModernBackgroundGrid color={colors.primary} variant="light" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.primary }}>
            Our Reach
          </h2>
          <p className="text-gray-600 mt-2">Connecting millions across Tanzania</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displaySubs.map((sub, index) => (
            <motion.div
              key={sub.subscription_id}
              variants={index % 2 === 0 ? slideInUp : slideInDown}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white/90 backdrop-blur-sm p-4 rounded-lg text-center shadow-md"
              style={{ borderBottom: `3px solid ${colors.primary}` }}
            >
              <div className="w-14 h-14 mx-auto mb-2">
                <img
                  src={buildImageUrl(sub.logo_img_file) || ""}
                  alt={sub.category}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">{sub.category}</h3>
              <div className="text-xl font-bold" style={{ color: colors.primary }}>
                <CountUp end={sub.total_viewers} duration={2} separator="," />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

ReachSection.displayName = 'ReachSection';

/* ────────────────────── IMAGE MODAL ────────────────────── */
const ImageModal = memo(({ imageUrl, title, onClose }: { imageUrl: string; title: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative max-w-5xl w-full z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-contain max-h-[80vh] rounded-lg"
        />
      </motion.div>
    </motion.div>
  );
});

ImageModal.displayName = 'ImageModal';

/* ────────────────────── DISCOVER CARDS ────────────────────── */
const DiscoverCards = memo(({ cards }: { cards: AboutCardData[] }) => {
  const colors = sectionColors.discover;
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  
  const getIcon = useCallback((type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return BuildingOfficeIcon;
    }
  }, []);

  const displayCards = cards.slice(0, 3);

  if (!displayCards.length) return null;

  return (
    <section className="relative overflow-hidden py-16" style={{ backgroundColor: colors.background }}>
      <ModernBackgroundGrid color={colors.primary} variant="light" />
      
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colors.primary }}>
            Discover More
          </h2>
          <p className="text-gray-600 mt-2">Explore our latest stories and updates</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {displayCards.map((card, index) => {
            const Icon = getIcon(card.type);
            const imageUrl = buildImageUrl(card.imageUrl) || "";
            
            return (
              <motion.div
                key={`${card.type}-${card.id}`}
                variants={index === 0 ? slideInLeft : index === 1 ? slideInUp : slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg"
                style={{ borderRight: `3px solid ${colors.primary}` }}
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
                    onClick={() => setSelectedImage({ url: imageUrl, title: card.title })}
                    loading="lazy"
                  />
                  
                  <div className="absolute bottom-2 left-2">
                    <div 
                      className="px-2 py-1 backdrop-blur-sm rounded text-xs font-semibold flex items-center gap-1"
                      style={{ backgroundColor: `${colors.primary}E6`, color: 'white' }}
                    >
                      <Icon className="w-3 h-3 text-white" />
                      <span>{card.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
                  <Link 
                    to={card.linkUrl} 
                    className="inline-flex items-center gap-1 text-sm font-semibold group"
                    style={{ color: colors.primary }}
                  >
                    Learn More 
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {cards.length > 3 && (
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link 
              to="/discover-more" 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm border-2 transition-all hover:shadow-md hover:scale-105"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              View All Stories
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
});

DiscoverCards.displayName = 'DiscoverCards';

/* ────────────────────── VALUE MODAL ────────────────────── */
const ValueModal = memo(({ value, onClose }: { value: ValueData; onClose: () => void }) => {
  const colors = sectionColors.values;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -10 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl max-w-md w-full p-6 shadow-xl relative z-20"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 25px 50px -12px ${colors.primary}60` }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center p-3"
            style={{ background: `${colors.primary}15` }}
          >
            <img
              src={buildImageUrl(value.img_file) || ""}
              alt={value.category}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
            {value.category}
          </h3>
          <p className="text-sm text-gray-600">{value.description}</p>
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
        const [hero, subs, about, vals, brand, news, event] = await Promise.allSettled([
          axiosInstance.get("/api/slider-imgs", { signal: controller.signal }),
          axiosInstance.get("/api/allsubscriptions", { signal: controller.signal }),
          axiosInstance.get("/api/about-mwananchi/all", { signal: controller.signal }),
          axiosInstance.get("/api/values/all", { signal: controller.signal }),
          axiosInstance.get("/api/latestbrand", { signal: controller.signal }),
          axiosInstance.get("/api/latestnew", { signal: controller.signal }),
          axiosInstance.get("/api/latestEvent", { signal: controller.signal }),
        ]);

        if (!mounted) return;

        if (hero.status === "fulfilled" && hero.value.data) {
          setSliderData(hero.value.data || []);
        }

        if (subs.status === "fulfilled" && subs.value.data?.data) {
          setSubscriptions(subs.value.data.data || []);
        }

        if (about.status === "fulfilled" && about.value.data?.records?.[0]) {
          setAboutContent(about.value.data.records[0]);
        }

        if (vals.status === "fulfilled" && vals.value.data?.values) {
          setValues(vals.value.data.values || []);
        }

        const cardItems: AboutCardData[] = [];
        
        if (brand.status === "fulfilled" && brand.value.data?.brand_id) {
          cardItems.push({
            id: brand.value.data.brand_id,
            type: "Brand",
            title: brand.value.data.category || "Brand",
            description: cleanForSEO(brand.value.data.description || ""),
            imageUrl: brand.value.data.brand_img || null,
            linkUrl: "/our-brands",
          });
        }

        if (news.status === "fulfilled" && news.value.data?.news?.news_id) {
          cardItems.push({
            id: news.value.data.news.news_id,
            type: "News",
            title: news.value.data.news.category || "News",
            description: stripHtml(news.value.data.news.description || ""),
            imageUrl: news.value.data.news.news_img || null,
            linkUrl: "/company/news",
          });
        }

        if (event.status === "fulfilled" && event.value.data?.event?.event_id) {
          cardItems.push({
            id: event.value.data.event.event_id,
            type: "Events",
            title: event.value.data.event.event_category || "Event",
            description: cleanForSEO(event.value.data.event.description || ""),
            imageUrl: event.value.data.event.img_file || null,
            linkUrl: "/all-events",
          });
        }

        setCards(cardItems);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof Error && err.name !== 'CanceledError') {
          console.error("Error loading data:", err);
          setError("Failed to load content. Please refresh the page.");
        }
      } finally {
        if (mounted) {
          setTimeout(() => setIsLoading(false), LOADING_DELAY);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: COLORS.primary.base }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white relative"
    >
      <ToastContainer 
        position="top-right" 
        theme="colored" 
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
      />
      
      <AnimatePresence mode="wait">
        {isLoading && <LandingLoader />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedValue && (
          <ValueModal value={selectedValue} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="relative z-20">
          <Helmet>
            <title>About Us | Leading Media Company in Tanzania</title>
            <meta 
              name="description" 
              content={aboutContent ? cleanForSEO(aboutContent.description).slice(0, 155) : "Leading digital multimedia company in Tanzania"} 
            />
            <meta name="keywords" content="media, tanzania, digital, multimedia, news, brands" />
            <meta property="og:title" content="About Us | Leading Media Company in Tanzania" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={window.location.href} />
          </Helmet>

          <HeroSection data={sliderData} />
          
          <main>
            <AboutSection content={aboutContent} />
            <VisionMissionSection />
            <ValuesSection values={values} onCardClick={handleValueClick} />
            <ReachSection subscriptions={subscriptions} />
            <DiscoverCards cards={cards} />
          </main>
          
          <Footer />
        </div>
      )}
    </motion.div>
  );
};

export default memo(AboutFTSection);