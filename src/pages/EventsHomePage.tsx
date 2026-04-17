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
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---
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

// --- UTILITY FUNCTIONS ---
const getFullUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") videoId = urlObj.pathname.slice(1);
    else if (urlObj.hostname.includes("youtube.com")) videoId = urlObj.searchParams.get("v");
  } catch (error) { return null; }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// --- UI COMPONENTS ---
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#003459] to-[#0072bc] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4">
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <h2 className="text-2xl font-bold text-white tracking-wider">Loading Events...</h2>
  </motion.div>
);

const ImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void; }> = ({ imageUrl, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-lg p-2 max-w-4xl w-full"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 p-2 bg-white text-[#ed1c24] rounded-full shadow-lg hover:bg-gray-200 transition"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img src={imageUrl} alt={altText} className="w-full h-auto max-h-[85vh] object-contain rounded" />
    </motion.div>
  </motion.div>
);

// --- REFINED EventCard COMPONENT (unchanged) ---
const EventCard: React.FC<{ event: EventData; variants: Variants }> = ({ event, variants }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = getFullUrl(event.img_file);
  const embedVideoUrl = getYouTubeEmbedUrl(event.video_link);

  const description = event.description || "No description provided.";
  const maxLength = 120;
  const isLongDescription = description.length > maxLength;
  const displayedDescription = isExpanded ? description : `${description.slice(0, maxLength)}...`;

  return (
    <>
      <motion.div layout variants={variants} className="relative group pt-10 flex flex-col">
        {/* Image Container */}
        <div
          onClick={() => imageUrl && setIsModalOpen(true)}
          className="relative z-10 mx-auto w-2/3 h-36 flex items-center justify-center bg-gray-50 rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:transform group-hover:-translate-y-3 group-hover:shadow-xl cursor-pointer"
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={event.event_category} className="w-full h-full object-cover rounded-lg" loading="lazy" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
                <p className="text-white font-bold text-sm drop-shadow-md">View</p>
              </div>
            </>
          ) : (
            <PhotoIcon className="w-12 h-12 text-gray-300" />
          )}
        </div>

        {/* Content Box */}
        <div className="relative bg-white shadow-lg rounded-xl flex flex-col group transition-all duration-300 border border-transparent group-hover:border-[#0072bc] -mt-16 flex-grow">
          <div className="p-6 pt-20 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-[#003459] mb-2 uppercase">{event.event_category}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <CalendarDaysIcon className="w-4 h-4 mr-2 text-[#0072bc]" />
              <span>{formatDate(event.created_at)}</span>
            </div>

            <motion.div layout="position" className="text-gray-600 text-base mb-4 flex-grow">
              <p className="inline">{isLongDescription ? displayedDescription : description}</p>
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#0072bc] font-semibold hover:underline ml-1 transition-colors"
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              )}
              {embedVideoUrl && (
                <div className="mt-4">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-inner">
                    <iframe
                      src={embedVideoUrl}
                      title={event.event_category}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
              <Link
                to={`/events/${event.event_id}`}
                title="View Sub-Events"
                className="inline-flex items-center gap-2 font-semibold text-[#ed1c24] group-hover:text-[#003459] transition-colors"
              >
                View Details <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && imageUrl && (
          <ImageModal imageUrl={imageUrl} altText={event.event_category} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// --- EVENTS SECTION (modified: removed FLAGSHIP EVENTS / Driving... replaced with red "EVENTS") ---
const EventsSection: React.FC<{
  setContentLoaded: (loaded: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setContentLoaded, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const fetchEvents = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get<EventsResponse>("/api/all-events");
      if (response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events);
        if (response.data.events.length === 0) setError("No events found.");
      } else {
        throw new Error("Invalid data format from API.");
      }
    } catch (err: any) {
      setError("Could not fetch events data. Please try again later.");
      toast.error("Error fetching events.");
    } finally {
      setContentLoaded(true);
    }
  }, [setContentLoaded]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = ["All", ...new Set(events.map((event) => event.event_category))];
  const filteredEvents = filter === "All" ? events : events.filter((event) => event.event_category === filter);

  const sortedFilteredEvents = [...filteredEvents].sort((a, b) => {
    const aHasImage = !!a.img_file;
    const bHasImage = !!b.img_file;
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    return b.event_id - a.event_id;
  });

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const totalPages = Math.ceil(sortedFilteredEvents.length / itemsPerPage);
  const paginatedEvents = sortedFilteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center px-4 text-center bg-gray-50">
        <InformationCircleIcon className="w-16 h-16 mx-auto text-[#ed1c24]" />
        <h3 className="mt-4 text-3xl font-bold text-[#003459]">
          {error === "No events found." ? "No Events Available" : "Failed to Load Content"}
        </h3>
        <p className="mt-2 text-lg text-gray-600 max-w-md">
          {error === "No events found."
            ? "There are no events to display at the moment. Check back soon!"
            : error}
        </p>
        <button
          onClick={fetchEvents}
          className="mt-8 flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0072bc] transition-colors shadow-md"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simplified title: red "EVENTS" only */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#ed1c24]">EVENTS</h1>
        </div>

        {/* Filters and items per page (unchanged) */}
        <div className="flex flex-wrap gap-3 mb-12 justify-between items-center">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilter(category);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  filter === category
                    ? "bg-[#ed1c24] text-white shadow-lg"
                    : "bg-white text-[#003459] hover:bg-gray-200 shadow-md"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0072bc] focus:border-[#0072bc]"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Event cards grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8"
        >
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map((event) => <EventCard key={event.event_id} event={event} variants={cardVariants} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-600" />
              <h3 className="mt-4 text-xl font-bold text-[#003459]">No Events Found</h3>
              <p className="text-gray-500 mt-2">No events match your current filter. Try selecting a different category.</p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedFilteredEvents.length)} of {sortedFilteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// --- MAIN PAGE (header removed) ---
const EventsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fallback timeout – loader will disappear once content loads or after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>

      {/* No header bar – the page starts directly with the events section */}

      <main className="flex-grow">
        <EventsSection
          setContentLoaded={(loaded) => loaded && setIsLoading(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;