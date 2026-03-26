import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  ArrowPathIcon, 
  InformationCircleIcon, 
  ArrowUpRightIcon, 
  InboxIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Header from "../components/header/Header";
import Footer from "../components/Footer";

// --- INTERFACES & UTILITIES ---
interface BrandData {
  brand_id: number;
  brand_img: string;
  category: string;
  description: string;
  url_link: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: BrandData[];
}

const getFullUrl = (path: string | null): string => {
  if (!path) return "https://via.placeholder.com/400x200?text=Image+Missing";
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

// --- UI COMPONENTS ---

// Simple spinner loader (no full-screen pre-loader)
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="flex flex-col items-center">
      <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
      <p className="mt-4 text-gray-500 font-medium">Loading brands...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ title: string; message: string; onRetry: () => void }> = ({ title, message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white rounded-2xl shadow-lg">
    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
      <InformationCircleIcon className="w-10 h-10 text-[#ed1c24]" />
    </div>
    <h2 className="text-2xl md:text-3xl font-bold text-[#003459] mb-3">{title}</h2>
    <p className="text-gray-600 max-w-md mb-8">{message}</p>
    <button 
      onClick={onRetry} 
      className="inline-flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0072bc] transition-all duration-300 shadow-md hover:shadow-lg"
    >
      <ArrowPathIcon className="w-5 h-5 mr-2" />
      Try Again
    </button>
  </div>
);

const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3 last:mb-0 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </>
  );
};

// --- ENHANCED BRAND CARD COMPONENT ---
const BrandCard: React.FC<{ brand: BrandData; variants: Variants; index: number }> = ({ brand, variants, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = getFullUrl(brand.brand_img);
  const isExternalLink = !!brand.url_link && brand.url_link.startsWith('http');
  const targetUrl = brand.url_link || `/brands/${brand.brand_id}`;

  const TRUNCATE_LENGTH = 120;
  const description = brand.description || "No description available.";
  const isLongDescription = description.length > TRUNCATE_LENGTH;

  return (
    <motion.div
      layout
      variants={variants}
      custom={index}
      initial="hidden"
      animate="visible"
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
    >
      {/* Image Section - Full image display */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        {!imageError ? (
          <>
            <img
              src={imageUrl}
              alt={`${brand.category} logo`}
              className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">View Brand</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <BuildingStorefrontIcon className="w-16 h-16 mb-2" />
            <span className="text-sm">Logo Coming Soon</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-[#ed1c24]/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
          {brand.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl md:text-2xl font-bold text-[#003459] mb-3 group-hover:text-[#0072bc] transition-colors line-clamp-1">
          {brand.category}
        </h3>

        <div className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
          {isLongDescription && !isExpanded ? (
            <p>{`${description.substring(0, TRUNCATE_LENGTH)}...`}</p>
          ) : (
            <FormattedDescription text={description} />
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={targetUrl}
            target={isExternalLink ? "_blank" : "_self"}
            rel={isExternalLink ? "noopener noreferrer" : ""}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#ed1c24] hover:text-[#003459] transition-colors group/link"
          >
            Explore Brand
            <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
          </Link>
          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-[#0072bc] hover:text-[#003459] transition-colors"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const OurBrands: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse>("/api/allBrands");
      const brandsData = response.data.data;
      if (Array.isArray(brandsData)) {
        const sortedBrands = brandsData.sort((a, b) => b.brand_id - a.brand_id);
        setBrands(sortedBrands);
      } else {
        throw new Error("Invalid data format received from API.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.data?.error || "Failed to fetch brands. Please check your connection and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const categories = ['All', ...Array.from(new Set(brands.map((brand) => brand.category))).sort()];
  const filteredBrands = activeFilter === 'All' ? brands : brands.filter((brand) => brand.category === activeFilter);

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        delay: custom * 0.05,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Header />
      
      <main className="flex-grow">
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorState title="Oops, Something Went Wrong" message={error} onRetry={fetchBrands} />
            ) : (
              <>
                {/* Filter Section */}
                <div className="mb-12">
                  <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                          activeFilter === category
                            ? 'bg-[#ed1c24] text-white shadow-lg shadow-red-200'
                            : 'bg-white text-[#003459] hover:bg-gray-100 shadow-md border border-gray-200'
                        }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Brands Grid */}
                <motion.div
                  key={activeFilter}
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand, idx) => (
                      <BrandCard 
                        key={brand.brand_id} 
                        brand={brand} 
                        variants={cardVariants} 
                        index={idx}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-lg"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <InboxIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#003459] mb-2">No Brands in this Category</h3>
                      <p className="text-gray-500">Please select another category to see more of our brands.</p>
                    </motion.div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default OurBrands;