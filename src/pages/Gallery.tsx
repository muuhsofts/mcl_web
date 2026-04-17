import React, { useEffect, useState } from "react";
import axiosInstance from "../axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowPathIcon, 
  PlayIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon
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

// --- NEW DETAIL MODAL ---
interface DetailModalProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ items, currentIndex, onClose, onNext, onPrev }) => {
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
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT: MEDIA - No Cropping */}
          <div className="lg:w-3/5 bg-zinc-950 relative flex items-center justify-center p-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-3 text-white bg-black/60 hover:bg-black rounded-full transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            {currentItem.file_type === "image" ? (
              <img
                src={mediaUrl}
                alt={currentItem.title || ""}
                className="max-h-[85vh] max-w-full object-contain rounded-2xl"
              />
            ) : (
              <video
                src={mediaUrl}
                className="max-h-[85vh] max-w-full rounded-2xl"
                controls
                autoPlay
              />
            )}

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/70 hover:bg-black text-white rounded-2xl transition-all"
              >
                <ChevronLeftIcon className="w-9 h-9" />
              </button>
            )}

            {currentIndex < items.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/70 hover:bg-black text-white rounded-2xl transition-all"
              >
                <ChevronRightIcon className="w-9 h-9" />
              </button>
            )}
          </div>

          {/* RIGHT: DESCRIPTION */}
          <div className="lg:w-2/5 p-10 lg:p-14 flex flex-col bg-white overflow-y-auto">
            <h2 className="text-4xl font-bold text-gray-900 leading-snug mb-8">
              {currentItem.title || "Captured Memory"}
            </h2>

            <div className="text-gray-700 text-[17px] leading-relaxed flex-1">
              {currentItem.description || 
                "This beautiful moment was carefully preserved. Every detail tells its own story."}
            </div>

            <div className="mt-12 pt-8 border-t flex items-center gap-3 text-gray-500">
              <CalendarIcon className="w-5 h-5" />
              <span>
                {new Date(currentItem.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
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
  const [modalOpen, setModalOpen] = useState(false);
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

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const handleNext = () => setCurrentIndex(prev => Math.min(prev + 1, filteredData.length - 1));
  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 flex items-center justify-center">
          <div className="text-center">
            <ArrowPathIcon className="w-16 h-16 text-[#0072bc] animate-spin mx-auto" />
            <p className="mt-6 text-gray-600">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const imageCount = data.filter(i => i.file_type === "image").length;
  const videoCount = data.filter(i => i.file_type === "video").length;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100">

        {/* Minimal Hero Section */}
        <div className="bg-[#003459] py-20 text-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-bold tracking-tight"
            >
              Gallery
            </motion.h1>
            <p className="mt-5 text-xl text-white/75 max-w-md mx-auto">
              Moments worth remembering
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-12">
                <div>
                  <div className="text-4xl font-semibold text-emerald-600">{imageCount}</div>
                  <div className="text-xs tracking-widest text-gray-500">IMAGES</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold text-violet-600">{videoCount}</div>
                  <div className="text-xs tracking-widest text-gray-500">VIDEOS</div>
                </div>
              </div>

              <div className="flex bg-zinc-100 rounded-full p-1.5">
                {["all", "image", "video"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as "all" | "image" | "video")}
                    className={`px-7 py-3 rounded-full text-sm font-medium transition-all ${
                      filter === type 
                        ? "bg-white text-[#0072bc] shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {type === "all" ? "All" : type === "image" ? "Images" : "Videos"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid - No Cropping */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredData.map((item, index) => {
                const mediaUrl = getFullMediaUrl(item.file_path);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -10 }}
                    className="group cursor-pointer"
                    onClick={() => openModal(index)}
                  >
                    <div className="relative bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition-all duration-300">
                      {/* Media - No Cropping */}
                      <div className="relative pt-[75%] bg-zinc-100">   {/* Maintains nice proportion without cropping */}
                        {item.file_type === "image" ? (
                          <img
                            src={mediaUrl}
                            alt={item.title || ""}
                            className="absolute inset-0 w-full h-full object-contain p-4 transition-transform group-hover:scale-105 duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-contain"
                              preload="metadata"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayIcon className="w-20 h-20 text-white/90" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-7">
                        <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 group-hover:text-[#0072bc] transition-colors">
                          {item.title || "Untitled Moment"}
                        </h3>
                        <p className="mt-4 text-gray-600 text-[15px] leading-relaxed line-clamp-3">
                          {item.description || "A beautiful moment captured forever."}
                        </p>
                        <div className="mt-6 text-xs text-gray-500 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-7xl mb-4">📷</div>
              <h3 className="text-3xl font-light text-gray-700">No moments to show</h3>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <DetailModal
            items={filteredData}
            currentIndex={currentIndex}
            onClose={() => setModalOpen(false)}
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