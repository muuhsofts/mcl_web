import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AboutSliderData, SubscriptionData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";
import axiosInstance from "../../axios";

interface HeroSectionProps {
  data?: AboutSliderData[];
  subscriptions?: SubscriptionData[];
}

const SLIDE_INTERVAL = 5000;

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Motion values - always call hooks unconditionally
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  
  // Create transforms unconditionally - they can be MotionValue or number
  const rawTransformX = useTransform(springX, [-10, 10], [-15, 15]);
  const rawTransformY = useTransform(springY, [-10, 10], [-15, 15]);
  
  // Use transform values based on isMobile
  const transformX: MotionValue<number> | number = !isMobile ? rawTransformX : 0;
  const transformY: MotionValue<number> | number = !isMobile ? rawTransformY : 0;

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload images with priority and lazy loading
  useEffect(() => {
    if (!data?.length) return;
    
    const preloadImage = (src: string, index: number) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImagesLoaded(prev => new Set(prev).add(index));
          resolve();
        };
        img.onerror = () => resolve();
        
        if (index === currentSlide) {
          img.fetchPriority = "high";
        }
      });
    };

    const currentIndex = currentSlide;
    const nextIndex = (currentSlide + 1) % data.length;
    
    const imagesToLoad = [currentIndex];
    if (nextIndex !== currentIndex) {
      imagesToLoad.push(nextIndex);
    }
    
    imagesToLoad.forEach(index => {
      if (!imagesLoaded.has(index) && data[index]?.home_img) {
        const imageUrl = buildImageUrl(data[index].home_img, baseURL);
        preloadImage(imageUrl, index);
      }
    });
  }, [data, baseURL, currentSlide, imagesLoaded]);

  // Auto-slide with performance optimization
  useEffect(() => {
    if (!isAutoPlaying || !data?.length || data.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, SLIDE_INTERVAL);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, data?.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY, isMobile]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  // Sort subscriptions by subscription_id in ascending order
  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions?.length) return [];
    return [...subscriptions].sort((a, b) => a.subscription_id - b.subscription_id);
  }, [subscriptions]);

  // Early return if no data
  if (!data?.length) {
    return null;
  }

  const slide = data[currentSlide];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";
  const isCurrentImageLoaded = imagesLoaded.has(currentSlide);

  // Helper to get style for transform
  const getImageStyle = () => {
    if (isMobile) {
      return { scale: 1 };
    }
    return {
      scale: 1.05,
      x: transformX as MotionValue<number>,
      y: transformY as MotionValue<number>,
    };
  };

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Hero Slider */}
      <div 
        ref={sliderRef}
        className={`relative w-full overflow-hidden ${isMobile ? 'h-[60vh] sm:h-[70vh]' : 'h-[85vh] md:h-[95vh]'}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isMobile && setIsAutoPlaying(false)}
        onMouseLeave={() => !isMobile && setIsAutoPlaying(true)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {imageUrl && (
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet={`${imageUrl}?w=640&h=480&fit=crop&q=85`}
              />
              <source
                media="(max-width: 768px)"
                srcSet={`${imageUrl}?w=768&h=600&fit=crop&q=85`}
              />
              <source
                media="(max-width: 1024px)"
                srcSet={`${imageUrl}?w=1024&h=800&fit=crop&q=85`}
              />
              <source
                media="(min-width: 1025px)"
                srcSet={`${imageUrl}?w=1920&h=1080&fit=crop&q=90`}
              />
              <motion.img
                src={imageUrl}
                alt={slide?.heading || "Hero image"}
                className={`absolute top-0 left-0 w-full h-full ${isMobile ? 'object-cover object-center' : 'object-cover object-top'}`}
                style={getImageStyle()}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: isCurrentImageLoaded ? 1 : 0,
                  scale: !isMobile ? 1.05 : 1
                }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  scale: !isMobile ? { duration: 10, repeat: Infinity, repeatType: "reverse" } : {}
                }}
                loading={currentSlide === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </picture>
          )}
        </div>

        {/* Dark Overlay for better text readability on mobile */}
        <div className="absolute inset-0 bg-black/40 md:bg-black/30 z-10" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center z-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`${isMobile ? 'text-center max-w-full' : 'max-w-3xl'}`}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`
                  font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-[1.2] sm:leading-[1.1] tracking-tight font-sans
                  ${isMobile 
                    ? 'text-2xl sm:text-3xl md:text-4xl' 
                    : 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl'
                  }
                `}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {slide?.heading || "Shaping Tanzania's Media Landscape"}
              </motion.h1>
              
              {slide?.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={`
                    text-white mb-5 sm:mb-6 md:mb-8 font-sans
                    ${isMobile 
                      ? 'text-xs sm:text-sm max-w-full px-2' 
                      : 'text-base md:text-lg max-w-xl'
                    }
                  `}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {cleanText(slide.description)}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={`flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5 ${isMobile ? 'justify-center' : ''}`}
              >
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      rounded-full font-bold text-white shadow-xl font-sans 
                      bg-gradient-to-r from-[#FF3520] to-[#0069B4] hover:shadow-2xl transition-all
                      ${isMobile 
                        ? 'px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm' 
                        : 'px-10 py-4 text-lg'
                      }
                    `}
                  >
                    Welcome
                  </motion.button>
                </Link>
                
                <div className="flex gap-1.5 md:gap-2">
                  {data.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSlideChange(idx)}
                      className="transition-all cursor-pointer focus:outline-none"
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      <motion.div
                        animate={{
                          width: idx === currentSlide ? (isMobile ? 20 : 32) : (isMobile ? 5 : 8),
                          backgroundColor: idx === currentSlide ? '#0069B4' : 'rgba(255,255,255,0.8)'
                        }}
                        className="h-1 rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Digital Reach Section - Enhanced visibility on mobile */}
      {sortedSubscriptions.length > 0 && (
        <div className="relative z-30 bg-gradient-to-b from-[#E8F1F8] to-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative -mt-8 sm:-mt-12 md:-mt-20 z-40"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl shadow-[#0069B4]/10 overflow-hidden border border-[#0069B4]/10">
                {/* Section Header with better mobile spacing */}
                <div className={`text-center ${isMobile ? 'pt-6 pb-3' : 'pt-10 pb-6'} px-4 bg-gradient-to-b from-[#435663] to-white`}>
                  <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#0069B4] bg-[#E8F1F8] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#0069B4]/20">
                    Digital Reach
                  </span>
                  <h2 className={`font-bold text-gray-900 mt-2 sm:mt-4 mb-1 sm:mb-3 ${isMobile ? 'text-xl sm:text-2xl' : 'text-3xl md:text-4xl'}`}>
                    Websites & Applications
                  </h2>
                  <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#0069B4] to-[#FF3520] mx-auto rounded-full mt-1 sm:mt-2" />
                </div>

                {/* Responsive Grid - Mobile optimized */}
                <div className={`
                  grid gap-3 sm:gap-4 md:gap-6 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10
                  ${isMobile 
                    ? 'grid-cols-1' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  }
                `}>
                  {sortedSubscriptions.map((sub, idx) => (
                    <motion.div
                      key={sub.subscription_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min((idx % 5) * 0.05, 0.2) }}
                      whileHover={!isMobile ? { y: -8, scale: 1.02 } : {}}
                      onHoverStart={() => !isMobile && setActiveCard(idx)}
                      onHoverEnd={() => !isMobile && setActiveCard(null)}
                      className="w-full"
                    >
                      <motion.div 
                        className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden h-full border border-[#0069B4]/10 hover:border-[#0069B4]/30 transition-all duration-300 group shadow-md sm:shadow-sm hover:shadow-xl"
                        animate={!isMobile ? {
                          boxShadow: activeCard === idx 
                            ? "0 20px 40px -12px rgba(0, 105, 180, 0.2), 0 8px 18px rgba(0,0,0,0.06)" 
                            : "0 4px 12px -6px rgba(0, 105, 180, 0.08), 0 2px 4px rgba(0,0,0,0.02)"
                        } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Top accent bar on hover */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-[#0069B4] to-[#FF3520] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        
                        <div className={`${isMobile ? 'p-3 sm:p-4' : 'p-5 md:p-6'} text-center`}>
                          {/* Logo container - responsive sizing */}
                          <div className={`relative mx-auto mb-2 sm:mb-3 md:mb-4 ${isMobile ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-24 h-24'}`}>
                            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0069B4]/10 to-[#FF3520]/5 blur-md sm:blur-xl group-hover:blur-lg sm:group-hover:blur-2xl transition-all duration-300" />
                            <div className="relative w-full h-full p-1 sm:p-1.5 md:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center border border-[#0069B4]/10 group-hover:border-[#0069B4]/30 group-hover:shadow-md transition-all duration-300">
                              {sub.logo_img_file ? (
                                <img
                                  src={buildImageUrl(sub.logo_img_file, baseURL)}
                                  alt={sub.category}
                                  width={isMobile ? 48 : 80}
                                  height={isMobile ? 48 : 80}
                                  className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0069B4]/40 group-hover:text-[#0069B4] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Category with better mobile text sizing */}
                          <h3 className={`
                            font-bold text-gray-800 mb-1 sm:mb-2 md:mb-3 line-clamp-2 flex items-center justify-center font-sans tracking-tight
                            group-hover:text-[#0069B4] transition-colors duration-300
                            ${isMobile ? 'text-xs sm:text-sm' : 'text-base md:text-lg'}
                          `}>
                            {sub.category}
                          </h3>
                          
                          {/* Viewers Counter with visible numbers on mobile */}
                          <div className="mt-0.5 sm:mt-1 md:mt-2">
                            <div className={`
                              font-black bg-gradient-to-r from-[#0069B4] to-[#FF3520] bg-clip-text text-transparent font-sans tracking-tighter
                              ${isMobile ? 'text-base sm:text-lg md:text-xl' : 'text-2xl md:text-3xl'}
                            `}>
                              {sub.total_viewers}
                            </div>
                          </div>

                          {/* Border accent with better mobile visibility */}
                          <div className={`w-6 sm:w-8 md:w-10 h-0.5 bg-gradient-to-r from-[#0069B4] to-[#FF3520] mx-auto mt-2 sm:mt-3 md:mt-4 rounded-full transform group-hover:scale-125 transition-transform duration-300`} />
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Scroll Indicator - Hidden on mobile for better UX */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-xs text-white/80 uppercase tracking-wider font-sans">Explore</span>
            <ChevronDownIcon className="w-4 h-4 text-white/80" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;