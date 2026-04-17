import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ValueData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface ValueModalProps {
  value: ValueData;
  onClose: () => void;
}

const ValueModal = memo(({ value, onClose }: ValueModalProps) => {
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full p-10 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center p-4 bg-gradient-to-br from-[#007aff]/10 to-[#FF3520]/10"
          >
            <img 
              src={buildImageUrl(value.img_file, baseURL)} 
              alt={value.category} 
              className="w-full h-full object-contain" 
            />
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent font-sans">
            {value.category}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-sans">{value.description}</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white font-semibold hover:shadow-xl transition-shadow font-sans"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

ValueModal.displayName = 'ValueModal';
export default ValueModal;