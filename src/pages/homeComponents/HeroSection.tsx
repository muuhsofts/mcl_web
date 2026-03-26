import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AboutSliderData, SubscriptionData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";
import axiosInstance from "../../axios";

interface HeroSectionProps {
  data: AboutSliderData[];
  subscriptions: SubscriptionData[];
}

const SLIDE_INTERVAL = 5000;

const HeroSection = memo(({ data, subscriptions }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Preload images for faster loading
  useEffect(() => {
    if (!data.length) return;
    
    const loadPromises = data.map((slide, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = buildImageUrl(slide.home_img, baseURL);
        img.onload = () => {
          setImagesLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          resolve(true);
        };
        img.onerror = () => {
          setImagesLoaded(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
          resolve(false);
        };
      });
    });
    
    Promise.all(loadPromises);
  }, [data, baseURL]);

  useEffect(() => {
    if (!isAutoPlaying || data.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, data.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  if (!data.length) return null;

  const slide = data[currentSlide];
  const imageUrl = buildImageUrl(slide.home_img, baseURL);
  const displaySubs = subscriptions.slice(0, 8);
  const isCurrentImageLoaded = imagesLoaded[currentSlide];

  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 8,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#007aff] to-[#FF3520]">
      <div 
        className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#007aff] to-[#FF3520] animate-pulse" />
          )}
          <motion.img
            src={imageUrl}
            alt={slide.heading || "Hero image"}
            width="1920"
            height="1080"
            className="absolute top-0 left-0 w-full h-full object-contain md:object-cover object-top"
            style={{
              scale: 1.05,
              x: useTransform(springX, [-10, 10], [-15, 15]),
              y: useTransform(springY, [-10, 10], [-15, 15]),
            }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: isCurrentImageLoaded ? 1 : 0,
              scale: 1.05 
            }}
            transition={{ 
              opacity: { duration: 0.5 },
              scale: { duration: 10, repeat: Infinity, repeatType: "reverse" }
            }}
          />
        </div>

        {/* Simple Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

        {/* Simple Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/30"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.2, 0.5, 0.2],
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

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight font-sans drop-shadow-lg"
              >
                {slide.heading || "Shaping Tanzania's Media Landscape"}
              </motion.h1>
              
              {slide.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-base md:text-lg text-white/90 mb-8 max-w-xl font-sans drop-shadow"
                >
                  {cleanText(slide.description)}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center gap-5"
              >
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 rounded-full font-bold text-white shadow-xl text-lg font-sans bg-gradient-to-r from-[#FF3520] to-[#007aff] hover:shadow-2xl transition-all"
                  >
                    Welcome
                  </motion.button>
                </Link>
                
                {/* Slide Indicators */}
                <div className="flex gap-2">
                  {data.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className="transition-all cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          width: idx === currentSlide ? 32 : 8,
                          backgroundColor: idx === currentSlide ? '#FF3520' : 'rgba(255,255,255,0.6)'
                        }}
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

      {/* Digital Reach Cards - With Fixed Width/Height */}
      {displaySubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative -mt-20 md:-mt-28 z-30 pb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="flex gap-4 min-w-max lg:grid lg:grid-cols-8 lg:gap-5">
                {displaySubs.map((sub, idx) => (
                  <motion.div
                    key={sub.subscription_id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + idx * 0.03 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="w-[200px] lg:w-auto flex-shrink-0"
                  >
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-white/20">
                      {/* Fixed size container for image - ENLARGED */}
                      <div className="w-24 h-24 mx-auto mb-3 p-3 rounded-xl bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10 flex items-center justify-center">
                        <img
                          src={buildImageUrl(sub.logo_img_file, baseURL)}
                          alt={sub.category}
                          width="96"
                          height="96"
                          className="w-full h-full object-contain"
                          loading="lazy"
                          style={{ width: '96px', height: '96px' }}
                        />
                      </div>
                      
                      {/* Fixed height for title */}
                      <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-1 font-sans min-h-[44px] flex items-center justify-center">
                        {sub.category}
                      </h3>
                      
                      {/* Fixed height for counter */}
                      <div className="min-h-[44px] flex items-center justify-center">
                        <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent font-sans">
                          <CountUp end={sub.total_viewers} duration={2} separator="," />K
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scroll Indicator */}
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
          onClick={() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          <span className="text-xs text-white/70 uppercase tracking-wider font-sans">Explore</span>
          <ChevronDownIcon className="w-4 h-4 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;