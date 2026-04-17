import { memo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EyeIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const VisionMissionSection = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania.",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description:
        "To enrich lives and empower positive change through exceptional media content.",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[40vh] flex items-center bg-[#0069B4]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0069B4] via-[#005a9e] to-[#004a85]" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[length:40px_40px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full py-8">
        <div className="grid md:grid-cols-2 gap-5 lg:gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="h-full rounded-2xl p-5 bg-white/10 backdrop-blur-md border border-white/15 shadow-md hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 mb-4 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">
                  {item.title}
                </h3>

                <p className="text-white/80 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = "VisionMissionSection";
export default VisionMissionSection;

