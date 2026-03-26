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
  HeartIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { AboutCardData } from "./types";
import { buildImageUrl } from "./helpers";
import axiosInstance from "../../axios";

interface DiscoverCardsProps {
  cards: AboutCardData[];
}

const DiscoverCards = memo(({ cards }: DiscoverCardsProps) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const displayCards = cards.slice(0, 6);

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-[#007aff] to-[#5dade2]",
      "from-[#FF3520] to-[#ff6b4a]",
      "from-[#10B981] to-[#34d399]",
      "from-[#8B5CF6] to-[#a78bfa]",
      "from-[#F59E0B] to-[#fbbf24]",
      "from-[#EC4899] to-[#f472b6]",
    ];
    return gradients[index % gradients.length];
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return BuildingOfficeIcon;
    }
  };

  if (!displayCards.length) return null;

  return (
    <section ref={ref} className="py-28 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              y: [null, -100, 100],
              x: [null, 50, -50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-[#007aff]/30 rounded-full"
          />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat opacity-30" />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] mb-5 shadow-lg"
          >
            <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm font-bold uppercase text-white tracking-wider font-sans">Featured Stories</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-white mb-4 font-sans"
          >
            Discover <span className="bg-gradient-to-r from-[#007aff] to-[#FF3520] bg-clip-text text-transparent">Stories</span>
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "6rem" } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-[#007aff] to-[#FF3520] mx-auto rounded-full"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-gray-300 mt-6 max-w-2xl mx-auto font-sans"
          >
            Explore our latest news, events, and brand stories that shape the media landscape in Tanzania
          </motion.p>
        </motion.div>
        
        {/* Featured Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {displayCards[0] && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white"
            >
              <div className="relative h-[500px] overflow-hidden bg-gray-100">
                <motion.img
                  src={buildImageUrl(displayCards[0].imageUrl, baseURL)}
                  alt={displayCards[0].title}
                  className="absolute inset-0 w-full h-full object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#007aff] to-[#FF3520] text-white text-sm font-bold shadow-lg"
                    >
                      {displayCards[0].type}
                    </motion.div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <ClockIcon className="w-4 h-4 animate-pulse" />
                      <span>Featured Story</span>
                    </div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-3 font-sans drop-shadow-lg"
                  >
                    {displayCards[0].title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 }}
                    className="text-gray-200 mb-6 line-clamp-2 font-sans drop-shadow"
                  >
                    {displayCards[0].description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7 }}
                  >
                    <Link to={displayCards[0].linkUrl}>
                      <motion.button
                        whileHover={{ x: 10 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold hover:bg-white/30 transition-all font-sans border border-white/30"
                      >
                        Read Full Story
                        <ArrowRightIcon className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Right side cards */}
          <div className="space-y-8">
            {displayCards.slice(1, 3).map((card, idx) => {
              const Icon = getIcon(card.type);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group relative overflow-hidden rounded-2xl shadow-xl bg-white border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden bg-gray-100">
                      <motion.img
                        src={buildImageUrl(card.imageUrl, baseURL)}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:bg-gradient-to-r" />
                    </div>
                    
                    <div className="flex-1 p-6">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 mb-3"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-r from-[#007aff]/10 to-[#FF3520]/10">
                          <Icon className="w-4 h-4 text-[#007aff]" />
                        </div>
                        <span className="text-sm font-semibold text-[#007aff] font-sans">{card.type}</span>
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 font-sans">{card.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">{card.description}</p>
                      
                      <Link to={card.linkUrl}>
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="inline-flex items-center gap-2 text-[#007aff] text-sm font-semibold hover:text-[#FF3520] transition-colors font-sans"
                        >
                          Explore Story
                          <ArrowRightIcon className="w-3 h-3" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCards.slice(3, 6).map((card, idx) => {
            const Icon = getIcon(card.type);
            const gradient = getCardGradient(idx);
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <motion.div
                  whileHover={{ rotateY: 2 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <motion.img
                      src={buildImageUrl(card.imageUrl, baseURL)}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      onClick={() => setSelectedImage({ url: buildImageUrl(card.imageUrl, baseURL), title: card.title })}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <motion.div
                      initial={{ x: 100 }}
                      whileHover={{ x: 0 }}
                      className="absolute top-4 right-4"
                    >
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-bold shadow-lg`}>
                        {card.type}
                      </div>
                    </motion.div>
                    
                    <button
                      onClick={() => setSelectedImage({ url: buildImageUrl(card.imageUrl, baseURL), title: card.title })}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                      >
                        <PlayIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="w-4 h-4 text-[#007aff]" />
                      </div>
                      <span className="text-xs text-gray-500 font-sans uppercase tracking-wider">{card.type}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 font-sans">{card.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">{card.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Link to={card.linkUrl}>
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="inline-flex items-center gap-2 text-[#007aff] font-semibold text-sm group-hover:text-[#FF3520] transition-colors font-sans"
                        >
                          Discover More
                          <ArrowRightIcon className="w-3 h-3" />
                        </motion.button>
                      </Link>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1 text-gray-400 text-xs"
                      >
                        <HeartIcon className="w-3 h-3" />
                        <span>Trending</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* View All Button */}
        {cards.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link to="/discover-more">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden px-10 py-4 rounded-full font-bold text-white text-lg shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#007aff] to-[#FF3520]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF3520] to-[#007aff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2 font-sans">
                  View All Stories
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.span>
                </span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
      
      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative max-w-6xl w-full"
            >
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="w-full h-auto rounded-2xl shadow-2xl" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                <h3 className="text-white text-xl font-bold font-sans">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

DiscoverCards.displayName = 'DiscoverCards';
export default DiscoverCards;