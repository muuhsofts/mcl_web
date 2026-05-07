import React from "react";
import { motion, Variants } from "framer-motion";
import { EyeIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const VisionMissionSection: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60, rotateY: 10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12"
    >
      {/* Header with soft gradient text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
          Our Compass
        </h1>
        <div className="mt-3 h-1 w-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mx-auto" />
        <p className="mt-5 text-gray-500 text-lg max-w-2xl mx-auto">
          The principles that guide every story we tell.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Vision Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{
            scale: 1.02,
            rotateY: 4,
            transition: { type: "spring", stiffness: 300 },
          }}
          className="group relative bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400" />

          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm mb-6 group-hover:scale-105 transition-transform duration-300">
              <EyeIcon className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">Vision</h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              To be Tanzania’s most innovative digital media house — where
              technology meets storytelling to inspire a generation.
            </p>

            <div className="mt-6 text-sm font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              ✦ The horizon we chase ✦
            </div>
          </div>
        </motion.div>

        {/* Mission Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{
            scale: 1.02,
            rotateY: -4,
            transition: { type: "spring", stiffness: 300 },
          }}
          className="group relative bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400" />

          <div className="p-8 text-center">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 shadow-sm mb-6 group-hover:scale-105 transition-transform duration-300">
              <RocketLaunchIcon className="w-10 h-10 text-purple-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">Mission</h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              To empower Tanzanians with authentic, impactful media that
              drives positive change, amplifies voices, and builds
              tomorrow’s leaders.
            </p>

            <div className="mt-6 text-sm font-medium text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
              ✦ Our daily fuel ✦
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-sm" />
    </motion.div>
  );
};

export default VisionMissionSection;