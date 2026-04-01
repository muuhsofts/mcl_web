import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, EyeIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../../axios";

import { AboutSliderData, SubscriptionData } from "./types";
import { buildImageUrl, cleanText } from "./helpers";

interface HeroSectionProps {
  data?: AboutSliderData[];
  subscriptions?: SubscriptionData[];
}

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch slider data (only use first item)
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await axiosInstance.get("/api/slider-imgs");
        const images = Array.isArray(res.data) ? res.data : [];
        setSliderData(images);
      } catch {
        setSliderData([]);
      }
    };

    if (data.length > 0) {
      setSliderData(data);
    } else {
      fetchSlider();
    }
  }, [data]);

  // Fetch subscriptions
  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axiosInstance.get("/api/allsubscriptions");
        setSubscriptionData(res.data?.data || []);
      } catch {
        setSubscriptionData([]);
      }
    };

    if (subscriptions.length > 0) {
      setSubscriptionData(subscriptions);
    } else {
      fetchSubs();
    }
  }, [subscriptions]);

  const slide = sliderData[0];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";

  const sortedSubs = [...subscriptionData].sort(
    (a, b) => a.subscription_id - b.subscription_id
  );

  if (!slide) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <div
        className={`relative w-full overflow-hidden ${
          isMobile ? "h-[85vh]" : "h-[100vh]"
        }`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}

          <img
            src={imageUrl}
            alt={slide.heading || "Hero background"}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex items-start justify-center z-20 px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 lg:pt-28">
          <div className="max-w-4xl w-full text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight"
            >
              {slide.heading}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base md:text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto"
            >
              {cleanText(slide.description || "")}
            </motion.p>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <ChevronDownIcon className="w-6 h-6 animate-bounce" />
          </motion.div>
        )}

        {/* Our Impacts Section - Improved with smaller & cleaner fonts */}
        {sortedSubs.length > 0 && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-8 pb-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-2 text-red-500 font-bold text-xs sm:text-sm uppercase tracking-[2px]">
                  <EyeIcon className="w-4 h-4" />
                  OUR IMPACT
                </span>
              </div>

              <div className="flex flex-wrap gap-6 sm:gap-8 md:gap-10 justify-center">
                {sortedSubs.map((sub) => (
                  <div
                    key={sub.subscription_id}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 overflow-hidden border border-white/10">
                      {sub.logo_img_file ? (
                        <img
                          src={buildImageUrl(sub.logo_img_file, baseURL)}
                          alt={sub.category}
                          className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <EyeIcon className="w-7 h-7 text-white/70" />
                      )}
                    </div>

                    <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-widest mb-1 font-medium">
                      {sub.category}
                    </p>
                    <p className="text-white font-bold text-base sm:text-lg md:text-xl">
                      {sub.total_viewers}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;