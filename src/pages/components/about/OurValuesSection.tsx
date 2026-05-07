import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { ValueData, buildImageUrl } from "./aboutCommon";
import ValueModal from "./ValueModal";

interface OurValuesSectionProps {
  values: ValueData[];
}

const OurValuesSection: React.FC<OurValuesSectionProps> = ({ values }) => {
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
  };

  if (!values.length) return null;

  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12"
      >
        {/* Header – without the subtitle line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <HeartIcon className="w-8 h-8 text-rose-500" />
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
              Our Values
            </h1>
          </div>
          <div className="mt-3 h-1 w-32 bg-gradient-to-r from-rose-300 to-purple-300 rounded-full mx-auto" />
          {/* Subtitle removed – as requested */}
        </motion.div>

        {/* Grid: 2 cards per row, each card horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {values.map((value) => (
            <motion.div
              key={value.value_id}
              variants={cardVariants}
              whileHover={{
                scale: 1.01,
                y: -4,
                transition: { type: "spring", stiffness: 300 },
              }}
              onClick={() => setSelectedValue(value)}
              className="group relative bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-row items-stretch"
            >
              {/* Top accent line (still present, but now horizontal card) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-purple-400 z-10" />

              {/* Left side – Icon/Image (square, fixed width) */}
              <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 p-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={buildImageUrl(value.img_file) || "https://via.placeholder.com/64x64?text=Icon"}
                    alt={value.category}
                    className="w-12 h-12 object-contain"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/64x64?text=Icon")
                    }
                  />
                </div>
              </div>

              {/* Right side – Content */}
              <div className="flex-grow p-5 text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.category}</h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {value.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-3 text-xs font-medium text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✦ Learn more ✦
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative element (kept for consistency) */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-rose-200 to-purple-200 rounded-full blur-sm" />
      </motion.div>

      {selectedValue && (
        <ValueModal value={selectedValue} onClose={() => setSelectedValue(null)} />
      )}
    </>
  );
};

export default OurValuesSection;