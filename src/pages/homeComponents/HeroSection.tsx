import { memo, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { EyeIcon, UsersIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../../axios";

import { AboutSliderData, SubscriptionData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";

interface HeroSectionProps {
  data?: AboutSliderData[];
  subscriptions?: SubscriptionData[];
}

type HeroStage = 0 | 1;

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1920);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<HeroStage>(0);
  const [showSnakeMotion, setShowSnakeMotion] = useState(true);
  const [impactOffset, setImpactOffset] = useState(0);

  const sliderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const impactIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await axiosInstance.get("/api/slider-imgs");
        setSliderData(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSliderData([]);
      }
    };
    if (data.length > 0) setSliderData(data);
    else fetchSlider();
  }, [data]);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axiosInstance.get("/api/allsubscriptions");
        setSubscriptionData(res.data?.data || []);
      } catch {
        setSubscriptionData([]);
      }
    };
    if (subscriptions.length > 0) setSubscriptionData(subscriptions);
    else fetchSubs();
  }, [subscriptions]);

  // Main Image Slider
  useEffect(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);

    if (currentStage === 0 && sliderData.length > 0) {
      sliderIntervalRef.current = setInterval(() => {
        setSliderIndex((prev) => {
          const next = (prev + 1) % sliderData.length;
          if (next === 0) {
            setCurrentStage(1);
            return prev;
          }
          return next;
        });
      }, 7000);
    }

    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [currentStage, sliderData.length]);

  // Auto-slide for Impact Stage
  useEffect(() => {
    if (currentStage !== 1 || subscriptionData.length === 0) return;

    if (impactIntervalRef.current) clearInterval(impactIntervalRef.current);

    const intervalTime = isMobile ? 2600 : 3200;

    impactIntervalRef.current = setInterval(() => {
      setImpactOffset((prev) => {
        const maxOffset = subscriptionData.length - 1;
        const next = prev + 1;

        if (next > maxOffset) {
          setCurrentStage(0);
          setSliderIndex(0);
          setImpactOffset(0);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      if (impactIntervalRef.current) clearInterval(impactIntervalRef.current);
    };
  }, [currentStage, subscriptionData.length, isMobile]);

  const slide = sliderData[sliderIndex];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";
  const isFirstSlider = sliderIndex === 0;

  const sortedSubs = [...subscriptionData].sort((a, b) => a.subscription_id - b.subscription_id);

  const getHeadingSize = () => 
    isMobile ? "text-[2.1rem] leading-none" : 
    isTablet ? "text-5xl" : 
    "text-6xl xl:text-7xl 2xl:text-8xl";

  const getDescriptionSize = () => 
    isMobile ? "text-[15px] leading-tight" : 
    isTablet ? "text-base" : 
    "text-lg xl:text-xl";

  // Snake Animation
  const snakeColors = ["#3b82f6", "#ef4444", "#8b00ff", "#10b981", "#06b6d4", "#f97316"];
  const snakePaths = [
    "M -100 280 Q 200 120 450 320 Q 750 180 1100 290 Q 1400 220 1600 300",
    "M 180 -80 Q 320 180 280 420 Q 450 580 620 380 Q 850 520 1050 650",
    "M 1400 180 Q 1050 80 780 250 Q 520 420 300 190 Q -50 280 50 350",
    "M 250 750 Q 480 580 650 720 Q 820 480 980 650 Q 1150 420 1300 580",
    "M -50 100 Q 300 250 550 80 Q 850 320 1200 150",
    "M 1350 650 Q 950 420 720 580 Q 380 350 80 520",
  ];

  const renderSnakes = () => {
    if (!isFirstSlider || !showSnakeMotion) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {snakeColors.map((color, index) => {
          const delay = index * 0.22;
          const duration = 2.7 + index * 0.12;
          return (
            <motion.div key={`snake-${index}`} className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.25))" }}>
                <defs>
                  <linearGradient id={`snakeGrad${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                    <stop offset="45%" stopColor={color} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={snakePaths[index % snakePaths.length]}
                  fill="none"
                  stroke={`url(#snakeGrad${index})`}
                  strokeWidth={index % 2 === 0 ? 8 : 5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration, delay, ease: "easeInOut" }}
                />
              </svg>

              <motion.div
                className="absolute z-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  x: ["-8%", "15%", "32%", "50%", "68%", "85%", "108%"],
                  y: index % 3 === 0 ? ["25%", "18%", "34%", "23%", "31%", "26%", "29%"] : index % 3 === 1 ? ["68%", "74%", "57%", "70%", "59%", "73%", "67%"] : ["14%", "27%", "13%", "33%", "19%", "24%", "17%"],
                  scale: [0, 1.35, 1, 1.2, 0.85, 1.05, 0],
                  opacity: [0, 1, 1, 1, 1, 0.6, 0],
                }}
                transition={{ duration, delay, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-full blur-lg" style={{ background: `radial-gradient(circle, ${color} 30%, transparent 75%)` }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full" style={{ background: color, boxShadow: `0 0 20px ${color}` }} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (isFirstSlider && showSnakeMotion) {
      const timer = setTimeout(() => setShowSnakeMotion(false), 4300);
      return () => clearTimeout(timer);
    }
  }, [isFirstSlider, showSnakeMotion]);

  // Further Reduced Desktop Impact Stage
  const renderImpactStage = () => {
    const logoSize = isMobile 
      ? "w-16 h-16" 
      : isTablet 
        ? "w-22 h-22" 
        : "w-28 h-28";

    const cardMinHeight = isMobile ? "min-h-[240px]" : "min-h-[220px]";

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="impact-stage"
          className="absolute inset-0 z-40 overflow-hidden"
          style={{ background: "#1161B9" }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: '28px 28px'
            }}
          />

          <div className="relative z-50 flex flex-col items-center justify-center min-h-screen px-5 py-12 md:py-20 text-center">
            {/* Header */}
            <motion.div 
              className="mb-8 md:mb-12" 
              initial={{ y: 30, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/30 px-6 py-2.5 rounded-full mb-6 shadow-xl">
                <UsersIcon className="w-4 h-4 text-white" />
                <span className="uppercase tracking-[3px] text-white text-xs font-semibold">OUR IMPACT</span>
              </div>
              
              <p className="text-sm md:text-base text-white/80 font-light tracking-wide max-w-xs mx-auto">
                Reaching millions together
              </p>
            </motion.div>

            {/* Cards Container */}
            <div className="w-full max-w-md md:max-w-6xl px-4">
              {isMobile ? (
                // Mobile: Vertical sliding (unchanged)
                <div className="relative h-[320px] overflow-hidden mx-auto">
                  <motion.div
                    className="flex flex-col gap-5 absolute w-full"
                    initial={{ y: 0 }}
                    animate={{ y: `-${impactOffset * 325}px` }}
                    transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {sortedSubs.map((sub, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex-shrink-0 w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col items-center justify-center text-center ${cardMinHeight} py-6`}
                      >
                        <div className="flex flex-col items-center">
                          {sub.logo_img_file ? (
                            <img
                              src={buildImageUrl(sub.logo_img_file, baseURL)}
                              alt={sub.category}
                              className={`${logoSize} object-contain mb-4`}
                            />
                          ) : (
                            <EyeIcon className="w-14 h-14 text-gray-400 mb-4" />
                          )}

                          <p className="text-[#1161B9] text-[10px] font-semibold uppercase tracking-[2px] mb-1.5">
                            {sub.category}
                          </p>

                          <p className="text-[#1161B9] font-bold text-3xl tracking-[-1.5px] leading-none">
                            {typeof sub.total_viewers === 'number' 
                              ? sub.total_viewers.toLocaleString() 
                              : sub.total_viewers}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                // Desktop/Tablet: Further reduced height and font sizes
                <motion.div
                  className="flex gap-6"
                  initial={{ x: 0 }}
                  animate={{ 
                    x: `calc(-${impactOffset * (210 + 24)}px)` 
                  }}
                  transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ width: `${sortedSubs.length * (210 + 24)}px` }}
                >
                  {sortedSubs.map((sub) => (
                    <motion.div
                      key={sub.subscription_id}
                      className="flex-shrink-0 flex flex-col items-center text-center w-[210px]"
                      whileHover={{ y: -5 }}
                    >
                      <div className={`w-full ${cardMinHeight} bg-white/95 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-5 shadow-2xl border border-white/30 overflow-hidden`}>
                        {sub.logo_img_file ? (
                          <img
                            src={buildImageUrl(sub.logo_img_file, baseURL)}
                            alt={sub.category}
                            className={`${logoSize} object-contain p-4`}
                          />
                        ) : (
                          <EyeIcon className="w-14 h-14 text-gray-400" />
                        )}
                      </div>

                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[2px] mb-2">
                        {sub.category}
                      </p>

                      <p className="text-white font-bold text-3xl lg:text-4xl tracking-[-2px] leading-none">
                        {typeof sub.total_viewers === 'number' 
                          ? sub.total_viewers.toLocaleString() 
                          : sub.total_viewers}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Progress Dots */}
            {!isMobile && (
              <div className="flex gap-2 mt-10">
                {Array.from({ length: Math.max(1, sortedSubs.length - 3) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-700 ${i === impactOffset 
                      ? "bg-white w-8" 
                      : "bg-white/30 w-2"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (sliderData.length === 0 && currentStage === 0) {
    return <div className="min-h-screen bg-[#1161B9] flex items-center justify-center text-white">Loading experience...</div>;
  }

  return (
    <motion.section
      className="relative w-full overflow-hidden bg-black min-h-screen"
      style={{ opacity, scale }}
    >
      <div className="relative w-full h-screen overflow-hidden">
        {/* Stage 0: Image Slider */}
        {currentStage === 0 && (
          <div className="absolute inset-0 z-10">
            <img 
              src={imageUrl} 
              alt={slide?.heading || "Hero"} 
              className="w-full h-full object-cover" 
              draggable={false} 
            />
            {renderSnakes()}

            <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {sliderData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSliderIndex(idx)}
                  className={`h-1 rounded-full transition-all ${idx === sliderIndex ? "bg-red-500 w-6" : "bg-white/40 w-1.5"}`}
                />
              ))}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center text-white">
              <motion.h1
                key={`h1-${sliderIndex}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-semibold tracking-tight mb-4 ${getHeadingSize()}`}
              >
                {slide?.heading}
              </motion.h1>
              <motion.p
                key={`p-${sliderIndex}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`max-w-md mx-auto ${getDescriptionSize()}`}
              >
                {cleanText(slide?.description || "")}
              </motion.p>
            </div>
          </div>
        )}

        {/* Stage 1: Our Impact */}
        {currentStage === 1 && renderImpactStage()}

        {/* Stage Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md px-5 py-1.5 rounded-full text-xs text-white/70 font-medium">
          {currentStage === 0 ? "Journey" : "Our Impact"}
        </div>
      </div>
    </motion.section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;