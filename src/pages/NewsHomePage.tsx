import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { Helmet } from "react-helmet";

// --- INTERFACES ---
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
    .filter((src) => src && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/.test(src));

  let text = sanitizedDescription;
  iframes.forEach((iframe) => {
    text = text.replace(iframe.outerHTML, "").trim();
  });
  text = text || "<p class='mb-4'>No additional details.</p>";

  return { text, iframeSrcs };
};

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
      className="flex items-center px-4 py-2 bg-[#ed1c24] text-white rounded-lg shadow-md hover:bg-[#003459] transition-all duration-300 hover:shadow-lg"
      aria-label="Share this article"
    >
      <ShareIcon className="w-5 h-5 mr-2" />
      Share
    </button>
  );
};

// --- HORIZONTAL NEWS CARD COMPONENT ---
const HorizontalNewsCard: React.FC<{ news: NewsData; index: number }> = ({ news, index }) => {
  const imageUrl = getFullMediaUrl(news.news_img);
  const navigate = useNavigate();
  const { text, iframeSrcs } = parseDescription(news.description);
  const hasVideo = iframeSrcs.length > 0;

  const handleReadMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/readmore-news/${news.news_id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={() => navigate(`/readmore-news/${news.news_id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row w-full"
    >
      {/* Image Section - Horizontal */}
      <div className="relative md:w-2/5 lg:w-1/3 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={news.category}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <button
              className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              aria-label="View image"
              onClick={(e) => e.stopPropagation()}
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
          {news.category.split(" ")[0]}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4 text-[#0072bc]" />
            <span>{formatDate(news.created_at)}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-[#0072bc]" />
            <span>{getRelativeTime(news.created_at)}</span>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-[#003459] mb-3 group-hover:text-[#0072bc] transition-colors leading-tight line-clamp-2">
          {news.category}
        </h3>

        <div
          className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: text }}
        />

        {hasVideo && (
          <div className="mt-2 mb-4 rounded-xl overflow-hidden shadow-md max-w-md">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={iframeSrcs[0]}
                title={news.category}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleReadMoreClick}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#ed1c24] hover:text-[#003459] transition-colors group/link"
          >
            Read Full Story
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </button>
          <span className="text-xs text-gray-400">2 min read</span>
        </div>
      </div>
    </motion.article>
  );
};

// --- NEWS SECTION (HORIZONTAL LAYOUT) ---
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
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const paginatedNews = sortedNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#003459] border-l-8 border-[#ed1c24] pl-6">
            Latest News
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl pl-6">
            Stay informed with the latest stories, insights, and updates from MCL.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <select
            value={filters.year}
            onChange={(e) => {
              filters.setYear(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#0072bc] focus:border-[#0072bc]"
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#0072bc] focus:border-[#0072bc]"
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#0072bc] focus:border-[#0072bc]"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
          </select>
          <button
            onClick={() => {
              filters.setYear("");
              filters.setMonth("");
              setCurrentPage(1);
            }}
            className="w-full p-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* News List - Horizontal Layout */}
        {paginatedNews.length > 0 ? (
          <div className="space-y-8">
            {paginatedNews.map((item, idx) => (
              <HorizontalNewsCard key={item.news_id} news={item} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <CalendarDaysIcon className="w-20 h-20 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-[#003459]">No News Found</h3>
            <p className="text-gray-500 mt-2">No articles match your current filters. Try clearing them.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedNews.length)} of {sortedNews.length} news items
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-[#003459] rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center px-4 py-2 bg-[#003459] text-white rounded-lg shadow-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          />
        </motion.div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
          <p className="mt-4 text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-100">
        <Helmet>
          <title>Error - Blog / News | MCL</title>
          <meta name="description" content="An error occurred while fetching the news article." />
          <meta name="robots" content="noindex" />
        </Helmet>
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-[#003459]">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error || "News article not found."}</p>
        <button
          onClick={() => navigate("/company/news")}
          className="mt-6 px-6 py-2 bg-[#003459] text-white font-semibold rounded-lg shadow-md hover:bg-[#0072bc] transition-all duration-300"
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
        <title>{news.category} | MCL News</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content="Tanzanian news, Mwananchi news, The Citizen news, Mwanaspoti news, MCL updates" />
        <meta name="author" content="MCL" />
        <meta property="og:title" content={news.category} />
        <meta property="og:description" content="Stay Informed with Trusted Journalism" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={news.category} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <main className="flex-grow">
        <section className="py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.button
                onClick={() => navigate("/company/news")}
                className="mb-8 flex items-center text-[#003459] hover:text-[#0072bc] font-semibold text-lg transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ChevronLeftIcon className="w-6 h-6 mr-2" />
                Back to News
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <motion.h1
                  ref={categoryRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                    className="mb-8"
                  >
                    <img
                      src={imageUrl}
                      alt={news.category}
                      className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                    />
                  </motion.div>
                )}

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: text }} />
                  {renderMedia(iframeSrcs)}
                  {pdfUrl && (
                    <div className="mt-8">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-lg shadow-md hover:bg-[#0072bc] transition-all duration-300"
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
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-[#003459] mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/company/news")}
                      className="text-[#0072bc] hover:underline font-medium"
                    >
                      All News
                    </button>
                  </li>
                  <li>
                    <a href="#top" className="text-[#0072bc] hover:underline font-medium">
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
      <Footer />
    </div>
  );
};

// --- MAIN NEWS PAGE COMPONENT (No Hero Section) ---
const NewsHomePage: React.FC = () => {
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);

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

  const featuredNews = allNews.find((item) => item.news_img);
  const featuredImage = featuredNews ? getFullMediaUrl(featuredNews.news_img) : null;

  if (error && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <Helmet>
          <title>Error - News | MCL</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchNews}
          className="mt-6 px-6 py-2 bg-[#003459] text-white font-semibold rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
          <p className="mt-4 text-gray-500">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Helmet>
        <title>Latest News & Updates | MCL</title>
        <meta name="description" content="Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti." />
        <meta name="keywords" content="Tanzanian news, Mwananchi news, The Citizen news, Mwanaspoti news, MCL updates" />
        <meta property="og:title" content="Latest News & Updates" />
        <meta property="og:description" content="Stay Informed with Trusted Journalism" />
        <meta property="og:type" content="website" />
        {featuredImage && <meta property="og:image" content={featuredImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Latest News & Updates" />
        {featuredImage && <meta name="twitter:image" content={featuredImage} />}
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <header className="bg-[#003459] text-white py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-wide">MCL Newsroom</h1>
        </div>
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
      
      <Footer />
    </div>
  );
};

export { NewsHomePage, SingleNewsPage };
export default NewsHomePage;