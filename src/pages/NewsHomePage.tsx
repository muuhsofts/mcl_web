import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  PhotoIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import DOMPurify from "dompurify";


interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
}

// --- UTILITY FUNCTIONS ---
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getFullMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseURL}/${path.replace(/^\//, "")}`;
};

// --- LOADER COMPONENT ---
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      className="mb-4"
    >
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <h2 className="text-2xl font-bold text-white tracking-wider">Loading News...</h2>
  </motion.div>
);

// --- NewsCard COMPONENT (unchanged but adjusted for horizontal layout) ---
const NewsCard: React.FC<{ news: NewsData }> = ({ news }) => {
  const imageUrl = getFullMediaUrl(news.news_img);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const parseDescription = (description: string | null) => {
    if (!description) return { text: "Click to read more details.", iframe: null };

    const sanitizedDescription = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ["iframe"],
      ALLOWED_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title", "referrerpolicy"],
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedDescription, "text/html");
    const iframe = doc.querySelector("iframe");

    let text = description;
    if (iframe) {
      const iframeString = iframe.outerHTML;
      text = description.replace(iframeString, "").trim() || "Click to read more details.";
    }

    return { text: DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }), iframe };
  };

  const { text, iframe } = parseDescription(news.description);
  const isTextLong = text.length > 200;

  const renderMedia = () => {
    if (iframe && iframe.src) {
      return (
        <div className="w-full h-32 flex items-center justify-center aspect-video rounded-lg shadow-md overflow-hidden bg-gray-100">
          <iframe
            src={iframe.src}
            title={iframe.title || "News Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div className="w-full h-32 flex flex-col items-center justify-center aspect-video rounded-lg shadow-md bg-gray-100">
        <PlayCircleIcon className="w-12 h-12 text-gray-400" />
        <p className="text-sm text-gray-400 mt-1">No Video Available</p>
      </div>
    );
  };

  return (
    <motion.div
      layoutId={`news-card-${news.news_id}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".read-more-less")) return;
        navigate(`/readmore-news/${news.news_id}`);
      }}
      className="relative group flex flex-col cursor-pointer bg-white rounded-xl shadow-lg transition-all duration-300 border border-transparent hover:border-[#0072bc] hover:shadow-xl w-80 flex-shrink-0"
    >
      <div className="relative z-10 mx-auto w-full max-w-[90%] h-48 flex items-center justify-center bg-gray-50 rounded-lg shadow-md transition-transform duration-300 ease-in-out group-hover:transform group-hover:-translate-y-8 group-hover:shadow-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={news.category}
            className="w-full h-full object-contain rounded-lg"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x192?text=Image+Error")}
          />
        ) : (
          <PhotoIcon className="w-16 h-16 text-gray-300" />
        )}
      </div>
      <div className="p-6 pt-20 flex flex-col flex-grow bg-gray-50 rounded-b-xl">
        <p className="text-sm font-semibold text-[#0d7680] mb-3">
          <CalendarDaysIcon className="w-4 h-4 inline-block mr-1.5 align-text-bottom" />
          {formatDate(news.created_at)}
        </p>
        <h3 className="text-xl font-bold text-[#003459] mb-3 line-clamp-2 flex-shrink-0">{news.category}</h3>
        <div className="flex flex-col flex-grow gap-4">
          <motion.div
            animate={{ height: "auto" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col flex-grow text-left"
          >
            <p className={`text-gray-600 text-base ${isExpanded || !isTextLong ? "" : "line-clamp-4"}`}>{text}</p>
            {isTextLong && (
              <button
                className="read-more-less text-blue-600 hover:underline font-semibold mt-2 text-sm self-start"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </motion.div>
          {renderMedia()}
        </div>
      </div>
    </motion.div>
  );
};

// --- NEWS SECTION – HORIZONTAL SCROLLING VERSION ---
const NewsSection: React.FC<{
  news: NewsData[];
  filters: { month: string; setMonth: (m: string) => void; year: string; setYear: (y: string) => void };
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ news, filters, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => (currentYear - i).toString());

  const sortedNews = [...news].sort((a, b) => {
    const aHasImage = !!a.news_img;
    const bHasImage = !!b.news_img;
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const paginatedNews = sortedNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="py-16 bg-[#f0f2f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459]">Our News and Updates</h2>
        </div>

        {/* Filters row */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <select
            value={filters.year}
            onChange={(e) => {
              filters.setYear(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filters.month}
            onChange={(e) => {
              filters.setMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button
            onClick={() => {
              filters.setYear("");
              filters.setMonth("");
              setCurrentPage(1);
            }}
            className="w-full p-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {paginatedNews.length > 0 ? (
          <>
            {/* Horizontal scrollable container */}
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-6 w-max">
                {paginatedNews.map((item) => (
                  <NewsCard key={item.news_id} news={item} />
                ))}
              </div>
            </div>

            {/* Pagination controls (same as before) */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sortedNews.length)} of {sortedNews.length} news items
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-600" />
            <h3 className="mt-4 text-xl font-bold text-[#003459]">No News Found</h3>
            <p className="text-gray-500 mt-2">No articles match your current filters. Try clearing them.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- SINGLE NEWS PAGE (unchanged) ---
const SingleNewsPage: React.FC = () => {
  const { news_id } = useParams<{ news_id: string }>();
  const [news, setNews] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSingleNews = useCallback(async () => {
    if (!news_id) {
      setError("Invalid news ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<NewsData>(`/readmore-news/${news_id}`);
      setNews(response.data);
    } catch (err) {
      setError("Failed to fetch news article.");
      toast.error("Error fetching news article.");
    } finally {
      setIsLoading(false);
    }
  }, [news_id]);

  useEffect(() => {
    fetchSingleNews();
  }, [fetchSingleNews]);

  const parseDescription = (description: string | null) => {
    if (!description) return { text: "No details available.", iframe: null };

    const sanitizedDescription = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ["iframe"],
      ALLOWED_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title", "referrerpolicy"],
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedDescription, "text/html");
    const iframe = doc.querySelector("iframe");

    let text = description;
    if (iframe) {
      const iframeString = iframe.outerHTML;
      text = description.replace(iframeString, "").trim() || "No additional details.";
    }

    return { text: DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }), iframe };
  };

  if (isLoading) return <Loader />;

  if (error || !news) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error || "News article not found."}</p>
        <button
          onClick={() => navigate("/news")}
          className="mt-6 px-6 py-2 bg-[#0A51A1] text-white font-semibold rounded-md"
        >
          Back to News
        </button>
      </div>
    );
  }

  const { text, iframe } = parseDescription(news.description);
  const imageUrl = getFullMediaUrl(news.news_img);
  const pdfUrl = getFullMediaUrl(news.pdf_file);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <main className="flex-grow">
        <section className="relative bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/news")}
              className="mb-6 flex items-center text-[#003459] hover:text-[#0A51A1] font-semibold"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2 rotate-180" />
              Back to News
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#003459]">{news.category}</h1>
              <p className="mt-4 text-sm font-semibold text-[#0d7680] flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                {formatDate(news.created_at)}
              </p>
            </motion.div>

            {imageUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-12">
                <img
                  src={imageUrl}
                  alt={news.category}
                  className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
                />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-lg max-w-none text-gray-700">
              <div className="leading-relaxed">{text}</div>
              {iframe && iframe.src && (
                <div className="mb-8 w-full aspect-video rounded-lg shadow-md overflow-hidden">
                  <iframe
                    src={iframe.src}
                    title={iframe.title || "News Video"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
              {pdfUrl && (
                <div className="mt-8">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-[#0A51A1] text-white font-semibold rounded-md hover:bg-[#003459] transition"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <footer><Footer /></footer>
    </div>
  );
};

// --- MAIN NEWS PAGE (NO SLIDESHOW, HORIZONTAL CARDS) ---
const NewsHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ news: NewsData[] }>("/api/allNews");
      const sortedNews = (response.data.news || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllNews(sortedNews);
    } catch (err) {
      setError("Failed to fetch news data.");
      toast.error("Error fetching news data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = allNews.filter((item) => {
    if (year && new Date(item.created_at).getFullYear().toString() !== year) return false;
    if (month && (new Date(item.created_at).getMonth() + 1).toString() !== month) return false;
    return true;
  });

  if (error && !isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button onClick={fetchNews} className="mt-6 px-6 py-2 bg-[#0A51A1] text-white font-semibold rounded-md">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      {!isLoading && (
        <>
          <main className="flex-grow">
            <NewsSection
              news={filteredNews}
              filters={{ month, setMonth, year, setYear }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </main>
          <footer><Footer /></footer>
        </>
      )}
    </div>
  );
};

// Export both components
export { NewsHomePage, SingleNewsPage };
export default NewsHomePage;