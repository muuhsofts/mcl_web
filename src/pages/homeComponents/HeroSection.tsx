import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Preload images
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

  // Auto-slide
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
  const displaySubs = subscriptions.slice(0, 12);
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
    <section className="relative w-full overflow-hidden bg-white">
      {/* Hero Slider */}
      <div 
        className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/40"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.2, 0.6, 0.2],
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

        {/* Hero Content */}
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

      {/* Subscription Cards - Tightly attached + Stronger Shadow */}
      {displaySubs.length > 0 && (
        <div className="relative z-30 bg-white -mt-px">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12 md:pb-16">
            <div 
              ref={cardsContainerRef}
              className="overflow-x-auto scroll-smooth pb-6 hide-scrollbar"
            >
              <div className="flex gap-6 lg:gap-8 min-w-max">
                {displaySubs.map((sub, idx) => (
                  <motion.div
                    key={sub.subscription_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + idx * 0.03 }}
                    whileHover={{ y: -8 }}
                    onHoverStart={() => setActiveCard(idx)}
                    onHoverEnd={() => setActiveCard(null)}
                    className="flex-shrink-0 w-full max-w-[325px] lg:max-w-[295px] xl:max-w-[285px]"
                  >
                    <motion.div 
                      className="relative bg-[#f8f9fa] rounded-3xl overflow-hidden h-full border border-gray-100"
                      animate={{
                        boxShadow: activeCard === idx 
                          ? "0 40px 90px -20px rgba(0, 0, 0, 0.28)" 
                          : "0 25px 60px -15px rgba(0, 0, 0, 0.22)"
                      }}
                      whileHover={{
                        boxShadow: "0 45px 100px -15px rgba(0, 0, 0, 0.35)",
                        y: -8
                      }}
                    >
                      <div className="p-8 text-center">
                        {/* Logo */}
                        <div className="relative w-36 h-36 mx-auto mb-6">
                          <div className="absolute inset-0 rounded-2xl bg-white/80 blur-2xl" />
                          <div className="relative w-full h-full p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center border border-gray-50">
                            <img
                              src={buildImageUrl(sub.logo_img_file, baseURL)}
                              alt={sub.category}
                              width="130"
                              height="130"
                              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        
                        {/* Category */}
                        <h3 className="text-xl font-bold text-gray-800 mb-5 line-clamp-2 min-h-[60px] flex items-center justify-center font-sans">
                          {sub.category}
                        </h3>
                        
                        {/* Viewers */}
                        <div>
                          <div className="text-4xl font-black bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent font-sans tracking-tighter">
                            <CountUp 
                              end={sub.total_viewers} 
                              duration={2.2} 
                              separator="," 
                              decimals={0}
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1 font-medium"></p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="lg:hidden flex justify-center mt-8">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="text-xs text-gray-400 flex items-center gap-2"
              >
                Scroll to see all platforms →
              </motion.div>
            </div>
          </div>
        </div>
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
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs text-white/80 uppercase tracking-wider font-sans">Explore</span>
          <ChevronDownIcon className="w-4 h-4 text-white/80" />
        </motion.div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;