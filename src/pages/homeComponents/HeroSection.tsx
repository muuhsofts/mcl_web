import { memo, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { EyeIcon, PlayIcon, PauseIcon, UsersIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../../axios";

import { AboutSliderData, SubscriptionData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";

interface HeroSectionProps {
  data?: AboutSliderData[];
  subscriptions?: SubscriptionData[];
}

type HeroStage = 0 | 1 | 2;

const VolumeUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const VolumeOffIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6-4.72 4.72a.75.75 0 0 0-.53 1.28l4.72 4.72c.342.342.53.802.53 1.28v-9.58c0-.954-1.154-1.433-1.83-.78Zm11.78 0A9 9 0 0 0 8.25 7.5M8.25 7.5A9 9 0 0 0 2.25 12m6-4.5L2.25 12" />
  </svg>
);

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1920);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<HeroStage>(0);
  const [showSnakeMotion, setShowSnakeMotion] = useState(true);
  const [impactOffset, setImpactOffset] = useState(0);

  // Video states
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

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

  // Main Slider
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

  // Horizontal Impact Slider
  useEffect(() => {
    if (currentStage !== 1 || subscriptionData.length < 4) return;

    if (impactIntervalRef.current) clearInterval(impactIntervalRef.current);

    impactIntervalRef.current = setInterval(() => {
      setImpactOffset((prev) => {
        const next = prev + 1;
        const maxOffset = subscriptionData.length - 4;
        if (next > maxOffset) {
          setCurrentStage(2);
          return 0;
        }
        return next;
      });
    }, 3200);

    return () => {
      if (impactIntervalRef.current) clearInterval(impactIntervalRef.current);
    };
  }, [currentStage, subscriptionData.length]);

  // YouTube Setup
  useEffect(() => {
    if (currentStage !== 2 || videoError) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      if (!videoContainerRef.current) return;
      // @ts-ignore
      playerRef.current = new YT.Player("hero-youtube-player", {
        videoId: "3f2LulEqgrw",
        playerVars: { autoplay: 1, mute: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3, playsinline: 1 },
        events: {
          onReady: (event: any) => {
            setVideoReady(true);
            event.target.playVideo();
            setIsVideoPlaying(true);
            setIsMuted(true);
          },
          onError: () => setVideoError(true),
        },
      });
    };

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [currentStage, videoError]);

  const slide = sliderData[sliderIndex];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";
  const isFirstSlider = sliderIndex === 0;

  const sortedSubs = [...subscriptionData].sort((a, b) => a.subscription_id - b.subscription_id);

  const getHeadingSize = () => isMobile ? "text-2xl leading-tight" : isTablet ? "text-4xl md:text-5xl" : "text-6xl xl:text-7xl 2xl:text-8xl";
  const getDescriptionSize = () => isMobile ? "text-xs" : isTablet ? "text-sm md:text-base" : "text-lg xl:text-xl";

  // Snake System (unchanged)
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

  // ─── Updated Our Impact Stage with #1161B9 color & reduced font sizes ───
  const renderImpactStage = () => {
    const itemWidth = isMobile ? "168px" : isTablet ? "200px" : "235px";

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="impact-stage"
          className="absolute inset-0 overflow-hidden z-20"
          style={{ background: "#1161B9" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
            {/* Section Header - Clean and minimal */}
            <motion.div 
              className="mb-12" 
              initial={{ y: 30, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mb-6">
                <UsersIcon className="w-3.5 h-3.5 text-white" />
                <span className="uppercase tracking-[3px] text-white text-[11px] font-semibold">OUR IMPACT</span>
              </div>
              
              <p className="text-sm md:text-base text-white/70 font-light tracking-wide">
                Reaching millions together
              </p>
            </motion.div>

            {/* Impact Cards - Horizontal Scroll with smooth animation */}
            <div className="w-full max-w-7xl overflow-hidden px-4">
              <motion.div
                className="flex gap-6 justify-center"
                animate={{ x: `calc(-${impactOffset * (parseInt(itemWidth) + 24)}px)` }}
                transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ width: `${sortedSubs.length * (parseInt(itemWidth) + 24)}px` }}
              >
                {sortedSubs.map((sub, idx) => (
                  <motion.div
                    key={idx}
                    className="flex-shrink-0 flex flex-col items-center text-center"
                    style={{ width: itemWidth }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    {/* Logo Card - Clean white with subtle shadow */}
                    <div className="w-36 h-32 md:w-44 md:h-40 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 shadow-xl border border-white/20">
                      {sub.logo_img_file ? (
                        <img
                          src={buildImageUrl(sub.logo_img_file, baseURL)}
                          alt={sub.category}
                          className="w-28 h-28 md:w-36 md:h-36 object-contain p-3"
                        />
                      ) : (
                        <EyeIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>

                    {/* Category - Smaller, uppercase, subtle */}
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[2px] mb-1">
                      {sub.category}
                    </p>

                    {/* Total Viewers - Reduced font, clean number display */}
                    <p className="text-white font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight">
                      {typeof sub.total_viewers === 'number' ? sub.total_viewers.toLocaleString() : sub.total_viewers}
                    </p>
                    
                    {/* Label - Very subtle */}
                    <p className="text-white/40 text-[10px] mt-0.5 tracking-wider">VIEWERS REACHED</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Progress Dots - Minimal */}
            <div className="flex gap-1.5 mt-12">
              {Array.from({ length: Math.max(1, sortedSubs.length - 3) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === impactOffset 
                    ? "bg-white w-6 shadow-md" 
                    : "bg-white/20 w-1.5"}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Video Stage (unchanged)
  const handleVideoPlayPause = () => {
    if (!playerRef.current || !videoReady) return;
    if (isVideoPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleVideoMuteUnmute = () => {
    if (!playerRef.current || !videoReady) return;
    if (isMuted) playerRef.current.unMute();
    else playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  const renderVideoStage = () => {
    if (videoError) {
      return <div className="absolute inset-0 bg-black flex items-center justify-center text-white">Video unavailable</div>;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div key="video-stage" className="absolute inset-0 bg-black z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div ref={videoContainerRef} className="absolute inset-0">
            <div id="hero-youtube-player" className="w-full h-full" />
          </div>

          <div className="absolute top-6 right-6 z-50 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVideoMuteUnmute}
              className="bg-black/70 hover:bg-black/90 p-3 rounded-xl text-white border border-white/30 backdrop-blur-sm"
            >
              {isMuted ? <VolumeOffIcon className="w-4 h-4" /> : <VolumeUpIcon className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVideoPlayPause}
              className="bg-black/70 hover:bg-black/90 p-3 rounded-xl text-white border border-white/30 backdrop-blur-sm"
            >
              {isVideoPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </motion.button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-5 py-1.5 rounded-full text-[11px] text-white/80 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE EXPERIENCE
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
        {currentStage === 0 && (
          <div className="absolute inset-0 z-10">
            <img src={imageUrl} alt={slide?.heading || "Hero"} className="w-full h-full object-cover" draggable={false} />
            {renderSnakes()}

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-30">
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-semibold tracking-tight mb-4 ${getHeadingSize()}`}
              >
                {slide?.heading}
              </motion.h1>
              <motion.p
                key={`p-${sliderIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`max-w-md mx-auto ${getDescriptionSize()}`}
              >
                {cleanText(slide?.description || "")}
              </motion.p>
            </div>
          </div>
        )}

        {currentStage === 1 && renderImpactStage()}
        {currentStage === 2 && renderVideoStage()}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full text-[10px] text-white/70">
          {currentStage === 0 && "Journey"} 
          {currentStage === 1 && "Our Impact"} 
          {currentStage === 2 && "Live Experience"}
        </div>
      </div>
    </motion.section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;