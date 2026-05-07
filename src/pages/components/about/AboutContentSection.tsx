// components/about/AboutContentSection.tsx
import React from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { InformationCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { AboutCardData, buildImageUrl, lineVariants, AnimatedText } from "./aboutCommon";

const cardVariants: Variants = {
  offscreen: { x: -50, opacity: 0 },
  onscreen: { x: 0, opacity: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } },
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const AboutContentSection: React.FC<{ cards: AboutCardData[] }> = ({ cards }) => {
  if (!cards.length) {
    return (
      <section className="py-4 sm:py-6 lg:py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-700">
          <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
          <AnimatedText
            text="No content highlights found at this time."
            className="mt-4 text-lg font-inter"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered heading with short underline */}
        <div className="text-center mb-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 font-inter">
            Discover More
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-2 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => {
            const hasHtml = /<[a-z][\s\S]*>/i.test(card.description);
            let previewText = "";
            if (hasHtml) {
              const plain = stripHtml(card.description);
              previewText = plain.length > 120 ? plain.substring(0, 120) + "..." : plain;
            } else {
              previewText = card.description.length > 120 ? card.description.substring(0, 120) + "..." : card.description;
            }

            return (
              <motion.div
                key={`${card.type}-${card.id}`}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-md border border-gray-200"
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative bg-gray-100 flex items-center justify-center p-3" style={{ minHeight: "280px" }}>
                  <img
                    width="600"
                    height="400"
                    className="w-full h-auto max-h-64 object-contain transition-transform duration-300 group-hover:scale-105"
                    src={buildImageUrl(card.imageUrl) || "https://via.placeholder.com/600x400?text=Image+Missing"}
                    alt={card.title}
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error")}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  <AnimatedText
                    text={card.type}
                    className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-inter z-10 shadow-md"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <AnimatedText text={card.title} className="text-lg font-bold text-gray-800 font-inter line-clamp-2" />
                  {hasHtml ? (
                    <div className="mt-2 text-gray-600 text-sm font-normal leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: previewText }} />
                  ) : (
                    <AnimatedText text={previewText} className="mt-2 text-gray-600 text-sm font-normal flex-grow leading-relaxed font-inter line-clamp-3" />
                  )}
                  <motion.div
                    variants={lineVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="mt-4"
                  >
                    <Link
                      to={card.linkUrl}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 group-hover:text-red-600 transition-colors duration-300 font-inter"
                    >
                      <AnimatedText text="Find out more" className="inline-flex items-center" />
                      <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutContentSection;