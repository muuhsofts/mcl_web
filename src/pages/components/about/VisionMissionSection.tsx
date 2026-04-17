import React from "react";
import { motion } from "framer-motion";
import { EyeIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { SectionHeader, AnimatedText } from "./aboutCommon";

const VisionMissionSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader>Our Vision and Mission</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ x: -8, scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl p-8 transition-all duration-300 shadow-lg border border-gray-200/80 text-center"
        >
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-[#0A51A1]/10 mb-4">
            <EyeIcon className="w-8 h-8 text-[#0A51A1]" />
          </div>
          <AnimatedText
            text="Our Vision"
            className="text-xl font-bold text-gray-800 font-inter"
          />
          <AnimatedText
            text="To be the leading digital multimedia company in Tanzania."
            className="mt-3 text-gray-600 text-base leading-relaxed font-inter"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ x: 8, scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="bg-white rounded-2xl p-8 transition-all duration-300 shadow-lg border border-gray-200/80 text-center"
        >
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-600/10 mb-4">
            <RocketLaunchIcon className="w-8 h-8 text-red-600" />
          </div>
          <AnimatedText
            text="Our Mission"
            className="text-xl font-bold text-gray-800 font-inter"
          />
          <AnimatedText
            text="To enrich the lives of people and empower them to promote positive change in society through superior media."
            className="mt-3 text-gray-600 text-base leading-relaxed font-inter"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default VisionMissionSection;