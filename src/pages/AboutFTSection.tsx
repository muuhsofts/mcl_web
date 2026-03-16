import { lazy, Suspense, useEffect, useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  SparklesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Styles
import "react-toastify/dist/ReactToastify.css";

/* ────────────────────── CONSTANTS ────────────────────── */
const COLORS = {
  primary: "#0069B4",
  primaryDark: "#005A9B",
  accent: "#FF3520",
  success: "#10B981",
  white: "#FFFFFF",
  lightGray: "#f5f0f0",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
  gray900: "#111827",
};

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
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/* ────────────────────── SIMPLE LOADER ────────────────────── */
const SimpleLoader = memo(() => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: COLORS.primary }}>
    <div className="text-center">
      <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
      <p className="text-white text-sm animate-pulse">Loading...</p>
    </div>
  </div>
));

SimpleLoader.displayName = 'SimpleLoader';

/* ────────────────────── SKELETON LOADER ────────────────────── */
const SkeletonLoader = memo(() => (
  <div className="min-h-screen bg-white">
    <div className="w-full h-[60vh] bg-gray-200 animate-pulse" />
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
));

SkeletonLoader.displayName = 'SkeletonLoader';

/* ────────────────────── SECTION HEADER ────────────────────── */
const SectionHeader = memo(({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-8">
    <div className="w-12 h-0.5 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0069B4] to-[#FF3520]" />
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">{title}</h2>
    {subtitle && <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">{subtitle}</p>}
  </div>
));

SectionHeader.displayName = 'SectionHeader';

/* ────────────────────── HERO SECTION ────────────────────── */
const HeroSection = memo(({ data }: { data: AboutSliderData[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [data.length]);

  if (!data.length) return null;

  const slide = data[currentSlide];
  const imageUrl = buildImageUrl(slide.home_img);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[75vh] overflow-hidden">
        {/* Hero Image */}
        <img
          src={imageUrl}
          alt={slide.heading || "Hero image"}
          className="absolute top-0 left-0 w-full h-full object-cover object-top"
          loading="eager"
          fetchPriority="high"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                <SparklesIcon className="w-3 h-3 text-yellow-300" />
                <span className="text-xs font-medium text-white">Welcome</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {slide.heading || "Shaping Tanzania's Media Landscape"}
              </h1>
              
              {slide.description && (
                <p className="text-sm sm:text-base text-white/90 mb-4 max-w-lg">
                  {cleanText(slide.description)}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/about/journey">
                  <button 
                    className="px-6 py-2.5 text-white rounded-full font-semibold text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 bg-gradient-to-r from-[#0069B4] to-[#FF3520]"
                  >
                    Discover Our Journey
                  </button>
                </Link>
                
                <div className="flex gap-2">
                  {data.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className="h-1.5 rounded-full transition-all cursor-pointer"
                      style={{ 
                        width: idx === currentSlide ? 28 : 6,
                        backgroundColor: idx === currentSlide ? '#FF3520' : 'rgba(255,255,255,0.3)'
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] text-white/40 uppercase tracking-wider hidden sm:block">Scroll</span>
          <ChevronDownIcon className="w-3 h-3 text-white/40" />
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

/* ────────────────────── ABOUT SECTION ────────────────────── */
const AboutSection = memo(({ content }: { content: MwananchiAboutData | null }) => {
  if (!content) return null;

  const paragraphs = useMemo(() => 
    content.description
      .split(/\n\s*\n/)
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 2)
  , [content.description]);

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-gray-50">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-0.5 rounded-full bg-[#0069B4]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#0069B4]">Who We Are</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{content.category}</h2>
            
            <div className="space-y-3 text-gray-600 text-sm md:text-base">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

          
          </div>

          {content.video_link && (
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
                <iframe
                  src={`${content.video_link}?autoplay=0&mute=1&controls=1`}
                  title={content.category}
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

/* ────────────────────── VISION MISSION SECTION ────────────────────── */
const VisionMissionSection = memo(() => {
  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "",
      stats: "10M+ Daily Reach",
      color: COLORS.primary,
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "",
      stats: "25+ Years of Impact",
      color: COLORS.accent,
    }
  ];

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-white">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Vision & Mission" />
        
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}80 100%)` }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: item.color }}>
                <ChartBarIcon className="w-3 h-3" />
                <span>{item.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';

/* ────────────────────── VALUES SECTION ────────────────────── */
const ValuesSection = memo(({ values, onCardClick }: { values: ValueData[]; onCardClick: (v: ValueData) => void }) => {
  const icons = [ShieldCheckIcon, HeartIcon, LightBulbIcon, UsersIcon];
  const displayValues = values.slice(0, 4);

  if (!displayValues.length) return null;

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-gray-50">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Core Values" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayValues.map((value, idx) => {
            const Icon = icons[idx % icons.length];
            
            return (
              <button
                key={value.value_id}
                onClick={() => onCardClick(value)}
                className="text-left group"
              >
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center bg-blue-50">
                    <Icon className="w-6 h-6 text-[#0069B4]" />
                  </div>
                  
                  <h3 className="text-base font-bold text-gray-900 mb-1">{value.category}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {truncateText(value.description || "", 50)}
                  </p>
                </div>
              </button>
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
  const displaySubs = subscriptions.slice(0, 5);

  if (!displaySubs.length) return null;

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-white">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Reach" subtitle="" />
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displaySubs.map((sub) => (
            <div key={sub.subscription_id} className="bg-white p-4 rounded-xl text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-2 p-2 rounded-lg bg-gray-50">
                <img
                  src={buildImageUrl(sub.logo_img_file)}
                  alt={sub.category}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              
              <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">{sub.category}</h3>
              
              <div className="text-lg font-bold text-[#0069B4]">
                <CountUp end={sub.total_viewers} duration={2} separator="," />
              </div>
              
              <p className="text-[10px] text-gray-400 mt-0.5">Viewers</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ReachSection.displayName = 'ReachSection';

/* ────────────────────── DISCOVER CARDS ────────────────────── */
const DiscoverCards = memo(({ cards }: { cards: AboutCardData[] }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  
  const getIcon = useCallback((type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return BuildingOfficeIcon;
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch(type) {
      case "Brand": return COLORS.primary;
      case "News": return COLORS.success;
      case "Events": return COLORS.accent;
      default: return COLORS.primary;
    }
  }, []);

  const displayCards = cards.slice(0, 3);

  if (!displayCards.length) return null;

  return (
    <section className="relative overflow-hidden py-12 md:py-16 bg-gray-50">
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
            >
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-10 right-0 text-white/70 hover:text-white"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="w-full h-full object-contain max-h-[80vh]" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Discover More" subtitle="Explore our latest stories" />
        
        <div className="grid md:grid-cols-3 gap-6">
          {displayCards.map((card) => {
            const Icon = getIcon(card.type);
            const imageUrl = buildImageUrl(card.imageUrl);
            const typeColor = getTypeColor(card.type);
            
            return (
              <div key={`${card.type}-${card.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all flex flex-col h-full border-b-4" style={{ borderBottomColor: typeColor }}>
                  <div className="relative w-full h-36 md:h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={card.title}
                      className="absolute bottom-0 left-0 w-full h-full object-contain object-bottom cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setSelectedImage({ url: imageUrl, title: card.title })}
                      loading="lazy"
                    />
                    
                    <div className="absolute bottom-2 left-2 z-10">
                      <div className="px-2 py-1 backdrop-blur-sm rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-md text-white" style={{ backgroundColor: `${typeColor}E6` }}>
                        <Icon className="w-3 h-3" />
                        <span>{card.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{card.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{card.description}</p>
                    
                    <Link to={card.linkUrl} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: typeColor }}>
                      Learn More
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length > 3 && (
          <div className="text-center mt-8">
            <Link to="/discover-more">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-xs text-white shadow-md bg-gradient-to-r from-[#0069B4] to-[#FF3520]">
                View All Stories
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </Link>
          </div>
        )}
      </div>
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-xl flex items-center justify-center p-3 bg-gray-50">
            <img 
              src={buildImageUrl(value.img_file)} 
              alt={value.category} 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <h3 className="text-xl font-bold mb-2 text-[#0069B4]">{value.category}</h3>
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
        
        // Check if it's an axios cancel error
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_CANCELED') {
          return; // Request was cancelled, ignore
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-6 rounded-xl shadow-md max-w-sm">
          <p className="text-red-500 mb-3 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2 text-white rounded-lg text-sm bg-[#0069B4] hover:bg-[#005A9B] transition-colors"
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
        hideProgressBar
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
          transition={{ duration: 0.3 }}
        >
          <Helmet>
            <title>About Us | Leading Media Company in Tanzania</title>
            <meta 
              name="description" 
              content={aboutContent ? cleanText(aboutContent.description).slice(0, 155) : "Leading digital multimedia company in Tanzania"} 
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
          
          <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
            <Footer />
          </Suspense>
        </motion.div>
      ) : (
        <SkeletonLoader />
      )}
    </div>
  );
};

export default memo(AboutFTSection);