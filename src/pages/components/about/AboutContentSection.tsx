// components/about/AboutContentSection.tsx
import React from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { InformationCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { AboutCardData, buildImageUrl, lineVariants, SectionHeader, AnimatedText } from "./aboutCommon";

const cardVariants: Variants = {
  offscreen: { x: -50, opacity: 0 },
  onscreen: { x: 0, opacity: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } },
};

const AboutContentSection: React.FC<{ cards: AboutCardData[] }> = ({ cards }) => {
  if (!cards.length)
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-700">
          <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
          <AnimatedText
            text="No content highlights found at this time."
            className="mt-4 text-lg font-inter"
          />
        </div>
      </section>
    );

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader>Discover More</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={`${card.type}-${card.id}`}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 shadow-md border border-gray-200"
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Image container - ENLARGED, uncropped, full image visible */}
              <div className="relative bg-gray-100 flex items-center justify-center p-3" style={{ minHeight: "360px" }}>
                <img
                  width="600"
                  height="400"
                  className="w-full h-auto max-h-80 object-contain transition-transform duration-300 group-hover:scale-105"
                  src={
                    buildImageUrl(card.imageUrl) ||
                    "https://via.placeholder.com/600x400?text=Image+Missing"
                  }
                  alt={card.title}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/600x400?text=Image+Error")
                  }
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <AnimatedText
                  text={card.type}
                  className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-inter z-10 shadow-md"
                />
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col flex-grow">
                <AnimatedText
                  text={card.title}
                  className="text-xl font-bold text-gray-800 font-inter line-clamp-2"
                />
                <AnimatedText
                  text={
                    card.description.length > 120
                      ? `${card.description.substring(0, 120)}...`
                      : card.description
                  }
                  className="mt-3 text-gray-600 text-base font-normal flex-grow leading-relaxed font-inter line-clamp-3"
                />
                <motion.div
                  variants={lineVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  className="mt-6"
                >
                  <Link
                    to={card.linkUrl}
                    className="inline-flex items-center gap-2 text-base font-bold text-blue-900 group-hover:text-red-600 transition-colors duration-300 font-inter"
                  >
                    <AnimatedText
                      text="Find out more"
                      className="inline-flex items-center"
                    />
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutContentSection;