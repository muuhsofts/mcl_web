// components/about/OurValuesSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { ValueData, buildImageUrl, SectionHeader, AnimatedText } from "./aboutCommon";

interface OurValuesSectionProps {
  values: ValueData[];
  onCardClick: (value: ValueData) => void;
}

const OurValuesSection: React.FC<OurValuesSectionProps> = ({ values, onCardClick }) => {
  if (!values.length) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader>Our Core Values</SectionHeader>

        {/* Grid: 1 column on mobile, 2 columns on tablet and up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-8">
          {values.map((value, index) => {
            // Alternate background colors: even index -> light blue gradient, odd -> light gray/white gradient
            const isEven = index % 2 === 0;
            const bgClass = isEven
              ? "bg-gradient-to-br from-blue-50 to-indigo-50"
              : "bg-gradient-to-br from-gray-50 to-white";
            const borderHoverClass = isEven
              ? "hover:border-blue-300"
              : "hover:border-gray-300";
            const iconBgClass = isEven
              ? "bg-gradient-to-br from-blue-100 to-indigo-200"
              : "bg-gradient-to-br from-gray-100 to-gray-200";
            const textColorClass = isEven ? "text-blue-900" : "text-gray-800";

            return (
              <motion.button
                key={value.value_id}
                onClick={() => onCardClick(value)}
                className={`group flex flex-col items-center text-center ${bgClass} rounded-xl p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-md border-2 border-gray-100 ${borderHoverClass} cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Icon container with matching gradient */}
                <div className={`w-16 h-16 mb-2 flex items-center justify-center ${iconBgClass} rounded-full p-2 transition-transform duration-300 group-hover:scale-105`}>
                  <img
                    src={buildImageUrl(value.img_file) || "https://via.placeholder.com/64x64?text=Icon"}
                    alt={value.category}
                    width="64"
                    height="64"
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/64x64?text=Icon")
                    }
                    loading="lazy"
                  />
                </div>

                {/* Value name with matching text color */}
                <AnimatedText
                  text={value.category}
                  className={`text-base md:text-lg font-bold ${textColorClass} font-inter`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurValuesSection;