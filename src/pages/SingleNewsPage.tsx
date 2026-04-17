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
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
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

  const parseDescription = (description: string | null) => {
    if (!description) return { text: "No details available.", iframe: null };

    const sanitizedDescription = DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ["iframe", "p", "strong", "em", "ul", "li", "a"],
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
      ],
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedDescription, "text/html");
    const iframe = doc.querySelector("iframe");

    let text = sanitizedDescription;
    if (iframe) {
      const iframeString = iframe.outerHTML;
      text = sanitizedDescription.replace(iframeString, "").trim() || "No additional details.";
    }

    // Split text into words for counting, without removing punctuation
    const words = text.split(/\s+/).filter((word) => word.trim().length > 0);

    // Break into paragraphs of approximately 90 words, keeping the last paragraph whole
    const wordsPerParagraph =  88;
    const paragraphs: string[] = [];
    let currentIndex = 0;

    for (let i = 0; i < words.length; i += wordsPerParagraph) {
      // If this is the last chunk, take all remaining words as a single paragraph
      if (i + wordsPerParagraph >= words.length) {
        const lastParagraphWords = text.slice(currentIndex).trim();
        const sanitizedLastParagraph = DOMPurify.sanitize(lastParagraphWords, {
          ALLOWED_TAGS: ["strong", "em", "ul", "li", "a"],
          ALLOWED_ATTR: ["href", "target"],
        });
        paragraphs.push(`<p class="mb-4">${sanitizedLastParagraph}</p>`);
        break;
      }
      // Otherwise, calculate the substring for ~90 words, preserving punctuation
      let wordsInChunk = 0;
      let endIndex = currentIndex;

      // Count words and find the end index for ~90 words
      while (endIndex < text.length && wordsInChunk < wordsPerParagraph) {
        const nextSpace = text.indexOf(" ", endIndex + 1);
        if (nextSpace === -1) break; // No more spaces, take the rest
        endIndex = nextSpace;
        wordsInChunk++;
      }

      // Adjust endIndex to include the full word
      if (endIndex < text.length && text[endIndex] === " ") {
        endIndex++;
      }

      const paragraphText = text.slice(currentIndex, endIndex).trim();
      const sanitizedParagraph = DOMPurify.sanitize(paragraphText, {
        ALLOWED_TAGS: ["strong", "em", "ul", "li", "a"],
        ALLOWED_ATTR: ["href", "target"],
      });
      paragraphs.push(`<p class="mb-4">${sanitizedParagraph}</p>`);
      currentIndex = endIndex;
    }

    const formattedText = paragraphs.length > 0 ? paragraphs.join("\n") : "<p class='mb-4'>No additional details.</p>";

    return {
      text: formattedText,
      iframe,
    };
  };

  const renderMedia = (iframe: HTMLIFrameElement | null) => {
    if (iframe && iframe.src) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full aspect-video rounded-xl shadow-md overflow-hidden mb-8"
        >
          <iframe
            src={iframe.src}
            title={iframe.title || "News Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          />
        </motion.div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full h-48 flex flex-col items-center justify-center aspect-video rounded-xl shadow-md bg-gray-100 mb-8"
      >
        <PlayCircleIcon className="w-12 h-12 text-gray-400" />
        <p className="text-sm text-gray-400 mt-1">No Video Available</p>
      </motion.div>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-100">
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

  const { text, iframe } = parseDescription(news.description);
  const imageUrl = getFullMediaUrl(news.news_img);
  const pdfUrl = getFullMediaUrl(news.pdf_file);
  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <main className="flex-grow">
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Back Button */}
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

              {/* Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Title with ref for screenshot */}
                <motion.h1
                  ref={categoryRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-3xl md:text-4xl font-extrabold text-[#003459] leading-tight mb-6"
                >
                  {news.category}
                </motion.h1>

                {/* Metadata */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-[#0d7680] flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2" />
                    {formatDate(news.created_at)}
                  </p>
                  <ShareButton title={news.category} url={currentUrl} categoryRef={categoryRef} />
                </div>

                {/* News Image */}
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

                {/* News Content */}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-4 text-lg text-gray-800"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                  {renderMedia(iframe)}
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

            {/* Sidebar */}
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

export default SingleNewsPage;