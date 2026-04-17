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
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
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
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 transition-colors shadow-lg"
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

// Loader
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <motion.h2
      className="text-2xl font-bold text-white mt-4"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      Loading Sustainability...
    </motion.h2>
  </motion.div>
);

// FormattedDescription Helper
const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
      ))}
    </>
  );
};

// SustainabilityCard (uniform height)
const SustainabilityCard: React.FC<{ item: SustainabilityData; variants: Variants }> = ({ item, variants }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageSrc = getFullUrl(item.sustain_image_file);
  const pdfSrc = getFullUrl(item.sustain_pdf_file);

  const TRUNCATE_LENGTH = 120;
  const description = item.description || "No description available.";
  const isLongDescription = description.length > TRUNCATE_LENGTH;

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageSrc) setIsModalOpen(true);
  }

  return (
    <>
      <motion.div layout variants={variants} className="relative group pt-10 flex flex-col">
        {/* Image Container (pops up) */}
        <div
          className="relative z-10 mx-auto w-3/4 h-32 flex items-center justify-center bg-gray-50 rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:transform group-hover:-translate-y-8 group-hover:shadow-xl"
          onClick={imageSrc ? handleImageClick : undefined}
        >
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={item.sustain_category}
                className="max-w-full max-h-full object-contain p-4"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold cursor-pointer">
                <MagnifyingGlassPlusIcon className="w-8 h-8" />
              </div>
            </>
          ) : (
            <DocumentTextIcon className="w-16 h-16 text-gray-300" />
          )}
        </div>

        {/* Content Box (stays in place) */}
        <div className="relative bg-white shadow-lg rounded-xl flex flex-col group transition-all duration-300 border border-transparent group-hover:border-[#0072bc] -mt-16 flex-grow">
          <div className="p-6 pt-20 flex flex-col flex-grow">
            <h3 className="text-2xl font-bold text-[#003459] mb-3 uppercase">{item.sustain_category}</h3>
            <motion.div layout="position" className="text-gray-600 text-base mb-4 flex-grow">
              {isLongDescription && !isExpanded ? (
                <p>{`${description.substring(0, TRUNCATE_LENGTH)}...`}</p>
              ) : (
                <FormattedDescription text={description} />
              )}
            </motion.div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col items-start gap-y-3">
              {pdfSrc && (
                <a
                  href={pdfSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-[#ed1c24] group-hover:text-[#003459] transition-colors"
                >
                  View Report <DocumentTextIcon className="w-5 h-5" />
                </a>
              )}
              {item.weblink && (
                <a
                  href={item.weblink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-[#ed1c24] group-hover:text-[#003459] transition-colors"
                >
                  Learn More <LinkIcon className="w-5 h-5" />
                </a>
              )}
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm font-semibold text-[#0072bc] hover:text-[#003459] self-start mt-2 transition-colors"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {imageSrc && (
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

// Sustainability Section (only content now)
const SustainabilitySection: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSustainabilityData = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get("/api/allSustainability");
      if (response.data?.data && Array.isArray(response.data.data)) {
        setSustainabilityData(response.data.data);
      } else {
        setError("No sustainability data found.");
      }
    } catch (err) {
      setError("Could not fetch sustainability data.");
      toast.error("Could not fetch sustainability data.");
    } finally {
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => {
    fetchSustainabilityData();
  }, [fetchSustainabilityData]);

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459]">Our Sustainabilities</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"></p>
        </div>

        {error && sustainabilityData.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-gray-800">{error}</h3>
          </div>
        ) : sustainabilityData.length > 0 ? (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8"
          >
            {sustainabilityData.map((item) => (
              <SustainabilityCard key={item.sustain_id} item={item} variants={cardVariants} />
            ))}
          </motion.div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-gray-800">No Initiatives to Display</h3>
            <p className="mt-2 text-gray-500">Please check back later for updates on our sustainability efforts.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// MAIN PAGE COMPONENT (no slideshow)
const SustainabilityHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumTimePassed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sectionLoaded && minimumTimePassed) {
      setIsLoading(false);
    }
  }, [sectionLoaded, minimumTimePassed]);

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      <motion.div
        className="flex-grow flex flex-col"
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
        variants={contentVariants}
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