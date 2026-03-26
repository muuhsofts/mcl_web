// src/pages/EventsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  PhotoIcon,
  EyeIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

/* ------------------------------------------------- INTERFACES ------------------------------------------------- */
interface EventData {
  event_id: number;
  event_category: string;
  description: string;
  img_file: string | null;
  video_link: string | null;
  created_at: string;
  updated_at: string;
}

interface EventsResponse {
  events: EventData[];
}

/* ------------------------------------------------- UTILITIES ------------------------------------------------- */
const getFullUrl = (path: string | null): string | null => {
  if (!path) return null;
  const base = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${base}/${path.replace(/^\//, "")}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const eventDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  let id: string | null = null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") id = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v");
  } catch {}
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

/* ------------------------------------------------- UI COMPONENTS ------------------------------------------------- */
const ImageModal: React.FC<{
  imageUrl: string;
  altText: string;
  onClose: () => void;
}> = ({ imageUrl, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-2xl p-2 max-w-5xl w-full"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-4 -right-4 p-2 bg-white text-[#ed1c24] rounded-full shadow-lg hover:bg-gray-100 transition z-10"
        aria-label="Close"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img src={imageUrl} alt={altText} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
    </motion.div>
  </motion.div>
);

/* ------------------------------------------------- HORIZONTAL EVENT CARD ------------------------------------------------- */
const HorizontalEventCard: React.FC<{ event: EventData; variants: Variants; index: number }> = ({
  event,
  variants,
  index,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const img = getFullUrl(event.img_file);
  const embed = getYouTubeEmbedUrl(event.video_link);
  const hasVideo = !!embed;

  const readMoreUrl = event.video_link && event.video_link !== "null" && event.video_link.trim()
    ? event.video_link.trim()
    : null;

  const desc = event.description || "No description provided.";
  const max = 140;
  const long = desc.length > max;
  const shownDesc = expanded ? desc : `${desc.slice(0, max)}...`;

  return (
    <>
      <motion.article
        layout
        variants={variants}
        custom={index}
        initial="hidden"
        animate="visible"
        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row w-full"
      >
        {/* Image Section - Horizontal layout */}
        <div className="relative md:w-2/5 lg:w-1/3 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {img ? (
            <>
              <img
                src={img}
                alt={event.event_category}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <button
                onClick={() => img && setModalOpen(true)}
                className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                aria-label="View image"
              >
                <EyeIcon className="w-4 h-4 text-[#003459]" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PhotoIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
          {hasVideo && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-semibold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Video</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-[#ed1c24] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {event.event_category}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="w-4 h-4 text-[#0072bc]" />
              <span>{formatDate(event.created_at)}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-[#0072bc]" />
              <span>{getRelativeTime(event.created_at)}</span>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-[#003459] mb-3 group-hover:text-[#0072bc] transition-colors leading-tight">
            {event.event_category}
          </h3>

          <p className="text-gray-600 text-base leading-relaxed mb-4">
            {long ? shownDesc : desc}
            {long && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[#0072bc] font-semibold hover:underline ml-2 transition-colors"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {hasVideo && (
            <div className="mt-2 mb-4 rounded-xl overflow-hidden shadow-md max-w-md">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={embed}
                  title={event.event_category}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            {readMoreUrl ? (
              <a
                href={readMoreUrl.startsWith("http") ? readMoreUrl : `https://${readMoreUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ed1c24] hover:text-[#003459] transition-colors group/link"
              >
                Read Full Story
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </a>
            ) : (
              <span className="text-gray-400 text-sm italic">Full story coming soon</span>
            )}
            <Link
              to={`/events/${event.event_id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0072bc] hover:text-[#003459] transition-colors group/link2"
            >
              View Details
              <ArrowRightIcon className="w-3 h-3 transition-transform group-hover/link2:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {modalOpen && img && (
          <ImageModal imageUrl={img} altText={event.event_category} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------- EVENTS SECTION ------------------------------------------------- */
const EventsSection: React.FC<{
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get<EventsResponse>("/api/all-events");
      if (Array.isArray(data.events)) {
        setEvents(data.events);
        if (data.events.length === 0) setError("No events found.");
      } else throw new Error("Invalid data");
    } catch {
      setError("Could not fetch events data. Please try again later.");
      toast.error("Error fetching events.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = ["All", ...new Set(events.map((e) => e.event_category))];
  const filtered = filter === "All" ? events : events.filter((e) => e.event_category === filter);
  const sorted = [...filtered].sort((a, b) => {
    const aImg = !!a.img_file, bImg = !!b.img_file;
    if (aImg && !bImg) return -1;
    if (!aImg && bImg) return 1;
    return b.event_id - a.event_id;
  });

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { x: -40, opacity: 0 },
    visible: (custom: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: custom * 0.08,
        ease: "easeOut",
      },
    }),
  };

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const pageItems = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error && error !== "No events found.") {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center px-4 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <InformationCircleIcon className="w-20 h-20 mx-auto text-[#ed1c24]" />
          <h3 className="mt-4 text-2xl font-bold text-[#003459]">Failed to Load Content</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-6 inline-flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0072bc] transition-colors shadow-md"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center">
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
          <p className="mt-4 text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003459] border-l-8 border-[#ed1c24] pl-6">
            EVENTS
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setFilter(c);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  filter === c
                    ? "bg-[#ed1c24] text-white shadow-lg shadow-red-200"
                    : "bg-gray-100 text-[#003459] hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Show per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#0072bc] focus:border-[#0072bc] bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>

        {/* Events List - Horizontal Layout */}
        {pageItems.length ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {pageItems.map((ev, idx) => (
              <HorizontalEventCard
                key={ev.event_id}
                event={ev}
                variants={cardVariants}
                index={idx}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <CalendarDaysIcon className="w-20 h-20 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-[#003459]">No Events Found</h3>
            <p className="text-gray-500 mt-2">Try selecting a different category.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} events
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-[#003459] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center px-4 py-2 bg-[#003459] text-white rounded-lg shadow-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-300 text-[#003459] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ------------------------------------------------- MAIN PAGE ------------------------------------------------- */
const EventsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />

      <header className="bg-[#003459] text-white py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-wide">MCL Events</h1>
        </div>
      </header>

      <main className="flex-grow">
        <EventsSection
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={perPage}
          setItemsPerPage={setPerPage}
        />
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;