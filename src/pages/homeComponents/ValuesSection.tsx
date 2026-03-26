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
  
  const colorSchemes = [
    { bg: "#007aff", light: "from-[#007aff]/20 to-transparent", text: "#007aff", gradient: "from-[#007aff] to-[#5dade2]" },
    { bg: "#FF3520", light: "from-[#FF3520]/20 to-transparent", text: "#FF3520", gradient: "from-[#FF3520] to-[#ff6b4a]" },
    { bg: "#10B981", light: "from-[#10B981]/20 to-transparent", text: "#10B981", gradient: "from-[#10B981] to-[#34d399]" },
    { bg: "#8B5CF6", light: "from-[#8B5CF6]/20 to-transparent", text: "#8B5CF6", gradient: "from-[#8B5CF6] to-[#a78bfa]" },
    { bg: "#F59E0B", light: "from-[#F59E0B]/20 to-transparent", text: "#F59E0B", gradient: "from-[#F59E0B] to-[#fbbf24]" },
    { bg: "#EC4899", light: "from-[#EC4899]/20 to-transparent", text: "#EC4899", gradient: "from-[#EC4899] to-[#f472b6]" },
  ];
  
  const displayValues = values.slice(0, 6);
  const leftColumnValues = displayValues.filter((_, i) => i % 2 === 0);
  const rightColumnValues = displayValues.filter((_, i) => i % 2 === 1);

  if (!displayValues.length) return null;

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-gradient-to-br from-[#007aff]/5 via-[#FF3520]/5 to-[#10B981]/5">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#007aff]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF3520]/20 to-transparent rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-black text-gray-900 mb-5 font-sans tracking-tight"
          >
            Our Values
          </motion.h2>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="space-y-10">
            {leftColumnValues.map((value, idx) => {
              const scheme = colorSchemes[(idx * 2) % colorSchemes.length];
              const isActive = activeIndex === value.value_id;
              
              return (
                <motion.div
                  key={value.value_id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ x: 15 }}
                  onMouseEnter={() => setActiveIndex(value.value_id)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="group cursor-pointer"
                  onClick={() => onCardClick(value)}
                >
                  <div className="relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border-l-4" style={{ borderLeftColor: scheme.bg }}>
                    <div className="flex items-start gap-6">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center overflow-hidden shadow-md"
                        style={{ background: `linear-gradient(135deg, ${scheme.bg}20, ${scheme.bg}05)` }}
                      >
                        <img 
                          src={buildImageUrl(value.img_file, baseURL)} 
                          alt={value.category} 
                          className="w-10 h-10 object-contain" 
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 font-sans" style={{ color: scheme.bg }}>{value.category}</h3>
                        <p className="text-gray-600 leading-relaxed font-sans">
                          {value.description}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                          className="mt-4"
                        >
                          <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: scheme.bg }}>
                            Learn more about this value
                            <ArrowRightIcon className="w-3 h-3" />
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="space-y-10 mt-8 lg:mt-16">
            {rightColumnValues.map((value, idx) => {
              const scheme = colorSchemes[(idx * 2 + 1) % colorSchemes.length];
              const isActive = activeIndex === value.value_id;
              
              return (
                <motion.div
                  key={value.value_id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ x: -15 }}
                  onMouseEnter={() => setActiveIndex(value.value_id)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="group cursor-pointer"
                  onClick={() => onCardClick(value)}
                >
                  <div className="relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border-r-4" style={{ borderRightColor: scheme.bg }}>
                    <div className="flex items-start gap-6 flex-row-reverse text-right">
                      <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-bl flex items-center justify-center overflow-hidden shadow-md"
                        style={{ background: `linear-gradient(225deg, ${scheme.bg}20, ${scheme.bg}05)` }}
                      >
                        <img 
                          src={buildImageUrl(value.img_file, baseURL)} 
                          alt={value.category} 
                          className="w-10 h-10 object-contain" 
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 font-sans" style={{ color: scheme.bg }}>{value.category}</h3>
                        <p className="text-gray-600 leading-relaxed font-sans">
                          {value.description}
                        </p>
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 }}
                          className="mt-4 flex justify-end"
                        >
                          <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: scheme.bg }}>
                            Learn more about this value
                            <ArrowRightIcon className="w-3 h-3" />
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="relative mt-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-full"
        />
      </div>
    </section>
  );
});

ValuesSection.displayName = 'ValuesSection';
export default ValuesSection;