import { memo, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ValueData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface ValuesSectionProps {
  values: ValueData[];
  onCardClick: (value: ValueData) => void;
}

const ValuesSection = memo(({ values, onCardClick }: ValuesSectionProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  
  // Brand colors only - FF3520 (orange) and 0069B4 (blue)
  const primaryColor = "#0069B4";
  const secondaryColor = "#FF3520";
  
  const displayValues = values.slice(0, 6);
  
  // Alternate colors between primary and secondary
  const getCardColor = (index: number) => {
    return index % 2 === 0 ? primaryColor : secondaryColor;
  };

  if (!displayValues.length) return null;

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-gray-50">
      {/* Background decorative elements - subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#0069B4]/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF3520]/10 to-transparent rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 font-sans"
          >
            Our Values
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-[#0069B4] to-[#FF3520] mx-auto rounded-full mt-4"
          />
        </motion.div>
        
        {/* 2 Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayValues.map((value, idx) => {
            const cardColor = getCardColor(idx);
            const isActive = activeIndex === value.value_id;
            
            return (
              <motion.div
                key={value.value_id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setActiveIndex(value.value_id)}
                onMouseLeave={() => setActiveIndex(null)}
                className="group cursor-pointer h-full"
                onClick={() => onCardClick(value)}
              >
                <motion.div 
                  className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full border border-gray-100"
                  animate={isActive ? {
                    borderColor: cardColor,
                    boxShadow: `0 10px 30px -10px ${cardColor}30`,
                  } : {}}
                >
                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                    style={{ backgroundColor: cardColor }}
                  />
                  
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      {/* Icon Container */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex-shrink-0"
                      >
                        <div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300"
                          style={{ 
                            background: `linear-gradient(135deg, ${cardColor}10, ${cardColor}05)`,
                            border: `1px solid ${cardColor}20`
                          }}
                        >
                          <img 
                            src={buildImageUrl(value.img_file, baseURL)} 
                            alt={value.category} 
                            className="w-10 h-10 object-contain" 
                          />
                        </div>
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-bold mb-2 font-sans transition-colors duration-300"
                          style={{ color: cardColor }}
                        >
                          {value.category}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed font-sans text-sm">
                          {value.description}
                        </p>
                        
                        {/* Learn More Link */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3"
                        >
                          <span 
                            className="text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
                            style={{ color: cardColor }}
                          >
                            Learn more
                            <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ValuesSection.displayName = 'ValuesSection';
export default ValuesSection;