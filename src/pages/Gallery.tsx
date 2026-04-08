import React, { useEffect, useState } from "react";
import axiosInstance from "../axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowPathIcon, 
  PhotoIcon, 
  PlayIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import Footer from "../components/Footer";
import Header from "../components/header/Header"; 


// --- INTERFACE ---
interface GalleryItem {
  id: number;
  title: string | null;
  description: string | null;
  file_path: string;
  file_type: "image" | "video";
  created_at: string;
}

// --- HELPER ---
const getFullMediaUrl = (path: string) => {
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseURL}/${path}`;
};

// --- LIGHTBOX MODAL COMPONENT ---
interface LightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ items, currentIndex, onClose, onNext, onPrev }) => {
  const currentItem = items[currentIndex];
  const mediaUrl = getFullMediaUrl(currentItem?.file_path || "");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full hover:bg-black/70"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        )}

        {currentIndex < items.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full hover:bg-black/70"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        )}

        {/* Media Content */}
        <div className="max-w-7xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
          {currentItem.file_type === "image" ? (
            <img
              src={mediaUrl}
              alt={currentItem.title || "Gallery image"}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          ) : (
            <video
              src={mediaUrl}
              className="w-full h-auto max-h-[85vh] rounded-lg"
              controls
              autoPlay
            />
          )}
          
          {/* Caption */}
          <div className="mt-4 text-center text-white">
            <h3 className="text-xl font-semibold">{currentItem.title || "Untitled"}</h3>
            <p className="text-sm text-gray-300 mt-1">{currentItem.description || ""}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(currentItem.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MAIN GALLERY COMPONENT ---
const Gallery: React.FC = () => {
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const fetchGallery = async () => {
    try {
      const res = await axiosInstance.get("/api/fetch-all-galleries");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gallery fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredData = data.filter(item => 
    filter === "all" ? true : item.file_type === filter
  );

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, filteredData.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // --- LOADING ---
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="w-12 h-12 text-[#0072bc]" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Loading gallery...</p>
        </div>
        <Footer />
      </>
    );
  }

  // --- STATS ---
  const imageCount = data.filter(item => item.file_type === "image").length;
  const videoCount = data.filter(item => item.file_type === "video").length;

  // --- UI ---
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* HERO SECTION */}
        <div className="relative bg-gradient-to-r from-[#003459] via-[#0072bc] to-[#003459] text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4">Gallery</h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                Explore our collection of memorable moments.
              </p>
            </motion.div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="bg-white shadow-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0072bc]">{data.length}</div>
                  <div className="text-xs text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{imageCount}</div>
                  <div className="text-xs text-gray-600">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{videoCount}</div>
                  <div className="text-xs text-gray-600">Videos</div>
                </div>
              </div>
              
              {/* FILTER BUTTONS */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === "all" 
                      ? "bg-[#0072bc] text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("image")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === "image" 
                      ? "bg-[#0072bc] text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <PhotoIcon className="w-4 h-4" />
                  Images
                </button>
                <button
                  onClick={() => setFilter("video")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === "video" 
                      ? "bg-[#0072bc] text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <PlayIcon className="w-4 h-4" />
                  Videos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MASONRY GRID */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {filteredData.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredData.map((item, index) => {
                const mediaUrl = getFullMediaUrl(item.file_path);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="break-inside-avoid cursor-pointer group"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      {/* MEDIA CONTAINER */}
                      <div className="relative overflow-hidden bg-gray-200">
                        {item.file_type === "image" ? (
                          <>
                            <img
                              src={mediaUrl}
                              alt={item.title || "Gallery image"}
                              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <EyeIcon className="w-10 h-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="relative">
                            <video
                              src={mediaUrl}
                              className="w-full h-auto object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlayIcon className="w-8 h-8 text-[#0072bc] ml-1" />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* TYPE BADGE */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md ${
                            item.file_type === "image" 
                              ? "bg-green-600/80 text-white" 
                              : "bg-purple-600/80 text-white"
                          }`}>
                            {item.file_type === "image" ? (
                              <div className="flex items-center gap-1">
                                <PhotoIcon className="w-3 h-3" />
                                Image
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <PlayIcon className="w-3 h-3" />
                                Video
                              </div>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-800 line-clamp-1 group-hover:text-[#0072bc] transition-colors">
                          {item.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-700">No items found</h3>
              <p className="mt-2 text-gray-500">
                {filter !== "all" 
                  ? `No ${filter}s available in the gallery` 
                  : "The gallery is currently empty"}
              </p>
            </motion.div>
          )}
        </div>

        {/* LIGHTBOX COMPONENT - FIXED: Now actually rendered */}
        {lightboxOpen && (
          <Lightbox
            items={filteredData}
            currentIndex={currentIndex}
            onClose={() => setLightboxOpen(false)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        <Footer />
      </div>
    </>
  );
};

export default Gallery;