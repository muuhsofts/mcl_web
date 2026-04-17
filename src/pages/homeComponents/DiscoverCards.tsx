import { memo, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  CalendarIcon,
  SparklesIcon,
  ClockIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { AboutCardData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface DiscoverCardsProps {
  cards: AboutCardData[];
}

const DiscoverCards = memo(({ cards }: DiscoverCardsProps) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const baseURL =
    axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  const displayCards = cards.slice(0, 6);

  const getIcon = (type: string) => {
    if (type === "News") return NewspaperIcon;
    if (type === "Events") return CalendarIcon;
    return BuildingOfficeIcon;
  };

  if (!displayCards.length) return null;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-14 md:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M36%2034h4v4h-4z%22%20fill%3D%22white%22%20fill-opacity%3D%220.03%22/%3E%3C/svg%3E')] bg-repeat" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white text-xs font-bold mb-4">
            <SparklesIcon className="w-4 h-4" />
            Featured Stories
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Discover More
          </h2>
        </motion.div>

        {/* Featured + Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Featured */}
          {displayCards[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              className="relative overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="relative h-[420px] bg-gray-100">
                <img
                  src={buildImageUrl(displayCards[0].imageUrl, baseURL)}
                  className="w-full h-full object-contain"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              <div className="absolute bottom-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-xs bg-white/20 rounded-full">
                    {displayCards[0].type}
                  </span>
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-xs opacity-80">Featured</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {displayCards[0].title}
                </h3>

                <Link to={displayCards[0].linkUrl}>
                  <button className="inline-flex items-center gap-2 text-sm font-semibold">
                    Read More <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Side Cards */}
          <div className="space-y-4">
            {displayCards.slice(1, 3).map((card, i) => {
              const Icon = getIcon(card.type);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md flex"
                >
                  <div className="w-1/3 bg-gray-100">
                    <img
                      src={buildImageUrl(card.imageUrl, baseURL)}
                      className="w-full h-full object-contain"
                      alt=""
                    />
                  </div>

                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-[#007aff]" />
                      <span className="text-xs text-[#007aff] font-semibold">
                        {card.type}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {card.title}
                    </h3>

                    <Link to={card.linkUrl}>
                      <span className="text-xs text-[#007aff] mt-2 inline-flex items-center gap-1">
                        Explore <ArrowRightIcon className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayCards.slice(3, 6).map((card, i) => {
            const Icon = getIcon(card.type);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-md"
              >
                <div className="h-44 bg-gray-100 relative">
                  <img
                    src={buildImageUrl(card.imageUrl, baseURL)}
                    className="w-full h-full object-contain"
                    alt=""
                  />

                  <button
                    onClick={() =>
                      setSelectedImage({
                        url: buildImageUrl(card.imageUrl, baseURL),
                        title: card.title,
                      })
                    }
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100"
                  >
                    <PlayIcon className="w-10 h-10 text-white" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-[#007aff]" />
                    <span className="text-xs text-gray-500 uppercase">
                      {card.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {card.description}
                  </p>

                  <Link to={card.linkUrl}>
                    <span className="text-xs text-[#007aff] mt-2 inline-flex">
                      View More <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All */}
        {cards.length > 6 && (
          <div className="text-center mt-10">
            <Link to="/discover-more">
              <button className="px-8 py-3 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white font-semibold text-sm">
                View All Stories
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button className="absolute -top-10 right-0 text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>

              <img
                src={selectedImage.url}
                className="w-full rounded-xl"
                alt=""
              />

              <h3 className="text-white mt-3 text-center">
                {selectedImage.title}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

DiscoverCards.displayName = "DiscoverCards";
export default DiscoverCards;