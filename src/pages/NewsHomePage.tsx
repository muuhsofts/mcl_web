import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  PhotoIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { Helmet } from "react-helmet";

// --- INTERFACES ---
interface NewsHomeData {
  news_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
  updated_at?: string;
}

interface ApiResponse {
  news: NewsData;
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

const unescapeHtml = (text: string | null): string | null => {
  if (!text) return null;
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
};

const parseDescription = (description: string | null) => {
  if (!description) return { text: "<p class='mb-4'>No details available.</p>", iframeSrcs: [] };

  const unescapedDescription = unescapeHtml(description);
  const sanitizedDescription = DOMPurify.sanitize(unescapedDescription || "", {
    ALLOWED_TAGS: ["p", "strong", "em", "ul", "li", "a", "iframe", "span", "div", "br", "ol", "blockquote"],
    ALLOWED_ATTR: [
      "src",
      "width",
      "height",
      "frameborder",
      "allow",
      "allowfullscreen",
      "title",
      "referrerpolicy",
      "href",
      "target",
      "style",
      "class",
    ],
    ADD_ATTR: ["allow", "allowfullscreen", "referrerpolicy"],
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedDescription, "text/html");
  const iframes = doc.querySelectorAll("iframe");
  const iframeSrcs = Array.from(iframes)
    .map((iframe) => iframe.src)
    .filter((src) => src && /^https?:\/\/(www\.)?(youtube\.com|you tu\.be|vimeo\.com)\/.+$/.test(src));

  let text = sanitizedDescription;
  iframes.forEach((iframe) => {
    text = text.replace(iframe.outerHTML, "").trim();
  });
  text = text || "<p class='mb-4'>No additional details.</p>";

  console.log("ParseDescription:", {
    input: description,
    unescaped: unescapedDescription,
    sanitized: sanitizedDescription,
    iframeSrcs,
    text,
  });

  return { text, iframeSrcs };
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

// --- SHARE BUTTON COMPONENT ---
const ShareButton: React.FC<{
  title: string;
  url: string;
  categoryRef: React.RefObject<HTMLHeadingElement | null>;
}> = ({ title, url, categoryRef }) => {
  const handleShare = async () => {
    try {
      const shareText = `Article: ${title}\nURL: ${url}`;
      let screenshotBlob: Blob | null = null;
      let screenshotDataUrl: string | null = null;
      if (categoryRef.current) {
        const canvas = await html2canvas(categoryRef.current);
        screenshotDataUrl = canvas.toDataURL("image/png");
        screenshotBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((blob) => resolve(blob), "image/png")
        );
      }

      console.log("Share Text:", shareText);
      console.log("Screenshot Data URL:", screenshotDataUrl ? screenshotDataUrl.substring(0, 50) + "..." : null);

      if (navigator.share) {
        const shareData: ShareData = {
          title,
          text: shareText,
          url,
        };
        if (screenshotBlob) {
          shareData.files = [new File([screenshotBlob], `${title}-screenshot.png`, { type: "image/png" })];
        }
        await navigator.share(shareData);
        toast.success("Shared article URL and screenshot!");
      } else {
        const clipboardContent = screenshotDataUrl
          ? `${shareText}\n\nScreenshot (paste in browser to view):\n${screenshotDataUrl}`
          : shareText;
        await navigator.clipboard.writeText(clipboardContent);

        if (screenshotDataUrl) {
          const link = document.createElement("a");
          link.href = screenshotDataUrl;
          link.download = `${title}-screenshot.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast.success(
          screenshotDataUrl
            ? "Copied article URL and screenshot to clipboard! Screenshot downloaded."
            : "Copied article URL to clipboard! Screenshot capture failed."
        );
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Failed to share article.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center px-4 py-2 bg-[#0A51A1] text-white rounded-lg shadow-md hover:bg-[#003459] transition-all duration-300 hover:shadow-lg"
      aria-label="Share this article"
    >
      <ShareIcon className="w-5 h-5 mr-2" />
      Share
    </button>
  );
};

// --- NEWS HOME SLIDESHOW ---
const NewsHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<NewsHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchNewsHome = useCallback(async () => {
    try {
      const response = await axiosInstance.get<NewsHomeData[]>("/api/news-home-slider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch news sliders:", err);
    }
  }, []);

  useEffect(() => {
    fetchNewsHome();
  }, [fetchNewsHome]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (data.length === 0) return null;

  const imagePath = getFullMediaUrl(data[currentSlide].home_img);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={imagePath || "https://via.placeholder.com/1200x600?text=Image+Missing"}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")}
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-xl">
          <motion.div
            key={`heading-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {data[currentSlide].heading}
          </motion.div>
          <motion.div
            key={`description-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl text-gray-200 mb-8"
          >
            {data[currentSlide].description || "The latest updates from our team."}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0A51A1] transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0A51A1] transition"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- NewsCard COMPONENT ---
const NewsCard: React.FC<{ news: NewsData }> = ({ news }) => {
  const imageUrl = getFullMediaUrl(news.news_img);
  const navigate = useNavigate();

  const { text, iframeSrcs } = parseDescription(news.description);

  const renderMedia = () => {
    if (iframeSrcs.length > 0) {
      return (
        <div className="w-full h-32 flex items-center justify-center aspect-video rounded-lg shadow-md overflow-hidden bg-gray-100">
          <iframe
            src={iframeSrcs[0]}
            title="News Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  };

  const handleReadMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/readmore-news/${news.news_id}`);
  };

  return (
    <motion.div
      layoutId={`news-card-${news.news_id}`}
      onClick={() => navigate(`/readmore-news/${news.news_id}`)}
      className="relative group flex flex-col cursor-pointer bg-white rounded-xl shadow-lg transition-all duration-300 border border-transparent hover:border-[#0072bc] hover:shadow-xl w-full max-w-sm min-h-[450px] mx-auto"
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
          {renderMedia()}
          <div
            className="text-gray-600 text-sm line-clamp-2"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          <button
            className="text-blue-600 hover:underline font-semibold mt-2 text-sm self-start"
            onClick={handleReadMoreClick}
            aria-label="Read more about this news"
          >
            Read More
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- NEWS SECTION ---
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459]">Our News</h2>
          <p className="mt-4 text-lg text-red-600 max-w-2xl mx-auto">
            Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti.
          </p>
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
              <option key={y} value={y}>
                {y}
              </option>
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
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
              {paginatedNews.map((item) => (
                <NewsCard key={item.news_id} news={item} />
              ))}
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

// --- SINGLE NEWS PAGE ---
const SingleNewsPage: React.FC = () => {
  const { news_id } = useParams<{ news_id: string }>();
  const [news, setNews] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const categoryRef = useRef<HTMLHeadingElement | null>(null);

  const fetchSingleNews = useCallback(async () => {
    if (!news_id) {
      setError("Invalid news ID.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse>(`/api/readmore-news/${news_id}`);
      console.log("SingleNews API Response:", response.data);
      setNews(response.data.news);
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

  const renderMedia = (iframeSrcs: string[]) => {
    if (iframeSrcs.length > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full aspect-video rounded-xl shadow-md overflow-hidden mb-8"
        >
          <iframe
            src={iframeSrcs[0]}
            title="News Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
            onError={() => toast.error("Failed to load video.")}
          />
          <a
            href={iframeSrcs[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Watch video externally
          </a>
        </motion.div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-100">
        <Helmet>
          <title>Error - Blog / News | MCL</title>
          <meta name="description" content="An error occurred while fetching the news article." />
          <meta name="robots" content="noindex" />
          <meta name="category" content="Blog / News" />
        </Helmet>
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-[#003459]">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error || "News article not found."}</p>
        <button
          onClick={() => navigate("/company/news")}
          className="mt-6 px-6 py-2 bg-[#0A51A1] text-white font-semibold rounded-lg shadow-md hover:bg-[#003459] transition-all duration-300 hover:shadow-lg"
        >
          Back to News
        </button>
      </div>
    );
  }

  const { text, iframeSrcs } = parseDescription(news.description);
  const imageUrl = getFullMediaUrl(news.news_img);
  const pdfUrl = getFullMediaUrl(news.pdf_file);
  const currentUrl = window.location.href;

  const metaDescription = text.replace(/<[^>]+>/g, "").slice(0, 157) + "...";

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Helmet>
        <title>{news.category} | MCL Blog / News</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="Tanzanian news, Mwananchi news, The Citizen news, Mwanaspoti news, MCL updates, news article"
        />
        <meta name="author" content="MCL" />
        <meta name="robots" content="index, follow" />
        <meta name="category" content="Blog / News" />

        {/* Open Graph Tags */}
        <meta property="og:title" content={news.category} />
        <meta property="og:description" content="Stay Informed with Trusted Journalism" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:image:alt" content={news.category} />
        <meta property="og:site_name" content="MCL Blog / News" />
        <meta property="article:published_time" content={news.created_at} />
        {news.updated_at && <meta property="article:modified_time" content={news.updated_at} />}
        <meta property="article:section" content="Blog / News" />
        <meta
          property="article:tag"
          content="Tanzanian news, Mwananchi news, The Citizen news, Mwanaspoti news, MCL updates"
        />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={news.category} />
        <meta name="twitter:description" content="Stay Informed with Trusted Journalism" />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        <meta name="twitter:image:alt" content={news.category} />
        <meta name="twitter:site" content="@MCLNews" />
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <main className="flex-grow">
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.button
                onClick={() => navigate("/company/news")}
                className="mb-8 flex items-center text-[#003459] hover:text-[#0A51A1] font-semibold text-lg rounded-lg transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                aria-label="Back to news list"
              >
                <ChevronLeftIcon className="w-6 h-6 mr-2" />
                Back to News
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <motion.h1
                  ref={categoryRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-3xl md:text-4xl font-extrabold text-[#003459] leading-tight mb-6"
                >
                  {news.category}
                </motion.h1>

                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-[#0d7680] flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2" />
                    {formatDate(news.created_at)}
                  </p>
                  <ShareButton title={news.category} url={currentUrl} categoryRef={categoryRef} />
                </div>

                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8"
                  >
                    <img
                      src={imageUrl}
                      alt={news.category}
                      className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
                    />
                  </motion.div>
                )}

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-4 text-lg text-gray-800"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                  {renderMedia(iframeSrcs)}
                  {pdfUrl && (
                    <div className="mt-8">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#0A51A1] text-white font-semibold rounded-lg shadow-md hover:bg-[#003459] transition-all duration-300 hover:shadow-lg"
                        aria-label="View PDF document"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <aside className="lg:col-span-1 hidden lg:block sticky top-24 self-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-[#003459] mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/company/news")}
                      className="text-[#0A51A1] hover:underline font-medium hover:text-[#003459] transition-colors duration-200"
                      aria-label="View all news"
                    >
                      All News
                    </button>
                  </li>
                  <li>
                    <a
                      href="#top"
                      className="text-[#0A51A1] hover:underline font-medium hover:text-[#003459] transition-colors duration-200"
                      aria-label="Back to top"
                    >
                      Back to Top
                    </a>
                  </li>
                </ul>
                <div className="mt-6">
                  <ShareButton title={news.category} url={currentUrl} categoryRef={categoryRef} />
                </div>
              </motion.div>
            </aside>
          </div>
        </section>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

// --- MAIN NEWS PAGE COMPONENT ---
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
      console.log("NewsHome API Response:", response.data);
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

  const featuredNews = allNews.find((item) => item.news_img);
  const featuredImage = featuredNews ? getFullMediaUrl(featuredNews.news_img) : null;

  if (error && !isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <Helmet>
          <title>Error - Blog / News | MCL</title>
          <meta name="description" content="An error occurred while fetching news data." />
          <meta name="robots" content="noindex" />
          <meta name="category" content="Blog / News" />
        </Helmet>
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
      <Helmet>
        <title>Latest News & Updates | MCL</title>
        <meta
          name="description"
          content="Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti."
        />
        <meta
          name="keywords"
          content="Tanzanian news, Mwananchi news, The Citizen news, Mwanaspoti news, MCL updates"
        />
        <meta name="author" content="MCL" />
        <meta name="robots" content="index, follow" />
        <meta name="category" content="Blog / News" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="Latest News & Updates" />
        <meta
          property="og:description"
          content="Stay Informed with Trusted Journalism"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        {featuredImage && <meta property="og:image" content={featuredImage} />}
        <meta property="og:image:alt" content="MCL News" />
        <meta property="og:site_name" content="MCL Blog / News" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest News & Updates" />
        <meta
          name="twitter:description"
          content="Stay Informed with Trusted Journalism"
        />
        {featuredImage && <meta name="twitter:image" content={featuredImage} />}
        <meta name="twitter:image:alt" content="MCL News" />
        <meta name="twitter:site" content="@MCLNews" />
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      {!isLoading && (
        <>
          <header>
            <NewsHomeSlideshow />
          </header>
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
          <footer>
            <Footer />
          </footer>
        </>
      )}
    </div>
  );
};

// Export both components as named exports
export { NewsHomePage, SingleNewsPage };

// Default export for NewsHomePage
export default NewsHomePage;