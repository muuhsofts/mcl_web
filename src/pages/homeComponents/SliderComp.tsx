import { memo, useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AboutSliderData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";
import axiosInstance from "../../axios";

interface SliderCompProps {
  data: AboutSliderData[];
  isMobile: boolean;
}

const SLIDE_INTERVAL = 5000;

const SliderComp = memo(({ data, isMobile }: SliderCompProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const sliderRef = useRef<HTMLDivElement>(null);

  // Motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  
  const rawTransformX = useTransform(springX, [-10, 10], [-15, 15]);
  const rawTransformY = useTransform(springY, [-10, 10], [-15, 15]);
  
  const transformX: MotionValue<number> | number = !isMobile ? rawTransformX : 0;
  const transformY: MotionValue<number> | number = !isMobile ? rawTransformY : 0;

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Preload images
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

  // Auto-slide
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

  const slide = data[currentSlide];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";
  const isCurrentImageLoaded = imagesLoaded.has(currentSlide);
  const slideHeading = slide?.heading;
  const slideDescription = slide?.description;

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

  // Don't render if no image URL
  if (!imageUrl) {
    return null;
  }

  return (
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
              alt={slideHeading || "Hero image"}
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

      {/* Dark Overlay */}
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
            {/* Heading - Reduced font sizes */}
            {slideHeading && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`
                  font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-[1.2] sm:leading-[1.1] tracking-tight font-sans
                  ${isMobile 
                    ? 'text-xl sm:text-2xl md:text-3xl' 
                    : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                  }
                `}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {slideHeading}
              </motion.h1>
            )}
            
            {/* Description - Adjusted spacing */}
            {slideDescription && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`
                  text-white mb-4 sm:mb-5 md:mb-6 font-sans
                  ${isMobile 
                    ? 'text-xs sm:text-sm max-w-full px-2' 
                    : 'text-sm md:text-base max-w-xl'
                  }
                `}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                {cleanText(slideDescription)}
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
                      ? 'px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm' 
                      : 'px-8 py-3 text-base'
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
                        width: idx === currentSlide ? (isMobile ? 16 : 24) : (isMobile ? 4 : 6),
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

      {/* Scroll Indicator */}
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
    </div>
  );
});

SliderComp.displayName = 'SliderComp';
export default SliderComp;