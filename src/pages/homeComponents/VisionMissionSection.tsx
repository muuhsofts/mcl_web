import { memo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EyeIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const VisionMissionSection = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania.",
      gradient: "from-[#0069B4] via-[#0088e6] to-[#4fb3ff]",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich lives and empower positive change through exceptional media content.",
      gradient: "from-[#0069B4] via-[#0088e6] to-[#4fb3ff]",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden bg-gradient-to-br from-[#001a33] via-[#003366] to-[#0069B4]"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_1px)] bg-[length:50px_50px] opacity-10" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        
        {/* Small elegant badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-xs font-semibold tracking-[3px] text-white/90">OUR DIRECTION</span>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group"
            >
              <div className="relative h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 transition-all duration-500 hover:border-white/30 hover:shadow-2xl">
                
                {/* Icon Container - Using your company color */}
                <div className="mb-8">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500`}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-semibold text-white mb-5 tracking-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-white/80 text-[17px] leading-relaxed font-light">
                  {item.description}
                </p>

                {/* Bottom accent line - brand color accent */}
                <div className="absolute bottom-10 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#0069B4]/60 to-transparent group-hover:via-[#4fb3ff] transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';
export default VisionMissionSection;