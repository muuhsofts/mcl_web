import { memo, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SparklesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { MwananchiAboutData } from "./types";
import { cleanText } from "./helpers";

interface AboutSectionProps {
  content: MwananchiAboutData | null;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const AboutSection = memo(({ content }: AboutSectionProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const paragraphs = useMemo(() => {
    if (!content?.description) return [];

    return content.description
      .split(/\n\s*\n/)
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 2);
  }, [content?.description]);

  if (!content) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="about-title"
      className="relative py-10 md:py-14 overflow-hidden bg-gradient-to-br from-[#007aff]/5 via-white to-[#FF3520]/5"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-80 h-80 bg-[#007aff]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-80 h-80 bg-[#FF3520]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#007aff] shadow-lg mb-4"
          >
            <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs font-bold uppercase text-white">
              About Us
            </span>
          </motion.div>

          <motion.h2
            id="about-title"
            className="text-4xl md:text-5xl font-black text-gray-900"
          >
            {content.category}
          </motion.h2>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="space-y-6"
        >
          {paragraphs.map((paragraph, index) => (
            <motion.div
              key={`${paragraph.slice(0, 20)}-${index}`}
              variants={itemVariants}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10 flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-5 h-5 text-[#007aff]" />
              </div>

              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {paragraph}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
    </section>
  );
});

AboutSection.displayName = "AboutSection";
export default AboutSection;