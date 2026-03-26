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
      gradient: "from-[#007aff] to-[#5dade2]",
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich the lives of people and empower them to promote positive change in society through superior Media content.",
      gradient: "from-[#007aff] to-[#5dade2]",
    }
  ];

  return (
    <section ref={ref} className="py-28 relative overflow-hidden bg-gradient-to-br from-[#007aff] via-[#2980b9] to-[#1f618d]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat opacity-30" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-block px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-5"
          >
            <span className="text-sm font-bold text-white tracking-wider font-sans">OUR DIRECTION</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 font-sans"
          >
            Vision & Mission
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "8rem" } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-white to-white/50 mx-auto rounded-full"
          />
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-10">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: idx === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group"
            >
              <motion.div
                whileHover={{ rotateY: 5 }}
                className="relative bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20 h-full"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center mb-8 shadow-xl`}
                >
                  <item.icon className="w-12 h-12 text-white" />
                </motion.div>
                
                <h3 className="text-4xl font-bold text-white mb-5 font-sans">{item.title}</h3>
                <p className="text-white/90 text-lg leading-relaxed font-sans">{item.description}</p>
                
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "3rem" }}
                  className="mt-10 flex items-center gap-3 text-white/70 group-hover:text-white transition-colors"
                >
                  <div className="w-10 h-px bg-white/50" />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';
export default VisionMissionSection;