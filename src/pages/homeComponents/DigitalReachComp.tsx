import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { EyeIcon } from "@heroicons/react/24/outline";
import { SubscriptionData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface DigitalReachCompProps {
  subscriptions: SubscriptionData[];
  isMobile: boolean;
}

const DigitalReachComp = memo(({ subscriptions, isMobile }: DigitalReachCompProps) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  // Sort subscriptions by subscription_id in ascending order
  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions?.length) return [];
    return [...subscriptions].sort((a, b) => a.subscription_id - b.subscription_id);
  }, [subscriptions]);

  if (sortedSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`relative z-30 bg-gradient-to-br from-[#F5F7FA] via-[#E8F0F8] to-[#F0F4F9] ${isMobile ? 'py-8 sm:py-12' : 'py-12 sm:py-16 md:py-20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Section Header */}
          <div className={`text-center ${isMobile ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12 md:mb-16'}`}>
            <span className={`inline-block font-semibold tracking-wider uppercase text-[#0069B4] bg-white/80 backdrop-blur-sm rounded-full border border-[#0069B4]/20 shadow-sm ${isMobile ? 'text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5' : 'text-sm sm:text-base px-4 sm:px-6 py-1.5 sm:py-2'}`}>
              Digital Reach
            </span>
            <div className={`w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-[#0069B4] to-[#FF3520] mx-auto rounded-full ${isMobile ? 'mt-2 sm:mt-3' : 'mt-3 sm:mt-4'}`} />
          </div>

          {/* Cards Grid - 2 per row, all items displayed vertically */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8'}`}>
            {sortedSubscriptions.map((sub, idx) => (
              <motion.div
                key={sub.subscription_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                whileHover={!isMobile ? { y: -4, scale: 1.01 } : {}}
                onHoverStart={() => !isMobile && setActiveCard(idx)}
                onHoverEnd={() => !isMobile && setActiveCard(null)}
                className="w-full"
              >
                <motion.div 
                  className={`relative bg-white rounded-2xl overflow-hidden border border-[#0069B4]/10 hover:border-[#0069B4]/30 transition-all duration-300 group ${isMobile ? 'shadow-sm hover:shadow-md' : 'shadow-md hover:shadow-xl'}`}
                  animate={!isMobile ? {
                    boxShadow: activeCard === idx 
                      ? "0 20px 35px -12px rgba(0, 105, 180, 0.2), 0 8px 18px rgba(0,0,0,0.08)" 
                      : "0 4px 12px -6px rgba(0, 105, 180, 0.08), 0 2px 4px rgba(0,0,0,0.02)"
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {/* Left accent bar on hover */}
                  {!isMobile && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0069B4] to-[#FF3520] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  )}
                  
                  <div className={`flex flex-row items-center ${isMobile ? 'p-4 sm:p-5' : 'p-5 sm:p-6 md:p-7'}`}>
                    {/* Logo Section - Left Side */}
                    <div className={`flex-shrink-0 ${isMobile ? 'mr-4 sm:mr-5' : 'mr-5 sm:mr-6 md:mr-8'}`}>
                      <div className={`relative ${isMobile ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28'}`}>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0069B4]/10 to-[#FF3520]/5 blur-md group-hover:blur-xl transition-all duration-300" />
                        <div className="relative w-full h-full p-2 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-200 group-hover:border-[#0069B4]/30 group-hover:shadow-lg transition-all duration-300">
                          {sub.logo_img_file ? (
                            <img
                              src={buildImageUrl(sub.logo_img_file, baseURL)}
                              alt={sub.category}
                              width={isMobile ? 50 : 70}
                              height={isMobile ? 50 : 70}
                              className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <EyeIcon className={`${isMobile ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'} text-[#0069B4]/40 group-hover:text-[#0069B4] transition-colors duration-300`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section - Right Side */}
                    <div className="flex-1 min-w-0">
                      {/* Category */}
                      <h3 className={`font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 group-hover:text-[#0069B4] transition-colors duration-300 ${isMobile ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'}`}>
                        {sub.category}
                      </h3>
                      
                      {/* Viewers Counter with Icon */}
                      <div className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'mb-1 sm:mb-2' : 'mb-2 sm:mb-3'}`}>
                        <EyeIcon className={`${isMobile ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} text-[#0069B4]`} />
                        <div className={`font-black bg-gradient-to-r from-[#0069B4] to-[#FF3520] bg-clip-text text-transparent ${isMobile ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>
                          {sub.total_viewers}
                        </div>
                      </div>
                      
                      <div className={`${isMobile ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} text-gray-500 font-medium`}>
                        Total Viewers
                      </div>

                      {/* Decorative underline on hover */}
                      {!isMobile && (
                        <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-[#0069B4] to-[#FF3520] mt-3 sm:mt-4 rounded-full transition-all duration-300" />
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
});

DigitalReachComp.displayName = 'DigitalReachComp';
export default DigitalReachComp;