import { memo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EyeIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { SubscriptionData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface OurImpactProps {
  onComplete?: () => void;
  autoPlay?: boolean;
  intervalTime?: number;
}

const OurImpact = memo(({ 
  onComplete, 
  autoPlay = true,
  intervalTime = 5000
}: OurImpactProps) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Fetch subscriptions on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/allsubscriptions');
        
        if (response.data && response.data.data) {
          setSubscriptions(response.data.data);
        } else if (Array.isArray(response.data)) {
          setSubscriptions(response.data);
        } else {
          throw new Error('Invalid data format received');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load impact data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const sortedSubs = [...subscriptions].sort((a, b) => a.subscription_id - b.subscription_id);
  const totalSlides = sortedSubs.length;
  
  // Get screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay slider effect
  useEffect(() => {
    if (!isPlaying || totalSlides === 0 || loading) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSlides) {
          onComplete?.();
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSlides, isPlaying, onComplete, intervalTime, loading]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    resetAutoplay();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    resetAutoplay();
  };

  const resetAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (isPlaying && totalSlides > 0) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => {
            const next = prev + 1;
            if (next >= totalSlides) {
              onComplete?.();
              return 0;
            }
            return next;
          });
        }, intervalTime);
      }
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    resetAutoplay();
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      resetAutoplay();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0';
  };

  // Loading state
  if (loading) {
    return (
      <section className="w-full bg-gradient-to-br from-[#0a4a8a] to-[#1161B9] py-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
            <p className="text-white mt-4 text-lg">Loading impact data...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full bg-gradient-to-br from-[#0a4a8a] to-[#1161B9] py-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white text-lg">{error}</p>
        </div>
      </section>
    );
  }

  if (sortedSubs.length === 0) {
    return null;
  }

  // Card dimensions
  const cardWidth = isMobile ? 'w-full max-w-[380px]' : 'w-full max-w-[580px]';
  const cardHeight = isMobile ? 'h-[130px]' : 'h-[150px]';
  
  // Logo dimensions - increased size
  const logoSize = isMobile ? 'w-20 h-20' : 'w-24 h-24';
  const logoContainerSize = isMobile ? 'w-20 h-20' : 'w-24 h-24';
  
  const numberSize = isMobile ? 'text-2xl' : 'text-3xl';

  return (
    <section className="w-full bg-gradient-to-br from-[#0a4a8a] via-[#1161B9] to-[#1a6fc9] overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M40 40L0 0h80L40 40zM40 40L0 80h80L40 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a4a8a]/30 to-transparent" />
        
        <motion.div 
          className="absolute inset-0 opacity-0"
          animate={{ 
            opacity: [0, 0.03, 0],
            x: ['-100%', '100%', '200%']
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        {/* Header Section - Subtitle removed */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <UsersIcon className="w-5 h-5 text-white" />
            <span className="uppercase tracking-[3px] text-white text-sm font-semibold">OUR IMPACT</span>
          </motion.div>
        </motion.div>

        {/* Slider Section - Single Card Centered */}
        <div className="relative max-w-3xl mx-auto">
          {/* Navigation Arrows */}
          {!isMobile && totalSlides > 1 && (
            <>
              <motion.button
                onClick={handlePrev}
                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md rounded-full p-2 md:p-3 hover:bg-white/40 transition-all shadow-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.button>
              
              <motion.button
                onClick={handleNext}
                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md rounded-full p-2 md:p-3 hover:bg-white/40 transition-all shadow-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.button>
            </>
          )}

          {/* Card Container - Centered */}
          <div className="flex justify-center items-center min-h-[180px]">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`${cardWidth} mx-auto`}
            >
              <motion.div
                className={`group relative bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer ${cardHeight}`}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Horizontal Card Layout */}
                <div className="flex items-center h-full px-4 md:px-6 gap-3 md:gap-4">
                  {/* Left: Logo - Larger size */}
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1161B9] to-[#FF3520] rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                      {sortedSubs[currentIndex]?.logo_img_file ? (
                        <img
                          src={buildImageUrl(sortedSubs[currentIndex].logo_img_file, baseURL)}
                          alt={sortedSubs[currentIndex].category}
                          className={`${logoSize} object-contain relative z-10`}
                          style={{ width: logoSize, height: logoSize }}
                        />
                      ) : (
                        <div className={`${logoContainerSize} bg-gradient-to-br from-[#1161B9]/10 to-[#FF3520]/10 rounded-full flex items-center justify-center`}>
                          <EyeIcon className="w-10 h-10 text-[#1161B9]" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Center: Category */}
                  <div className="flex-1 text-center">
                    <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#1161B9]/10 to-[#FF3520]/10 text-[#1161B9] text-xs md:text-sm font-semibold uppercase tracking-wider rounded-full">
                      {sortedSubs[currentIndex]?.category}
                    </span>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-[#1161B9] opacity-70" />
                  </div>

                  {/* Right: Total Viewers */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`${numberSize} md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1161B9] to-[#FF3520] leading-tight`}>
                      {formatNumber(sortedSubs[currentIndex]?.total_viewers)}
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#1161B9]/0 to-[#FF3520]/0 group-hover:from-[#1161B9]/5 group-hover:to-[#FF3520]/5 transition-all duration-300"
                  initial={false}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Progress Indicators */}
        {totalSlides > 1 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            {/* Progress Dots */}
            <div className="flex gap-2 flex-wrap justify-center">
              {sortedSubs.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleDotClick(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentIndex 
                      ? "bg-white w-7" 
                      : "bg-white/30 w-2 hover:bg-white/50"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            {autoPlay && (
              <motion.button
                onClick={toggleAutoplay}
                className="text-white/70 hover:text-white transition-colors bg-white/10 backdrop-blur-sm rounded-full p-2 mt-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

OurImpact.displayName = "OurImpact";

export default OurImpact;