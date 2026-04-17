import React from "react";
import { motion } from "framer-motion";
import { MwananchiAboutData, containerVariants, AnimatedText } from "./aboutCommon";

const AboutMwananchiSection: React.FC<{ content: MwananchiAboutData | null }> = ({
  content,
}) => {
  if (!content) return null;
  const paragraphs = content.description.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <AnimatedText
              text="About"
              className="text-base font-semibold text-red-600 uppercase tracking-wider font-inter text-center lg:text-left"
            />
            <AnimatedText
              text={content.category}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter text-center lg:text-left"
            />
            <motion.div
              className="mt-8 space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {paragraphs.map((p, i) => (
                <AnimatedText
                  key={`para-${i}`}
                  text={p}
                  className="text-lg text-gray-600 leading-relaxed font-inter"
                />
              ))}
            </motion.div>
          </motion.div>
          {content.video_link && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-white">
                <iframe
                  src={content.video_link}
                  title={`About ${content.category}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutMwananchiSection;