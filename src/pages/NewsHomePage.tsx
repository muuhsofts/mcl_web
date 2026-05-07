import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  InformationCircleIcon,
  CalendarDaysIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import DOMPurify from "dompurify";

// ------------------------------
// Types
// ------------------------------
interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
  read_more_url_lnk?: string | null;
}

// ------------------------------
// Utilities
// ------------------------------
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

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const parseDescription = (description: string | null) => {
  if (!description) return { text: "", iframe: null };

  const sanitized = DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ["iframe"],
    ALLOWED_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title", "referrerpolicy"],
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, "text/html");
  const iframe = doc.querySelector("iframe");

  let text = description;
  if (iframe) {
    const iframeString = iframe.outerHTML;
    text = description.replace(iframeString, "").trim();
  }

  return { text: stripHtml(text), iframe };
};

// ------------------------------
// News Card Component – with full, uncropped image
// ------------------------------
const NewsCard: React.FC<{ news: NewsData }> = ({ news }) => {
  const imageUrl = getFullMediaUrl(news.news_img);
  const { text, iframe } = parseDescription(news.description);
  const shortPreview = text.length > 120 ? text.substring(0, 120) + "..." : text;
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/readmore-news/${news.news_id}`);
  };

  return (
    <motion.div
      className="relative group flex flex-col bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl w-80 flex-shrink-0 overflow-hidden h-full"
      whileHover={{ y: -5 }}
    >
      {/* Image container – increased height + object-contain ensures full image visible */}
      <div className="relative h-56 bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={news.category}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x224?text=Image+Error")}
          />
        ) : (
          <PhotoIcon className="w-16 h-16 text-gray-300" />
        )}
      </div>

      {/* Content area */}
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm font-semibold text-[#0d7680] mb-2 flex items-center">
          <CalendarDaysIcon className="w-4 h-4 mr-1.5" />
          {formatDate(news.created_at)}
        </p>
        <h3 className="text-xl font-bold text-[#003459] mb-2 line-clamp-2">{news.category}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{shortPreview}</p>

        <button
          onClick={handleReadMore}
          className="self-start bg-[#0A51A1] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#003459] transition mb-4"
        >
          Read More →
        </button>

        {iframe && iframe.src && (
          <div className="w-full rounded-lg overflow-hidden aspect-video bg-gray-100">
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
      </div>
    </motion.div>
  );
};

// ------------------------------
// Horizontal scrolling news section (loader removed)
// ------------------------------
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
          <div className="w-20 h-1 bg-red-500 mx-auto mt-3 rounded-full" />
        </div>

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
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-6 w-max">
                {paginatedNews.map((item) => (
                  <NewsCard key={item.news_id} news={item} />
                ))}
              </div>
            </div>

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
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-bold text-[#003459]">No News Found</h3>
            <p className="text-gray-500 mt-2">No articles match your current filters. Try clearing them.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ------------------------------
// Main News Home Page (loader removed)
// ------------------------------
const NewsHomePage: React.FC = () => {
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchNews = useCallback(async () => {
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchNews}
          className="mt-6 px-6 py-2 bg-[#0A51A1] text-white font-semibold rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
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
    </div>
  );
};

// ------------------------------
// Single News Page (loader removed)
// ------------------------------
const SingleNewsPage: React.FC = () => {
  const { news_id } = useParams<{ news_id: string }>();
  const [news, setNews] = useState<NewsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSingleNews = useCallback(async () => {
    if (!news_id) {
      setError("Invalid news ID.");
      return;
    }
    setError(null);
    try {
      const response = await axiosInstance.get<NewsData>(`/readmore-news/${news_id}`);
      setNews(response.data);
    } catch (err) {
      setError("Failed to fetch news article.");
      toast.error("Error fetching news article.");
    }
  }, [news_id]);

  useEffect(() => {
    fetchSingleNews();
  }, [fetchSingleNews]);

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
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

  const imageUrl = getFullMediaUrl(news.news_img);
  const pdfUrl = getFullMediaUrl(news.pdf_file);
  const { text, iframe } = parseDescription(news.description);

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
              ← Back to News
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
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
                />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-lg max-w-none text-gray-700">
              <div className="leading-relaxed whitespace-pre-line">{text}</div>

              {iframe && iframe.src && (
                <div className="my-8 w-full aspect-video rounded-lg shadow-md overflow-hidden">
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

// ------------------------------
// Exports
// ------------------------------
export { NewsHomePage, SingleNewsPage };
export default NewsHomePage;