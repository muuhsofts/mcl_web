import { memo, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import axiosInstance from "../../axios";

import { AboutSliderData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";

interface HeroSectionProps {
  data?: AboutSliderData[];
}

const HeroSection = memo(({ data = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1920);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [snakeTrigger, setSnakeTrigger] = useState(0);

  const sliderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const motionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Fetch slider data
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

  // Image Slider autoplay
  useEffect(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);

    if (sliderData.length > 0) {
      sliderIntervalRef.current = setInterval(() => {
        setSliderIndex((prev) => (prev + 1) % sliderData.length);
      }, 7000);
    }

    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [sliderData.length]);

  // Trigger motion effects every 5 seconds
  useEffect(() => {
    motionIntervalRef.current = setInterval(() => {
      setSnakeTrigger(prev => prev + 1);
    }, 5000);

    return () => {
      if (motionIntervalRef.current) clearInterval(motionIntervalRef.current);
    };
  }, []);

  const slide = sliderData[sliderIndex];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";

  const getHeadingSize = () => 
    isMobile ? "text-[2.1rem] leading-none" : 
    isTablet ? "text-5xl" : 
    "text-6xl xl:text-7xl 2xl:text-8xl";

  const getDescriptionSize = () => 
    isMobile ? "text-[15px] leading-tight" : 
    isTablet ? "text-base" : 
    "text-lg xl:text-xl";

  // Multiple Snake Animations - Many snakes!
  const snakeGroups = [
    {
      colors: ["#3b82f6", "#ef4444", "#8b00ff", "#10b981", "#06b6d4", "#f97316", "#ec489a", "#14b8a6", "#a855f7", "#eab308"],
      paths: [
        "M -100 280 Q 200 120 450 320 Q 750 180 1100 290 Q 1400 220 1600 300",
        "M 180 -80 Q 320 180 280 420 Q 450 580 620 380 Q 850 520 1050 650",
        "M 1400 180 Q 1050 80 780 250 Q 520 420 300 190 Q -50 280 50 350",
        "M 250 750 Q 480 580 650 720 Q 820 480 980 650 Q 1150 420 1300 580",
        "M -50 100 Q 300 250 550 80 Q 850 320 1200 150",
        "M 1350 650 Q 950 420 720 580 Q 380 350 80 520",
        "M 500 -50 Q 650 200 450 350 Q 300 500 550 650 Q 700 800 600 950",
        "M -100 500 Q 150 300 350 550 Q 550 800 750 500 Q 950 200 1150 450",
        "M 800 -100 Q 950 150 1150 100 Q 1350 50 1450 300 Q 1550 550 1700 400",
        "M 200 900 Q 400 750 600 850 Q 800 950 1000 750 Q 1200 550 1400 700",
      ],
    },
    {
      colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dfe6e9", "#74b9ff", "#a29bfe", "#fd79a8", "#00cec9"],
      paths: [
        "M -200 400 Q 100 200 400 450 Q 700 700 1000 400 Q 1300 100 1600 350",
        "M 300 -150 Q 500 100 400 350 Q 300 600 600 450 Q 900 300 1200 550",
        "M 1500 300 Q 1200 150 900 350 Q 600 550 300 300 Q 0 50 -200 250",
        "M -100 700 Q 200 500 500 750 Q 800 1000 1100 700 Q 1400 400 1700 650",
        "M 1000 -200 Q 1200 50 1000 300 Q 800 550 1100 700 Q 1400 850 1300 1100",
        "M 600 1200 Q 800 950 1000 1100 Q 1200 1250 1400 1000 Q 1600 750 1800 950",
        "M -300 150 Q -50 300 200 100 Q 450 -100 700 150 Q 950 400 1200 200",
        "M 400 -250 Q 600 -50 800 -200 Q 1000 -350 1200 -100 Q 1400 150 1600 -50",
        "M 1200 800 Q 1000 600 800 800 Q 600 1000 400 800 Q 200 600 0 800",
        "M -200 1000 Q 150 850 400 1050 Q 650 1250 900 950 Q 1150 650 1400 900",
      ],
    },
  ];

  const renderSnakes = () => {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Group 1 Snakes */}
        {snakeGroups[0].colors.map((color, index) => {
          const delay = index * 0.15;
          const duration = 2.5 + (index % 5) * 0.2;
          const uniqueKey = `snake1-${index}-${snakeTrigger}`;
          return (
            <motion.div key={uniqueKey} className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))" }}>
                <defs>
                  <linearGradient id={`snakeGrad1-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.05" />
                    <stop offset="40%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={snakeGroups[0].paths[index % snakeGroups[0].paths.length]}
                  fill="none"
                  stroke={`url(#snakeGrad1-${index})`}
                  strokeWidth={index % 3 === 0 ? 10 : index % 3 === 1 ? 7 : 4}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0.8, 0] }}
                  transition={{ duration, delay, ease: "easeInOut" }}
                />
              </svg>

              <motion.div
                className="absolute z-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  x: ["-10%", "5%", "25%", "45%", "65%", "85%", "105%", "120%"],
                  y: index % 4 === 0 ? ["20%", "15%", "30%", "22%", "28%", "18%", "25%", "20%"] : 
                     index % 4 === 1 ? ["65%", "70%", "55%", "68%", "60%", "72%", "58%", "65%"] :
                     index % 4 === 2 ? ["10%", "20%", "8%", "25%", "12%", "18%", "15%", "10%"] :
                     ["80%", "75%", "85%", "72%", "78%", "82%", "76%", "80%"],
                  scale: [0, 1.5, 1.2, 1.5, 0.9, 1.3, 0.7, 0],
                  opacity: [0, 1, 1, 1, 1, 0.8, 0.4, 0],
                }}
                transition={{ duration: duration + 0.5, delay, ease: "easeInOut" }}
              >
                <div className="w-12 h-12 rounded-full blur-xl" style={{ background: `radial-gradient(circle, ${color} 30%, transparent 75%)` }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: color, boxShadow: `0 0 25px ${color}` }} />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Group 2 Snakes - Even More! */}
        {snakeGroups[1].colors.map((color, index) => {
          const delay = 0.8 + index * 0.12;
          const duration = 2.8 + (index % 6) * 0.15;
          const uniqueKey = `snake2-${index}-${snakeTrigger}`;
          return (
            <motion.div key={uniqueKey} className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 12px rgba(0,0,0,0.3))" }}>
                <defs>
                  <linearGradient id={`snakeGrad2-${index}`} x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.08" />
                    <stop offset="50%" stopColor={color} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.12" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={snakeGroups[1].paths[index % snakeGroups[1].paths.length]}
                  fill="none"
                  stroke={`url(#snakeGrad2-${index})`}
                  strokeWidth={index % 3 === 0 ? 9 : index % 3 === 1 ? 6 : 5}
                  strokeLinecap="round"
                  strokeDasharray="10 5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.9, 1, 0.7, 0] }}
                  transition={{ duration, delay, ease: "easeInOut" }}
                />
              </svg>

              <motion.div
                className="absolute z-20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  x: ["110%", "95%", "75%", "55%", "35%", "15%", "-5%", "-20%"],
                  y: index % 4 === 0 ? ["30%", "25%", "40%", "32%", "38%", "28%", "35%", "30%"] : 
                     index % 4 === 1 ? ["50%", "55%", "42%", "52%", "48%", "58%", "45%", "50%"] :
                     index % 4 === 2 ? ["15%", "25%", "12%", "30%", "18%", "22%", "20%", "15%"] :
                     ["85%", "78%", "90%", "75%", "82%", "88%", "80%", "85%"],
                  scale: [0, 1.3, 0.9, 1.4, 1.1, 0.8, 1.2, 0],
                  opacity: [0, 0.9, 1, 1, 0.8, 0.6, 0.3, 0],
                }}
                transition={{ duration: duration + 0.6, delay, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-full blur-lg" style={{ background: `radial-gradient(circle, ${color} 25%, transparent 70%)` }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: color, boxShadow: `0 0 20px ${color}` }} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (sliderData.length === 0) {
    return <div className="min-h-screen bg-[#1161B9] flex items-center justify-center text-white">Loading experience...</div>;
  }

  return (
    <motion.section
      className="relative w-full overflow-hidden bg-black min-h-screen"
      style={{ opacity, scale }}
    >
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-10">
          <img 
            src={imageUrl} 
            alt={slide?.heading || "Hero"} 
            className="w-full h-full object-cover" 
            draggable={false} 
          />
          {renderSnakes()}

          {/* Slider Dots */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {sliderData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSliderIndex(idx)}
                className={`h-1 rounded-full transition-all ${idx === sliderIndex ? "bg-red-500 w-6" : "bg-white/40 w-1.5"}`}
              />
            ))}
          </div>

          {/* Text Content with Motion */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center text-white">
            <motion.h1
              key={`h1-${sliderIndex}-${snakeTrigger}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`font-semibold tracking-tight mb-4 ${getHeadingSize()}`}
            >
              {slide?.heading}
            </motion.h1>
            
            <motion.p
              key={`p-${sliderIndex}-${snakeTrigger}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`max-w-md mx-auto ${getDescriptionSize()}`}
            >
              {cleanText(slide?.description || "")}
            </motion.p>

            {/* Mwananchi Communication Limited - Motion Text repeating every 5 seconds */}
            <motion.div
              key={`mwananchi-${snakeTrigger}`}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="mt-8 md:mt-12"
            >
              <motion.p
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 0px rgba(255,255,255,0)"
                  ]
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/90 text-sm md:text-base tracking-wider uppercase border-t border-white/30 pt-6 inline-block px-8 font-medium"
              >
                Mwananchi Communication Limited
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;