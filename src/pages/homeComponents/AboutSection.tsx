import { memo, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SparklesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { MwananchiAboutData } from "./types";
import { cleanText } from "./helpers";

interface AboutSectionProps {
  content: MwananchiAboutData | null;
}

const AboutSection = memo(({ content }: AboutSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  if (!content) return null;

  const paragraphs = useMemo(() => 
    content.description
      .split(/\n\s*\n/)
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 2)
  , [content.description]);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden bg-gradient-to-br from-[#007aff]/5 via-white to-[#FF3520]/5">
      {/* Background animated blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#007aff]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF3520]/10 rounded-full blur-3xl"
        />
      </div>
      
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007aff] shadow-lg mb-6"
          >
            <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-white font-sans">About Us</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-gray-900 leading-tight font-sans"
          >
            {content.category}
          </motion.h2>
        </motion.div>

        {/* Plain Content - No Cards, Just Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          {paragraphs.map((paragraph, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
              className="flex items-start gap-4"
            >
              {/* Icon without card */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10 flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-[#007aff]" />
                </div>
              </div>
              
              {/* Text content - No Card */}
              <div className="flex-1">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                  {paragraph}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Subtle gradient separation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/50 to-transparent pointer-events-none" />
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;