// components/about/SubscriptionCountersSection.tsx
import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { SubscriptionData, buildImageUrl, AnimatedText } from "./aboutCommon";

interface SubscriptionItemProps {
  subscription: SubscriptionData;
  index: number;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, index }) => {
  return (
    <motion.div
      className="flex-shrink-0 w-64 mx-2 sm:mx-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 h-56 flex flex-col items-center justify-center p-4 border border-gray-100">
        {/* Enlarged logo container */}
        <div className="w-24 h-24 mb-3 flex items-center justify-center bg-gray-50 rounded-full p-2 border-2 border-[#0A51A1] shadow-md">
          {subscription.logo_img_file ? (
            <img
              src={buildImageUrl(subscription.logo_img_file) || ""}
              alt={`${subscription.category} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://via.placeholder.com/96x96?text=Logo";
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm">
              No Logo
            </div>
          )}
        </div>

        {/* Plain text from backend – slightly larger */}
        <div className="text-xl sm:text-2xl font-extrabold text-[#ed1c24] font-inter tracking-tight mb-1 text-center leading-tight">
          {subscription.total_viewers}
        </div>

        {/* Category label */}
        <AnimatedText
          text={subscription.category}
          className="text-xs sm:text-sm font-medium text-gray-500 font-inter uppercase tracking-wide text-center"
        />
      </div>
    </motion.div>
  );
};

const SubscriptionCountersSection: React.FC<{ subscriptions: SubscriptionData[] }> = ({
  subscriptions,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    }
  }, [isInView, controls]);

  if (!subscriptions.length) return null;

  // Sort by sort_order (ascending)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const orderA = (a as any).sort_order ?? 999;
    const orderB = (b as any).sort_order ?? 999;
    return orderA - orderB;
  });

  // Duplicate for seamless marquee
  const marqueeItems = [...sortedSubscriptions, ...sortedSubscriptions];
  const marqueeDuration = sortedSubscriptions.length * 1.8;

  return (
    <section
      ref={sectionRef}
      className="py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-[#0A51A1] to-[#073b75] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered heading with short red underline */}
        <div className="text-center mb-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-inter">
            Our Impact
          </h2>
          <div className="w-16 h-1 bg-red-500 mx-auto mt-2 rounded-full"></div>
        </div>
      </div>

      <div className="relative w-full mt-4 overflow-hidden group">
        <motion.div
          className="flex"
          variants={{
            animate: { x: ["0%", "-50%"] },
          }}
          initial={{ x: "0%" }}
          animate={controls}
          transition={{
            ease: "linear",
            duration: marqueeDuration,
            repeat: Infinity,
          }}
          style={{ width: "fit-content" }}
          whileHover={{ animationPlayState: "paused" }}
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

      {/* Edge fades – optional, kept for visual polish */}
      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A51A1] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A51A1] to-transparent z-10" />
      </div>
    </section>
  );
};

export default SubscriptionCountersSection;