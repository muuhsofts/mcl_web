import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  ShareIcon,
  ArrowRightIcon,
  ClockIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";

// --- INTERFACES ---
interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  read_more_url_lnk: string | null;
  created_at: string;
  updated_at?: string;
}

interface RelatedNews {
  news_id: number;
  category: string;
  news_img: string | null;
  created_at: string;
}

interface ApiResponse {
  news: NewsData;
  related_news?: RelatedNews[];
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
  const newsDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60 * 60 * 24));
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

// --- RELATED NEWS CARD (HORIZONTAL) ---
const RelatedNewsCard: React.FC<{ news: RelatedNews }> = ({ news }) => {
  const navigate = useNavigate();
  const imageUrl = getFullMediaUrl(news.news_img);

  return (
    <motion.div
      whileHover={{ x: 5 }}
      onClick={() => navigate(`/readmore-news/${news.news_id}`)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-row items-center gap-4 p-3 border border-gray-100"
    >
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={news.category}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#003459] group-hover:text-[#0072bc] transition-colors line-clamp-2">
          {news.category}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <CalendarDaysIcon className="w-3 h-3" />
          <span>{formatDate(news.created_at)}</span>
        </div>
      </div>
      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#ed1c24] transition-colors flex-shrink-0" />
    </motion.div>
  );
};

// --- SINGLE NEWS PAGE ---
const SingleNewsPage: React.FC = () => {
  const { news_id } = useParams<{ news_id: string }>();
  const [news, setNews] = useState<NewsData | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
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
      setRelatedNews(response.data.related_news || []);
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
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
  const readMoreUrl = news.read_more_url_lnk && news.read_more_url_lnk !== "null" && news.read_more_url_lnk.trim()
    ? news.read_more_url_lnk.trim()
    : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <header className="bg-[#003459] text-white py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-wide">MCL Newsroom</h1>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate("/company/news")}
              className="mb-6 flex items-center text-[#003459] hover:text-[#0072bc] font-semibold transition-all duration-300 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to News
            </motion.button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Horizontal Card Layout with Full Images */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Full Image Section - NO CROPPING */}
                  {imageUrl && (
                    <div className="w-full bg-gray-100 flex justify-center items-center p-8">
                      <img
                        src={imageUrl}
                        alt={news.category}
                        className="max-w-full h-auto max-h-[600px] object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                        }}
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-6 md:p-8">
                    {/* Title */}
                    <motion.h1
                      ref={categoryRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#003459] leading-tight mb-4"
                    >
                      {news.category}
                    </motion.h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4 text-[#0072bc]" />
                          <span>{formatDate(news.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-[#0072bc]" />
                          <span>{getRelativeTime(news.created_at)}</span>
                        </div>
                      </div>
                      <ShareButton title={news.category} url={currentUrl} categoryRef={categoryRef} />
                    </div>

                    {/* Description */}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: text }} />
                      {renderMedia(iframeSrcs)}

                      {/* PDF Button */}
                      {pdfUrl && (
                        <div className="mt-6">
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-5 py-2.5 bg-[#003459] text-white font-semibold rounded-lg shadow-md hover:bg-[#0072bc] transition-all duration-300"
                          >
                            View PDF Document
                          </a>
                        </div>
                      )}

                      {/* Read More Button */}
                      {readMoreUrl && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <a
                            href={readMoreUrl.startsWith("http") ? readMoreUrl : `https://${readMoreUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                          >
                            Read More In Detail
                            <ArrowRightIcon className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar - Related News */}
              <aside className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-24"
                >
                  {/* Related News Section */}
                  {relatedNews.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-[#003459] mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#ed1c24] rounded-full" />
                        Related Stories
                      </h3>
                      <div className="space-y-3">
                        {relatedNews.map((item) => (
                          <RelatedNewsCard key={item.news_id} news={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-[#003459] mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#ed1c24] rounded-full" />
                      Quick Links
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <Link
                          to="/company/news"
                          className="flex items-center gap-2 text-[#0072bc] hover:text-[#003459] transition-colors font-medium"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                          All News
                        </Link>
                      </li>
                      <li>
                        <a
                          href="#top"
                          className="flex items-center gap-2 text-[#0072bc] hover:text-[#003459] transition-colors font-medium"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                          Back to Top
                        </a>
                      </li>
                    </ul>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <ShareButton title={news.category} url={currentUrl} categoryRef={categoryRef} />
                    </div>
                  </div>
                </motion.div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SingleNewsPage;