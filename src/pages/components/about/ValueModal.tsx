import React from "react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ValueData, buildImageUrl } from "./aboutCommon";

interface ValueModalProps {
  value: ValueData;
  onClose: () => void;
}

const ValueModal: React.FC<ValueModalProps> = ({ value, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-purple-50">
            <img
              src={buildImageUrl(value.img_file) || "https://via.placeholder.com/64"}
              alt={value.category}
              className="w-12 h-12 object-contain"
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{value.category}</h3>
        <p className="text-gray-600 leading-relaxed">{value.description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ValueModal;