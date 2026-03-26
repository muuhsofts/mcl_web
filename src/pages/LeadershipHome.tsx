import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  ArrowPathIcon, 
  InformationCircleIcon, 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// INTERFACES
interface LeadershipHomeData {
  leadership_home_id: number;
  heading: string;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadershipData {
  leadership_id: number;
  position: string;
  leader_name: string;
  leader_image: string | null;
  level: "Board of Directors" | "Management";
  created_at: string;
  updated_at: string;
}

interface LeadershipResponse {
  leadership: LeadershipData[];
}

// CONSTANTS
const MODAL_TRANSITION: Transition = { duration: 0.3, ease: "easeOut" };
const SLIDE_TRANSITION: Transition = { duration: 0.8, ease: "easeInOut" };
const TEXT_FADE_IN_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };
const FILTER_SECTION_TRANSITION: Transition = { duration: 0.5 };

// HELPER FUNCTION
const getImageUrl = (path: string | null, placeholder: string): string => {
  if (!path) return placeholder;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = path.replace(/^\//, "");
  return `${baseUrl}/${imagePath}`;
};

// Simple Loading Spinner (No full-screen pre-loader)
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="flex flex-col items-center">
      <ArrowPathIcon className="w-12 h-12 text-[#0072bc] animate-spin" />
      <p className="mt-4 text-gray-500 font-medium">Loading leadership team...</p>
    </div>
  </div>
);

// MODAL COMPONENT
const LeaderImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void }> = ({ 
  imageUrl, 
  altText, 
  onClose 
}) => (
  <motion.div
    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-transparent max-w-5xl w-full"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={MODAL_TRANSITION}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 p-2 bg-[#ed1c24] text-white rounded-full hover:bg-[#003459] transition shadow-lg"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x800?text=Image+Error"; }}
      />
    </motion.div>
  </motion.div>
);

// SLIDESHOW COMPONENT - Full width hero section
const LeadershipHomeSlideshow: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [slides, setSlides] = useState<LeadershipHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSlides = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<LeadershipHomeData[]>("/api/leadershipHomeSlider");
      setSlides(Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(response.data) || response.data.length === 0) {
        setError("No slider content available.");
      }
    } catch (err) {
      setError("Failed to fetch leadership slider data.");
      toast.error("Error fetching leadership slider data.");
    } finally { 
      setIsLoading(false);
      setLoaded(true); 
    }
  }, [setLoaded]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);
  
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-[#003459] to-[#0072bc]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gradient-to-br from-[#003459] to-[#0072bc]">
        <InformationCircleIcon className="w-16 h-16 text-white mb-4" />
        <h2 className="text-2xl font-bold text-white">
          {error ? "Content Unavailable" : "No Sliders Found"}
        </h2>
      </div>
    );
  }
  
  const imageUrl = getImageUrl(slides[currentSlide]?.home_img, "https://via.placeholder.com/1920x1080?text=Leadership+Image");

  return (
    <>
      <section className="relative w-full h-screen max-h-[90vh] min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0"
          >
            <img
              src={imageUrl}
              alt={slides[currentSlide].heading}
              onClick={() => setIsModalOpen(true)}
              className="w-full h-full object-cover cursor-pointer"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1920x1080?text=Image+Error"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
        
        <div className="relative z-20 flex items-center justify-center w-full h-full">
          <div className="text-center max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TEXT_FADE_IN_TRANSITION}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6"
            >
              <TrophyIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Leadership Excellence</span>
            </motion.div>
            <motion.h1
              key={`h1-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TEXT_FADE_IN_TRANSITION}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight"
            >
              {slides[currentSlide].heading}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...TEXT_FADE_IN_TRANSITION, delay: 0.2 }}
              className="flex gap-4 justify-center"
            >
              <button
                onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
                className="p-3 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
                className="p-3 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === idx 
                  ? "w-8 h-2 bg-[#ed1c24]" 
                  : "w-2 h-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
      
      <AnimatePresence>
        {isModalOpen && (
          <LeaderImageModal 
            imageUrl={imageUrl} 
            altText={slides[currentSlide].heading} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

// TREE NODE COMPONENT - For hierarchical display
const TreeNode: React.FC<{
  leader: LeadershipData;
  level: number;
  isLast?: boolean;
  isFirst?: boolean;
}> = ({ leader, level, isLast = false, isFirst = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageUrl = getImageUrl(leader.leader_image, "https://via.placeholder.com/120x120?text=Leader");
  const defaultImage = "https://via.placeholder.com/120x120?text=Leader";

  return (
    <>
      <div className="relative">
        {/* Vertical Line */}
        {!isFirst && (
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-0.5 h-8 bg-gradient-to-b from-[#ed1c24] to-[#003459]" />
        )}
        
        {/* Node Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: level * 0.1 }}
          className="relative group"
        >
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-4 text-center w-40 mx-auto">
            <div 
              className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer mb-3 ring-2 ring-[#ed1c24]/20 group-hover:ring-[#ed1c24] transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <img
                src={imageUrl}
                alt={leader.leader_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultImage; }}
              />
            </div>
            <p className="text-xs font-semibold text-[#ed1c24] mb-1 uppercase">{leader.position}</p>
            <h4 className="text-sm font-bold text-[#003459] leading-tight">{leader.leader_name}</h4>
          </div>
        </motion.div>
        
        {/* Horizontal Line for connections */}
        {!isLast && (
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-4 w-0.5 h-8 bg-gradient-to-b from-[#003459] to-[#ed1c24]" />
        )}
      </div>
      
      <AnimatePresence>
        {isModalOpen && (
          <LeaderImageModal 
            imageUrl={imageUrl} 
            altText={leader.leader_name} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

// TREE BRANCH COMPONENT
const TreeBranch: React.FC<{
  leaders: LeadershipData[];
  title: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ leaders, title, icon, bgColor }) => {
  const [expanded, setExpanded] = useState(true);
  const topLeader = leaders[0];
  const subLeaders = leaders.slice(1);

  return (
    <div className={`${bgColor} rounded-2xl p-8 md:p-10 shadow-xl`}>
      <div 
        className="flex items-center justify-between cursor-pointer mb-6"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#ed1c24]">{icon}</span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#003459]">{title}</h3>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          {expanded ? <ChevronUpIcon className="w-5 h-5 text-[#003459]" /> : <ChevronDownIcon className="w-5 h-5 text-[#003459]" />}
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tree Structure */}
            <div className="relative">
              {/* Root Node */}
              <div className="flex justify-center mb-12">
                <TreeNode leader={topLeader} level={0} isFirst={true} />
              </div>
              
              {/* Connection from root to branches */}
              {subLeaders.length > 0 && (
                <div className="relative flex justify-center mb-8">
                  <div className="w-0.5 h-12 bg-gradient-to-b from-[#ed1c24] to-[#003459]" />
                </div>
              )}
              
              {/* Sub Leaders Grid */}
              {subLeaders.length > 0 && (
                <div className="relative">
                  {/* Horizontal connector line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ed1c24] to-transparent" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                    {subLeaders.map((leader, idx) => (
                      <div key={leader.leadership_id} className="relative">
                        {/* Vertical connector from horizontal line */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-0.5 h-8 bg-gradient-to-b from-[#ed1c24] to-[#003459]" />
                        <TreeNode 
                          leader={leader} 
                          level={1} 
                          isLast={idx === subLeaders.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// FILTER BUTTON COMPONENT
type FilterType = "Board of Directors" | "Management" | "All";
const FilterButton: React.FC<{ 
  label: FilterType; 
  activeFilter: FilterType; 
  setFilter: (filter: FilterType) => void;
  icon?: React.ReactNode;
}> = ({ label, activeFilter, setFilter, icon }) => {
  const isActive = activeFilter === label;
  return (
    <button
      onClick={() => setFilter(label)}
      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
        isActive 
          ? "bg-[#ed1c24] text-white shadow-lg scale-105" 
          : "bg-white text-[#003459] hover:bg-gray-100 shadow-md border border-gray-200"
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
    </button>
  );
};

// LEADERSHIP SECTION COMPONENT - With Tree Design
const LeadershipSection: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<LeadershipResponse>("/api/allLeadership");
      if (response.data && Array.isArray(response.data.leadership)) {
        const sortedLeaders = response.data.leadership.sort((a, b) => a.leadership_id - b.leadership_id);
        setLeaders(sortedLeaders);
        if (sortedLeaders.length === 0) setError("No leadership team data available.");
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      setError("Could not fetch leadership team.");
      toast.error("Could not fetch leadership team.");
    } finally {
      setIsLoading(false);
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  // Organize leaders for tree structure
  const chairman = leaders.find((l) => l.level === "Board of Directors" && l.position.toUpperCase() === "CHAIRMAN");
  const otherBoardMembers = leaders.filter((l) => l.level === "Board of Directors" && l.position.toUpperCase() !== "CHAIRMAN");
  const boardTeam = chairman ? [chairman, ...otherBoardMembers] : otherBoardMembers;

  const managingDirector = leaders.find((l) => l.level === "Management" && l.position.toUpperCase() === "MANAGING DIRECTOR");
  const otherManagementMembers = leaders.filter((l) => l.level === "Management" && l.position.toUpperCase() !== "MANAGING DIRECTOR");
  const managementTeam = managingDirector ? [managingDirector, ...otherManagementMembers] : otherManagementMembers;

  const hasBoardMembers = boardTeam.length > 0;
  const hasManagementMembers = managementTeam.length > 0;

  if (error && leaders.length === 0 && !isLoading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <InformationCircleIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-[#003459]">Failed to Load Content</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <button
            onClick={fetchLeaders}
            className="mt-6 px-6 py-2 bg-[#003459] text-white rounded-full hover:bg-[#0072bc] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#ed1c24]/10 px-4 py-2 rounded-full mb-4"
          >
            <SparklesIcon className="w-5 h-5 text-[#ed1c24]" />
            <span className="text-sm font-semibold text-[#ed1c24] uppercase tracking-wide">Meet Our Leaders</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={TEXT_FADE_IN_TRANSITION}
            className="text-4xl md:text-5xl font-extrabold text-[#003459]"
          >
            Our Leadership
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...TEXT_FADE_IN_TRANSITION, delay: 0.1 }}
            className="w-24 h-1 bg-[#ed1c24] mx-auto mt-4 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...TEXT_FADE_IN_TRANSITION, delay: 0.2 }}
            className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Discover the organizational structure and meet the visionary leaders driving MCL's success.
          </motion.p>
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-12">
          <FilterButton 
            label="All" 
            activeFilter={filter} 
            setFilter={setFilter}
            icon={<BuildingOfficeIcon className="w-4 h-4" />}
          />
          <FilterButton 
            label="Board of Directors" 
            activeFilter={filter} 
            setFilter={setFilter}
            icon={<AcademicCapIcon className="w-4 h-4" />}
          />
          <FilterButton 
            label="Management" 
            activeFilter={filter} 
            setFilter={setFilter}
            icon={<BriefcaseIcon className="w-4 h-4" />}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={FILTER_SECTION_TRANSITION}
          >
            {filter === "All" && (
              <div className="space-y-12">
                {hasBoardMembers && (
                  <TreeBranch 
                    title="Board of Directors" 
                    leaders={boardTeam}
                    icon={<AcademicCapIcon className="w-6 h-6" />}
                    bgColor="bg-white"
                  />
                )}
                {hasManagementMembers && (
                  <TreeBranch 
                    title="Management Team" 
                    leaders={managementTeam}
                    icon={<BriefcaseIcon className="w-6 h-6" />}
                    bgColor="bg-gray-50"
                  />
                )}
              </div>
            )}
            {filter === "Board of Directors" && hasBoardMembers && (
              <TreeBranch 
                title="Board of Directors" 
                leaders={boardTeam}
                icon={<AcademicCapIcon className="w-6 h-6" />}
                bgColor="bg-white"
              />
            )}
            {filter === "Management" && hasManagementMembers && (
              <TreeBranch 
                title="Management Team" 
                leaders={managementTeam}
                icon={<BriefcaseIcon className="w-6 h-6" />}
                bgColor="bg-gray-50"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// MAIN PAGE COMPONENT
const LeadershipHomePage: React.FC = () => {
  const [slideshowLoaded, setSlideshowLoaded] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (slideshowLoaded && sectionLoaded) {
      setTimeout(() => setShowContent(true), 100);
    }
  }, [slideshowLoaded, sectionLoaded]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      
      <motion.div 
        className="flex-grow flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <header>
          <LeadershipHomeSlideshow setLoaded={setSlideshowLoaded} />
        </header>
        <main className="flex-grow">
          <LeadershipSection setLoaded={setSectionLoaded} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LeadershipHomePage;