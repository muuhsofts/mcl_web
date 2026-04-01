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

interface LogoDetails {
  size: string;
  bytes: number;
  filename: string;
  width: number;
  height: number;
  dimensions: string;
}

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Store logo file sizes with dimensions
  const [logoDetails, setLogoDetails] = useState<Record<number, LogoDetails>>({});

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Fetch detailed logo file information with dimensions
  useEffect(() => {
    const fetchLogoDetails = async () => {
      const details: Record<number, LogoDetails> = {};

      await Promise.all(
        subscriptionData.map(async (sub) => {
          if (!sub.logo_img_file) return;

          try {
            const url = buildImageUrl(sub.logo_img_file, baseURL);
            
            // Get filename from path
            const filename = sub.logo_img_file.split('/').pop() || sub.logo_img_file;

            // Fetch image blob
            const res = await axiosInstance.get(url, {
              responseType: "blob",
            });

            const bytes = res.data.size;
            const kb = (bytes / 1024).toFixed(1);
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            
            // Format size nicely - show MB if > 1MB, otherwise KB
            const formattedSize = bytes > 1024 * 1024 ? `${mb} MB` : `${kb} KB`;

            // Get image dimensions by creating an Image object
            let width = 0;
            let height = 0;
            let dimensions = "N/A";
            
            try {
              const imageUrl = URL.createObjectURL(res.data);
              const img = new Image();
              
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  width = img.width;
                  height = img.height;
                  dimensions = `${width} x ${height} px`;
                  URL.revokeObjectURL(imageUrl);
                  resolve(true);
                };
                img.onerror = () => {
                  URL.revokeObjectURL(imageUrl);
                  reject(new Error("Failed to load image"));
                };
                img.src = imageUrl;
              });
            } catch (dimError) {
              console.warn(`Could not get dimensions for ${filename}:`, dimError);
            }

            details[sub.subscription_id] = {
              size: formattedSize,
              bytes: bytes,
              filename: filename,
              width: width,
              height: height,
              dimensions: dimensions
            };
          } catch (error) {
            details[sub.subscription_id] = {
              size: "N/A",
              bytes: 0,
              filename: sub.logo_img_file.split('/').pop() || "unknown",
              width: 0,
              height: 0,
              dimensions: "N/A"
            };
          }
        })
      );

      setLogoDetails(details);
    };

    if (subscriptionData.length > 0) {
      fetchLogoDetails();
    }
  }, [subscriptionData, baseURL]);

  // Helper function to check if dimensions are too small (less than 100px)
  const isDimensionTooSmall = (width: number, height: number): boolean => {
    return width > 0 && height > 0 && (width < 100 || height < 100);
  };

  const slide = sliderData[0];
  const imageUrl = slide?.home_img ? buildImageUrl(slide.home_img, baseURL) : "";

  const sortedSubs = [...subscriptionData].sort(
    (a, b) => a.subscription_id - b.subscription_id
  );

  if (!slide) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <div className={`relative w-full overflow-hidden ${isMobile ? "h-[85vh]" : "h-[100vh]"}`}>
        
        {/* Background Image */}
        <div className="absolute inset-0">
          {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}

          <img
            src={imageUrl}
            alt={slide.heading || "Hero background"}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />

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

        {/* Impact Section */}
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
                {sortedSubs.map((sub) => {
                  const details = logoDetails[sub.subscription_id];
                  const isTooSmall = details && isDimensionTooSmall(details.width, details.height);
                  
                  return (
                    <div
                      key={sub.subscription_id}
                      className="flex flex-col items-center text-center group relative"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 overflow-hidden border ${
                        isTooSmall ? 'border-yellow-500/50 ring-1 ring-yellow-500' : 'border-white/10'
                      }`}>
                        {sub.logo_img_file ? (
                          <img
                            src={buildImageUrl(sub.logo_img_file, baseURL)}
                            alt={sub.category}
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <EyeIcon className="w-7 h-7 text-white/70" />
                        )}
                      </div>

                      {/* File size display with warning for small dimensions */}
                      {details && details.size !== "N/A" && (
                        <div className="group relative">
                          <p className={`text-[9px] mb-1 cursor-help font-mono ${
                            isTooSmall ? 'text-yellow-400' : 'text-white/40'
                          }`}>
                            {details.size}
                            {isTooSmall && " ⚠️"}
                          </p>
                          
                          {/* Tooltip with full details including dimensions */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-black/95 backdrop-blur-sm rounded-lg text-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-xl border border-white/10">
                            <div className="flex flex-col gap-1.5">
                              <div className="font-semibold text-yellow-400 border-b border-white/20 pb-1 mb-1">
                                Logo File Details
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                <span className="text-white/60">📁 Filename:</span>
                                <span className="font-mono text-white/90">{details.filename}</span>
                                
                                <span className="text-white/60">📊 File Size:</span>
                                <span className="font-mono text-white/90">{details.size}</span>
                                
                                <span className="text-white/60">📐 Dimensions:</span>
                                <span className={`font-mono ${details.width < 100 || details.height < 100 ? 'text-yellow-400 font-semibold' : 'text-white/90'}`}>
                                  {details.dimensions}
                                  {(details.width < 100 || details.height < 100) && " ⚠️"}
                                </span>
                                
                                <span className="text-white/60">🔢 Bytes:</span>
                                <span className="font-mono text-white/90">{details.bytes.toLocaleString()}</span>
                              </div>
                              {(details.width < 100 || details.height < 100) && (
                                <div className="mt-1 pt-1 border-t border-yellow-500/30 text-yellow-400 text-[10px]">
                                  ⚠️ Logo dimensions are smaller than recommended (min 100px)
                                </div>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-black/95 rotate-45 border-r border-b border-white/10"></div>
                          </div>
                        </div>
                      )}

                      {(!details || details.size === "N/A") && (
                        <p className="text-[9px] text-white/20 mb-1">—</p>
                      )}

                      <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-widest mb-1 font-medium">
                        {sub.category}
                      </p>

                      <p className="text-white font-bold text-base sm:text-lg md:text-xl">
                        {sub.total_viewers}
                      </p>
                    </div>
                  );
                })}
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