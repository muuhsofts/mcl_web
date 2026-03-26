import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  LinkIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES & UTILITIES ---
interface SustainabilityData {
  sustain_id: number;
  sustain_category: string;
  description: string;
  weblink: string | null;
  sustain_pdf_file: string | null;
  sustain_image_file: string | null;
}

const getFullUrl = (path: string | null): string => {
  if (!path) return "";
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

// --- UI COMPONENTS ---

// Image Modal
const ImageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
}> = ({ isOpen, onClose, imageSrc, altText }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <img
              src={imageSrc}
              alt={altText}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={onClose}
              className="absolute -top-4 -right-4 bg-[#ed1c24] text-white rounded-full p-2 hover:bg-[#003459] transition-colors shadow-lg"
              aria-label="Close image view"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// FormattedDescription Helper
const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3 last:mb-0 leading-relaxed">{paragraph}</p>
      ))}
    </>
  );
};

// --- ENHANCED SUSTAINABILITY CARD ---
const SustainabilityCard: React.FC<{ item: SustainabilityData; variants: Variants; index: number }> = ({ 
  item, 
  variants, 
  index 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageSrc = getFullUrl(item.sustain_image_file);
  const pdfSrc = getFullUrl(item.sustain_pdf_file);

  const TRUNCATE_LENGTH = 120;
  const description = item.description || "No description available.";
  const isLongDescription = description.length > TRUNCATE_LENGTH;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageSrc && !imageError) setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        variants={variants}
        custom={index}
        initial="hidden"
        animate="visible"
        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
      >
        {/* Image Section - Full image, no cropping */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
          {imageSrc && !imageError ? (
            <>
              <img
                src={imageSrc}
                alt={item.sustain_category}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                onClick={handleImageClick}
                onError={() => setImageError(true)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={handleImageClick}>
                <MagnifyingGlassPlusIcon className="w-12 h-12 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <DocumentTextIcon className="w-20 h-20 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-[#ed1c24] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Initiative
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl md:text-2xl font-bold text-[#003459] mb-3 group-hover:text-[#0072bc] transition-colors line-clamp-2">
            {item.sustain_category}
          </h3>

          <div className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
            {isLongDescription && !isExpanded ? (
              <p>{`${description.substring(0, TRUNCATE_LENGTH)}...`}</p>
            ) : (
              <FormattedDescription text={description} />
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            {pdfSrc && (
              <a
                href={pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#003459] text-white text-sm font-semibold rounded-lg hover:bg-[#0072bc] transition-all duration-300"
              >
                <DocumentTextIcon className="w-4 h-4" />
                View Report
              </a>
            )}
            {item.weblink && (
              <a
                href={item.weblink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ed1c24] hover:text-[#003459] transition-colors"
              >
                Learn More
                <LinkIcon className="w-4 h-4" />
              </a>
            )}
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-semibold text-[#0072bc] hover:text-[#003459] transition-colors ml-auto"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {imageSrc && !imageError && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageSrc={imageSrc}
          altText={item.sustain_category}
        />
      )}
    </>
  );
};

// --- SUSTAINABILITY SECTION ---
const SustainabilitySection: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSustainabilityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/allSustainability");
      if (response.data?.data && Array.isArray(response.data.data)) {
        setSustainabilityData(response.data.data);
        if (response.data.data.length === 0) setError("No sustainability data found.");
      } else {
        setError("No sustainability data found.");
      }
    } catch (err) {
      setError("Could not fetch sustainability data.");
      toast.error("Could not fetch sustainability data.");
    } finally {
      setIsLoading(false);
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => {
    fetchSustainabilityData();
  }, [fetchSustainabilityData]);

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: custom * 0.08,
        ease: "easeOut",
      },
    }),
  };

  if (error && sustainabilityData.length === 0 && !isLoading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-20 h-20 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-[#003459]">Failed to Load Content</h3>
        <p className="mt-2 text-gray-500">{error}</p>
        <button
          onClick={fetchSustainabilityData}
          className="mt-6 px-6 py-2 bg-[#003459] text-white rounded-full hover:bg-[#0072bc] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center">
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
          <p className="mt-4 text-gray-500">Loading sustainability initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#ed1c24]/10 px-4 py-2 rounded-full mb-4"
          >
          
            <span className="text-sm font-semibold text-[#ed1c24] uppercase tracking-wide">Our Commitment</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#003459]"
          >
            Sustainability Initiatives
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-24 h-1 bg-[#ed1c24] mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Cards Grid */}
        {sustainabilityData.length > 0 ? (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sustainabilityData.map((item, idx) => (
              <SustainabilityCard
                key={item.sustain_id}
                item={item}
                variants={cardVariants}
                index={idx}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <InformationCircleIcon className="w-20 h-20 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-[#003459]">No Initiatives to Display</h3>
            <p className="text-gray-500 mt-2">Please check back later for updates on our sustainability efforts.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- MAIN PAGE COMPONENT (No Pre-loader) ---
const SustainabilityHomePage: React.FC = () => {
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (sectionLoaded) {
      // Small delay to ensure smooth transition
      setTimeout(() => setShowContent(true), 100);
    }
  }, [sectionLoaded]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />

      <header className="bg-[#003459] text-white py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-wide">MCL Sustainability</h1>
        </div>
      </header>

      <motion.div
        className="flex-grow flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <main className="flex-grow">
          <SustainabilitySection setLoaded={setSectionLoaded} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default SustainabilityHomePage;