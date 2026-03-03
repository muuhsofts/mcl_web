import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Transition, Variants } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowPathIcon, InformationCircleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// INTERFACES (Unchanged)
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

// CONSTANTS (Unchanged)
const LOADER_ICON_ANIMATION = {
  animate: { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] },
  transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
};
const LOADER_TEXT_ANIMATION = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
};
const MODAL_TRANSITION: Transition = { duration: 0.3, ease: "easeOut" };
const SLIDE_TRANSITION: Transition = { duration: 0.8, ease: "easeInOut" };
const TEXT_FADE_IN_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };
const FILTER_SECTION_TRANSITION: Transition = { duration: 0.5 };

// HELPER FUNCTION (Unchanged)
const getImageUrl = (path: string | null, placeholder: string): string => {
  if (!path) return placeholder;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = path.replace(/^\//, "");
  return `${baseUrl}/${imagePath}`;
};

// LOADER COMPONENT (Unchanged)
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  >
    <motion.div {...LOADER_ICON_ANIMATION} className="mb-4">
      <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    </motion.div>
    <motion.h2 {...LOADER_TEXT_ANIMATION} className="text-2xl font-bold text-white">
      Loading Leadership...
    </motion.h2>
  </motion.div>
);

// MODAL COMPONENT (Unchanged)
const LeaderImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void }> = ({ imageUrl, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-lg p-4 max-w-3xl w-full"
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
      transition={MODAL_TRANSITION} onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition" aria-label="Close modal">
        <XMarkIcon className="w-6 h-6 text-gray-800" />
      </button>
      <img
        src={imageUrl} alt={altText} className="w-full h-auto max-h-[80vh] object-contain object-center"
        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Error"; }}
      />
    </motion.div>
  </motion.div>
);

// SLIDESHOW COMPONENT (Modified for further lowered content and navbar clearance)
const LeadershipHomeSlideshow: React.FC<{ setLoading: (isLoaded: boolean) => void }> = ({ setLoading }) => {
  const [slides, setSlides] = useState<LeadershipHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      const response = await axiosInstance.get<LeadershipHomeData[]>("/api/leadershipHomeSlider");
      setSlides(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to fetch leadership slider data.");
      toast.error("Error fetching leadership slider data.");
    } finally { setLoading(true); }
  }, [setLoading]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (error || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <InformationCircleIcon className="w-10 h-10 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">{error ? "Content Unavailable" : "No Sliders Found"}</h2>
      </div>
    );
  }
  const imageUrl = getImageUrl(slides[currentSlide]?.home_img, "https://via.placeholder.com/1200x600?text=Image+Missing");
  return (
    <>
      {/* Increased pt-20 to clear fixed navbar and ensure image visibility */}
      <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-800 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0 top-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img
              src={imageUrl}
              alt={slides[currentSlide].heading}
              onClick={() => setIsModalOpen(true)}
              className="w-full h-full object-cover object-top cursor-pointer"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }}
            />
          </motion.div>
        </AnimatePresence>
        {/* Increased pb-20 to move content further down for full visibility */}
        <div className="relative z-20 flex flex-col justify-end min-h-[80vh] max-w-6xl mx-auto px-4 md:px-8 pb-20">
          <div className="max-w-xl">
            <motion.h2
              key={`h2-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TEXT_FADE_IN_TRANSITION}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              {slides[currentSlide].heading}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...TEXT_FADE_IN_TRANSITION, delay: 0.2 }}
              className="flex gap-4"
            >
              <button
                onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)}
                className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
                className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {isModalOpen && <LeaderImageModal imageUrl={imageUrl} altText={slides[currentSlide].heading} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

// TOP LEADER CARD COMPONENT (Unchanged)
const TopLeaderCard: React.FC<{ leader: LeadershipData }> = ({ leader }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageUrl = getImageUrl(leader.leader_image, "https://via.placeholder.com/400x400?text=Leader+Image");
  const defaultImage = "https://via.placeholder.com/400x400?text=Leader+Image";
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  let description: string;
  if (leader.position.toUpperCase() === "MANAGING DIRECTOR" || leader.position.toUpperCase() === "CHAIRMAN") {
    description = "";
  } else {
    description = `As the ${leader.position}, ${leader.leader_name} provides strategic direction and oversight, guiding our organization towards new heights of success and innovation.`;
  }

  return (
    <>
      <motion.div
        className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row border-l-8 border-[#ed1c24]"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="md:w-1/3 flex-shrink-0 bg-gray-100">
          <img
            className="w-full h-64 md:h-full object-cover object-center cursor-pointer transition-transform duration-300 hover:scale-105"
            src={imageUrl}
            alt={leader.leader_name}
            onClick={() => setIsModalOpen(true)}
            onError={(e) => { e.currentTarget.src = defaultImage; }}
            loading="lazy"
          />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <p className="text-xl font-bold text-[#ed1c24] mb-2 tracking-wide uppercase">{leader.position}</p>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#003459] mb-4">{leader.leader_name}</h3>
          <p className="text-gray-600 text-md">{description}</p>
        </div>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && <LeaderImageModal imageUrl={imageUrl} altText={leader.leader_name} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

// LEADERSHIP CARD COMPONENT (Unchanged)
const LeadershipCard: React.FC<{ leader: LeadershipData; index: number }> = ({ leader, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageUrl = getImageUrl(leader.leader_image, "https://via.placeholder.com/400x300?text=Leader+Image");
  const defaultImage = "https://via.placeholder.com/400x300?text=Leader+Image";
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: index * 0.05 } },
  };
  return (
    <>
      <motion.div
        className="bg-white shadow-lg flex flex-col rounded-lg overflow-hidden h-full"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
      >
        <div className="relative h-56 bg-gray-100 flex items-center justify-center">
          <img
            className="max-h-full max-w-full object-contain object-center cursor-pointer"
            src={imageUrl}
            alt={leader.leader_name}
            onClick={() => setIsModalOpen(true)}
            onError={(e) => { e.currentTarget.src = defaultImage; }}
            loading="lazy"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow text-center">
          <p className="text-md font-semibold text-[#ed1c24] mb-2">{leader.position}</p>
          <h3 className="text-xl font-bold text-[#003459]">{leader.leader_name}</h3>
        </div>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && <LeaderImageModal imageUrl={imageUrl} altText={leader.leader_name} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

// FILTER BUTTON COMPONENT (Unchanged)
type FilterType = "Board of Directors" | "Management" | "All";
const FilterButton: React.FC<{ label: FilterType; activeFilter: FilterType; setFilter: (filter: FilterType) => void }> = ({
  label,
  activeFilter,
  setFilter,
}) => {
  const isActive = activeFilter === label;
  return (
    <button
      onClick={() => setFilter(label)}
      className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
        isActive ? "bg-[#ed1c24] text-white shadow-lg scale-105" : "bg-[#003459] text-white hover:bg-[#ed1c24]/90"
      }`}
    >
      {label}
    </button>
  );
};

// HIERARCHY COMPONENT (Unchanged)
interface TeamHierarchyProps {
  title: string;
  topLeader: LeadershipData | undefined;
  otherMembers: LeadershipData[];
}
const TeamHierarchy: React.FC<TeamHierarchyProps> = ({ title, topLeader, otherMembers }) => {
  if (!topLeader && otherMembers.length === 0) {
    return null;
  }
  return (
    <div>
      <h3 className="text-3xl font-bold text-[#003459] mb-8 text-center">{title}</h3>
      {topLeader && (
        <div className="flex justify-center mb-12">
          <div className="w-full lg:w-3/4 xl:w-2/3">
            <TopLeaderCard leader={topLeader} />
          </div>
        </div>
      )}
      {otherMembers.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {otherMembers.map((leader, index) => (
            <LeadershipCard key={leader.leadership_id} leader={leader} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

// REFINED LEADERSHIP SECTION COMPONENT WITH NEW STYLING (Unchanged)
const LeadershipSection: React.FC<{ setLoading: (isLoaded: boolean) => void }> = ({ setLoading }) => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");

  const fetchLeaders = useCallback(async () => {
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
      setLoading(true);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const chairman = leaders.find((l) => l.level === "Board of Directors" && l.position.toUpperCase() === "CHAIRMAN");
  const otherBoardMembers = leaders.filter((l) => l.level === "Board of Directors" && l.position.toUpperCase() !== "CHAIRMAN");

  const managingDirector = leaders.find((l) => l.level === "Management" && l.position.toUpperCase() === "MANAGING DIRECTOR");
  const otherManagementMembers = leaders.filter((l) => l.level === "Management" && l.position.toUpperCase() !== "MANAGING DIRECTOR");

  const hasBoardMembers = chairman || otherBoardMembers.length > 0;
  const hasManagementMembers = managingDirector || otherManagementMembers.length > 0;

  if (error && leaders.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-[#003459]">Failed to Load Content</h3>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={TEXT_FADE_IN_TRANSITION}
            className="text-3xl sm:text-4xl font-bold text-[#ed1c24]"
          >
            Our Leadership
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...TEXT_FADE_IN_TRANSITION, delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          />
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-12">
          <FilterButton label="All" activeFilter={filter} setFilter={setFilter} />
          <FilterButton label="Board of Directors" activeFilter={filter} setFilter={setFilter} />
          <FilterButton label="Management" activeFilter={filter} setFilter={setFilter} />
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
              <div className="space-y-16">
                {hasBoardMembers && (
                  <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
                    <TeamHierarchy title="Board of Directors" topLeader={chairman} otherMembers={otherBoardMembers} />
                  </div>
                )}
                {hasManagementMembers && (
                  <div className="bg-[#fafaf1] p-6 sm:p-10 rounded-xl shadow-lg">
                    <TeamHierarchy title="Management" topLeader={managingDirector} otherMembers={otherManagementMembers} />
                  </div>
                )}
              </div>
            )}
            {filter === "Board of Directors" && hasBoardMembers && (
              <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
                <TeamHierarchy title="Board of Directors" topLeader={chairman} otherMembers={otherBoardMembers} />
              </div>
            )}
            {filter === "Management" && hasManagementMembers && (
              <div className="bg-[#fafaf1] p-6 sm:p-10 rounded-xl shadow-lg">
                <TeamHierarchy title="Management" topLeader={managingDirector} otherMembers={otherManagementMembers} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// MAIN PAGE COMPONENT (Unchanged)
const LeadershipHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [slideshowLoaded, setSlideshowLoaded] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimePassed(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (slideshowLoaded && sectionLoaded && minimumTimePassed) {
      setIsLoading(false);
    }
  }, [slideshowLoaded, sectionLoaded, minimumTimePassed]);

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick draggable pauseOnHover theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      <motion.div className="flex-grow flex flex-col" initial="hidden" animate={isLoading ? "hidden" : "visible"} variants={contentVariants}>
        <header>
          <LeadershipHomeSlideshow setLoading={setSlideshowLoaded} />
        </header>
        <main className="flex-grow">
          <LeadershipSection setLoading={setSectionLoaded} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LeadershipHomePage;