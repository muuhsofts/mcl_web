// src/pages/ViewSubEvents.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
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
}

interface ParentEventInfo {
  event_id: number;
  event_category: string;
}

interface SubEventData {
  subevent_id: number;
  event_id: number;
  sub_category: string;
  description: string;
  img_file: string | null;
  video_link: string | null;   // ← USING THIS FOR "Read More In Detail"
  created_at: string;
  event: ParentEventInfo;
}

// --- UTILITIES ---
const getFullUrl = (path: string | null): string | null => {
  if (!path) return null;
  const base = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${base}/${path.replace(/^\//, "")}`;
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) videoId = u.searchParams.get("v");
  } catch {
    return null;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// --- COMPONENTS ---
const Loader: React.FC = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#003459] to-[#0072bc] z-50">
    <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    <h2 className="mt-4 text-2xl font-bold text-white tracking-wider">
      Loading Details...
    </h2>
  </div>
);

const ImageModal: React.FC<{
  imageUrl: string;
  altText: string;
  onClose: () => void;
}> = ({ imageUrl, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative bg-white rounded-lg p-2 max-w-4xl w-full"
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
    >
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 p-2 bg-white text-[#ed1c24] rounded-full shadow-lg"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-h-[85vh] object-contain rounded"
      />
    </motion.div>
  </motion.div>
);

const SubEventCard: React.FC<{ subEvent: SubEventData }> = ({ subEvent }) => {
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const imageUrl = getFullUrl(subEvent.img_file);
  const embedUrl = getYouTubeEmbedUrl(subEvent.video_link);
  const defaultImg = "https://via.placeholder.com/600x400?text=Sub-Event";

  // Use video_link for "Read More In Detail"
  const readMoreUrl = subEvent.video_link && subEvent.video_link !== "null" && subEvent.video_link.trim()
    ? subEvent.video_link.trim()
    : null;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2"
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* IMAGE */}
        <div className="relative h-64 md:h-auto group">
          <img
            className="w-full h-full object-cover cursor-pointer"
            src={imageUrl ?? defaultImg}
            alt={subEvent.sub_category}
            onClick={() => setIsImgModalOpen(true)}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error";
            }}
            loading="lazy"
          />
        </div>

        {/* CONTENT */}
        <div className="p-6 flex flex-col">
          <h3 className="text-xl font-bold text-[#003459] mb-2">
            {subEvent.sub_category}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
            <span>{formatDate(subEvent.created_at)}</span>
          </div>

          <p className="text-gray-700 text-base mb-4 flex-grow">
            {subEvent.description}
          </p>

          {/* READ MORE IN DETAIL (using video_link) */}
          <motion.div
            className="inline-flex items-center mt-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {readMoreUrl ? (
              <a
                href={readMoreUrl.startsWith("http") ? readMoreUrl : `https://${readMoreUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
              >
                Read More In Detail
              </a>
            ) : (
              <p className="text-gray-500 italic">Read More In Detail Not Found</p>
            )}
          </motion.div>

          {/* EMBEDDED YOUTUBE */}
          {embedUrl && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-inner">
                <iframe
                  src={embedUrl}
                  title={subEvent.sub_category}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isImgModalOpen && imageUrl && (
          <ImageModal
            imageUrl={imageUrl}
            altText={subEvent.sub_category}
            onClose={() => setIsImgModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN PAGE --- (unchanged below)
const ViewSubEvents: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [parentEvent, setParentEvent] = useState<EventData | null>(null);
  const [subEvents, setSubEvents] = useState<SubEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParentImgModalOpen, setIsParentImgModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) {
      setError("Event ID is missing.");
      setIsLoading(false);
      return;
    }

    try {
      const [parentRes, subRes] = await Promise.all([
        axiosInstance.get<{ events: EventData[] }>("/api/all-events"),
        axiosInstance.get<{ sub_events: SubEventData[] }>("/api/all/sub-events"),
      ]);

      const parent = parentRes.data.events.find(
        (e) => e.event_id.toString() === eventId
      );
      if (!parent) throw new Error("Parent event not found.");
      setParentEvent(parent);

      const filtered = subRes.data.sub_events
        .filter((s) => s.event.event_id.toString() === eventId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      setSubEvents(filtered);
    } catch (err: any) {
      setError(err.message || "Could not fetch event details.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <Loader />;
  if (error || !parentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <InformationCircleIcon className="w-16 h-16 mx-auto text-[#ed1c24]" />
        <h3 className="mt-4 text-3xl font-bold text-[#003459]">
          Error Loading Page
        </h3>
        <p className="mt-2 text-lg text-gray-600">{error}</p>
        <Link
          to="/all-events"
          className="mt-8 inline-flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-lg hover:bg-[#0072bc]"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to All Events
        </Link>
      </div>
    );
  }

  const parentImg = getFullUrl(parentEvent.img_file);
  const parentEmbed = getYouTubeEmbedUrl(parentEvent.video_link);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to="/all-events"
              className="inline-flex items-center text-gray-600 hover:text-[#0072bc] font-semibold transition-colors group"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to All Events
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#003459]">
              {parentEvent.event_category}
            </h1>
            <div className="flex items-center text-md text-gray-500 my-4">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
              <span>{formatDate(parentEvent.created_at)}</span>
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 mb-8">
              <p>{parentEvent.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {parentImg && (
                <div
                  className="group cursor-pointer"
                  onClick={() => setIsParentImgModalOpen(true)}
                >
                  <img
                    src={parentImg}
                    alt={parentEvent.event_category}
                    className="rounded-lg shadow-md w-full h-full object-cover"
                  />
                </div>
              )}
              {parentEmbed && (
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={parentEmbed}
                    title={parentEvent.event_category}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>

          {subEvents.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#003459] mb-8 border-b-2 border-[#0072bc] pb-2">
                Related Sub-Events & Activities
              </h2>
              <div className="grid grid-cols-1 gap-10">
                {subEvents.map((s) => (
                  <SubEventCard key={s.subevent_id} subEvent={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {isParentImgModalOpen && parentImg && (
          <ImageModal
            imageUrl={parentImg}
            altText={parentEvent.event_category}
            onClose={() => setIsParentImgModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewSubEvents;