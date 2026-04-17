import React from "react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ValueData, buildImageUrl, AnimatedText } from "./aboutCommon";

interface ValueModalProps {
  value: ValueData;
  onClose: () => void;
}

const ValueModal: React.FC<ValueModalProps> = ({ value, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center"
      initial={{ scale: 0.9, x: -50 }}
      animate={{ scale: 1, x: 0 }}
      exit={{ scale: 0.9, x: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <img
        src={buildImageUrl(value.img_file) || "https://via.placeholder.com/128x128?text=Icon"}
        alt={value.category}
        width="128"
        height="128"
        className="w-32 h-32 object-contain mb-6 mx-auto"
        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/128x128?text=Icon")}
      />
      <AnimatedText
        text={value.category}
        className="text-2xl font-bold text-blue-900 font-inter mb-4"
      />
      <AnimatedText
        text={value.description || "No description available for this value."}
        className="text-gray-600 leading-relaxed font-inter"
      />
    </motion.div>
  </motion.div>
);

export default ValueModal;