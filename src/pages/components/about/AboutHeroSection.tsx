// components/about/AboutHeroSection.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { AboutSliderData, buildImageUrl, bounceVariants, AnimatedText } from "./aboutCommon";

const AboutHeroSection: React.FC<{ data: AboutSliderData[] }> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % data.length),
      15000
    );
    return () => clearInterval(interval);
  }, [data.length]);

  if (!data.length) return null;

  const activeSlide = data[currentSlide];
  const imageSrc =
    buildImageUrl(activeSlide.home_img) ||
    "https://via.placeholder.com/1920x1080?text=Image+Missing";

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
          <motion.img
            src={imageSrc}
            alt={activeSlide.heading || "MCL background image"}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 8, ease: "easeOut" } }}
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/1920x1080?text=Image+Load+Error")
            }
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col h-full justify-end pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <AnimatedText
              key={`h1-${currentSlide}`}
              text={activeSlide.heading || ""}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 font-inter break-words"
              variants={bounceVariants}
              perWord={false}
            />
            {activeSlide.description && (
              <AnimatedText
                key={`p-${currentSlide}`}
                text={activeSlide.description}
                className="text-base sm:text-lg font-normal text-gray-200 mb-4 font-inter break-words leading-[1.1]"
                variants={bounceVariants}
                perWord={false}
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.7 } }}
              className="flex gap-4 mb-8"
            >
              <button
                onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
                className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-7 h-7" />
              </button>
              <button
                onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
                className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-7 h-7" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 1 } }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40"
      >
        <ChevronDownIcon className="w-6 h-6 text-white animate-bounce" />
      </motion.div>
    </section>
  );
};

export default AboutHeroSection;