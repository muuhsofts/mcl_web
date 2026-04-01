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
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const baseURL =
    axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  const primaryColor = "#0069B4";
  const secondaryColor = "#FF3520";

  const displayValues = values.slice(0, 6);

  const getCardColor = (index: number) =>
    index % 2 === 0 ? primaryColor : secondaryColor;

  if (!displayValues.length) return null;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-14 md:py-16 bg-gray-50"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0069B4]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#FF3520]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Values
          </h2>

          <div className="h-1 w-16 mx-auto mt-3 bg-gradient-to-r from-[#0069B4] to-[#FF3520] rounded-full" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {displayValues.map((value, idx) => {
            const color = getCardColor(idx);
            const isActive = activeIndex === value.value_id;

            return (
              <motion.div
                key={value.value_id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="cursor-pointer group"
                onMouseEnter={() => setActiveIndex(value.value_id)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onCardClick(value)}
              >
                <div
                  className="relative bg-white rounded-lg overflow-hidden border border-gray-100 transition-all duration-300"
                  style={{
                    boxShadow: isActive
                      ? `0 8px 25px -10px ${color}40`
                      : undefined,
                  }}
                >
                  {/* Accent */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: color }}
                  />

                  <div className="p-5 md:p-6 flex gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                      }}
                    >
                      <img
                        src={buildImageUrl(value.img_file, baseURL)}
                        alt={value.category}
                        className="w-8 h-8 object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color }}
                      >
                        {value.category}
                      </h3>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {value.description}
                      </p>

                      <div
                        className={`mt-2 text-xs font-medium flex items-center gap-1 transition-all ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ color }}
                      >
                        Learn more
                        <ArrowRightIcon className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ValuesSection.displayName = "ValuesSection";
export default ValuesSection;
