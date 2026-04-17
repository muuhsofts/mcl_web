// components/about/SubscriptionCountersSection.tsx
import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { SubscriptionData, buildImageUrl, SectionHeader, AnimatedText } from "./aboutCommon";

// Helper: convert string like "20.4K", "2.9 Million+", "25 Million+" to a numeric value for CountUp
const parseCountValue = (value: string): number => {
  if (!value) return 0;
  const lower = value.toLowerCase().trim();
  const clean = lower.replace(/\+/g, "").trim();
  if (clean.includes("million")) {
    const num = parseFloat(clean.replace("million", "").trim());
    return isNaN(num) ? 0 : num * 1_000_000;
  }
  if (clean.includes("k")) {
    const num = parseFloat(clean.replace("k", "").trim());
    return isNaN(num) ? 0 : num * 1_000;
  }
  if (clean.includes("–") || clean.includes("-")) {
    return 0;
  }
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

interface SubscriptionItemProps {
  subscription: SubscriptionData;
  index: number;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, index }) => {
  const totalViewersStr = subscription.total_viewers;
  const numericValue = parseCountValue(totalViewersStr);
  const isRange = totalViewersStr.includes("–") || totalViewersStr.includes("-");

  return (
    <motion.div
      className="flex-shrink-0 w-56 mx-2 sm:mx-3"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 h-48 flex flex-col items-center justify-center p-3 border border-gray-100">
        {/* Logo - smaller */}
        <div className="w-14 h-14 mb-2 flex items-center justify-center bg-gray-50 rounded-full p-1.5 border-2 border-[#0A51A1] shadow-sm">
          {subscription.logo_img_file ? (
            <img
              src={buildImageUrl(subscription.logo_img_file) || ""}
              alt={`${subscription.category} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://via.placeholder.com/56x56?text=Logo";
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-[10px]">
              No Logo
            </div>
          )}
        </div>

        {/* CountUp number - smaller font */}
        <div className="text-xl sm:text-2xl font-extrabold text-[#ed1c24] font-inter tracking-tight mb-0.5 text-center leading-tight">
          {isRange ? (
            <span className="text-base sm:text-lg">{totalViewersStr}</span>
          ) : numericValue > 0 ? (
            <CountUp
              start={0}
              end={numericValue}
              duration={2}
              formattingFn={(value: number) => {
                if (totalViewersStr.toLowerCase().includes("million")) {
                  const millions = value / 1_000_000;
                  return `${millions.toFixed(1)}M+`;
                }
                if (totalViewersStr.toLowerCase().includes("k")) {
                  const thousands = value / 1_000;
                  return `${thousands.toFixed(1)}K`;
                }
                return new Intl.NumberFormat("en-US").format(value);
              }}
              enableScrollSpy={true}
              scrollSpyOnce={true}
            />
          ) : (
            <span className="text-base sm:text-lg">{totalViewersStr}</span>
          )}
        </div>

        {/* Category - smaller, lighter */}
        <AnimatedText
          text={subscription.category}
          className="text-[11px] sm:text-xs font-medium text-gray-500 font-inter uppercase tracking-wide text-center"
        />
      </div>
    </motion.div>
  );
};

const SubscriptionCountersSection: React.FC<{ subscriptions: SubscriptionData[] }> = ({
  subscriptions,
}) => {
  if (!subscriptions.length) return null;

  // Sort by sort_order (ascending)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const orderA = (a as any).sort_order ?? 999;
    const orderB = (b as any).sort_order ?? 999;
    return orderA - orderB;
  });

  // Duplicate array for seamless marquee
  const marqueeItems = [...sortedSubscriptions, ...sortedSubscriptions];
  const marqueeDuration = sortedSubscriptions.length * 2.5; // faster marquee

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#0A51A1] to-[#073b75] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SectionHeader already includes underline and proper spacing */}
        <SectionHeader>Our Impact</SectionHeader>
        {/* Extra spacing after header */}
        <div className="mt-4"></div>
      </div>

      {/* Horizontal Marquee */}
      <div className="relative w-full mt-8 overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: marqueeDuration,
            repeat: Infinity,
          }}
          style={{ width: "fit-content" }}
        >
          {marqueeItems.map((sub, idx) => (
            <SubscriptionItem
              key={`${sub.subscription_id}-${idx}`}
              subscription={sub}
              index={idx % sortedSubscriptions.length}
            />
          ))}
        </motion.div>
      </div>

      {/* Subtle fade effect on edges (optional) */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A51A1] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A51A1] to-transparent z-10" />
      </div>
    </section>
  );
};

export default SubscriptionCountersSection;