import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  ArrowPathIcon, 
  InformationCircleIcon, 
  XMarkIcon, 
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  TrophyIcon 
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// INTERFACES
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

type FilterType = "Board of Directors" | "Management" | "All";

// HELPER FUNCTION
const getImageUrl = (path: string | null, placeholder: string): string => {
  if (!path) return placeholder;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = path.replace(/^\//, "");
  return `${baseUrl}/${imagePath}`;
};

// Loading Spinner
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-24">
    <div className="flex flex-col items-center">
      <ArrowPathIcon className="w-14 h-14 text-[#0072bc] animate-spin" />
      <p className="mt-6 text-gray-600 font-medium text-lg">Loading leadership team...</p>
    </div>
  </div>
);

// Modal Component
const LeaderImageModal: React.FC<{ 
  imageUrl: string; 
  altText: string; 
  onClose: () => void;
}> = ({ imageUrl, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative max-w-5xl w-full"
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-14 right-4 p-3 bg-[#ed1c24] text-white rounded-full hover:bg-[#003459] transition-all shadow-xl"
      >
        <XMarkIcon className="w-7 h-7" />
      </button>
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-h-[88vh] object-contain rounded-2xl shadow-2xl"
        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x800?text=Image+Error"; }}
      />
    </motion.div>
  </motion.div>
);

// Leader Card
const LeaderCard: React.FC<{ 
  leader: LeadershipData; 
  isTopLeader: boolean;
}> = ({ leader, isTopLeader }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageUrl = getImageUrl(leader.leader_image, "https://via.placeholder.com/120x120?text=Leader");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -12, scale: isTopLeader ? 1.03 : 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group"
      >
        <div 
          className={`bg-white rounded-3xl overflow-hidden text-center shadow-xl transition-all duration-500 relative
            ${isTopLeader 
              ? "p-10 border-[6px] border-[#ed1c24] shadow-2xl" 
              : "p-7 hover:shadow-2xl border border-transparent hover:border-gray-100"
            }`}
        >
          {isTopLeader && (
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#ed1c24] text-white text-xs font-bold px-6 py-1.5 rounded-full shadow-md flex items-center gap-2">
              <TrophyIcon className="w-5 h-5" />
              LEADERSHIP
            </div>
          )}

          <div 
            className={`mx-auto rounded-full overflow-hidden cursor-pointer mb-6 transition-all duration-300 shadow-inner
              ${isTopLeader 
                ? "w-52 h-52 ring-8 ring-[#ed1c24]/20 group-hover:ring-[#ed1c24]/40" 
                : "w-32 h-32 ring-4 ring-[#0072bc]/10 group-hover:ring-[#0072bc]/30"
              }`}
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={imageUrl}
              alt={leader.leader_name}
              className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-300"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/120x120?text=Leader"; }}
            />
          </div>
          
          <p className={`font-semibold uppercase tracking-[2px] mb-2 text-[#ed1c24]
            ${isTopLeader ? "text-sm" : "text-xs"}`}
          >
            {leader.position}
          </p>
          
          <h4 className={`font-bold text-[#003459] leading-tight transition-all
            ${isTopLeader ? "text-3xl" : "text-xl"}`}
          >
            {leader.leader_name}
          </h4>
        </div>
      </motion.div>

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

// Filter Button
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
      className={`px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 text-sm
        ${isActive 
          ? "bg-[#003459] text-white shadow-xl scale-105" 
          : "bg-white text-[#003459] hover:bg-gray-50 shadow border border-gray-200 hover:border-gray-300"
        }`}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </button>
  );
};

// Main Leadership Section
const LeadershipSection: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<LeadershipResponse>("/api/allLeadership");
      if (response.data?.leadership) {
        const sorted = [...response.data.leadership].sort((a, b) => a.leadership_id - b.leadership_id);
        setLeaders(sorted);
      }
    } catch (err) {
      setError("Failed to load leadership data. Please try again.");
      toast.error("Failed to load leadership team");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const chairman = leaders.find(l => 
    l.level === "Board of Directors" && l.position.toUpperCase().includes("CHAIRMAN")
  );
  
  const managingDirector = leaders.find(l => 
    l.level === "Management" && l.position.toUpperCase().includes("MANAGING DIRECTOR")
  );

  const otherBoardMembers = leaders.filter(l => 
    l.level === "Board of Directors" && !l.position.toUpperCase().includes("CHAIRMAN")
  );
  
  const otherManagementMembers = leaders.filter(l => 
    l.level === "Management" && !l.position.toUpperCase().includes("MANAGING DIRECTOR")
  );

  if (isLoading) return <LoadingSpinner />;

  if (error && leaders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <InformationCircleIcon className="w-20 h-20 mx-auto text-red-400 mb-6" />
          <h3 className="text-2xl font-bold text-[#003459] mb-3">Something went wrong</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchLeaders}
            className="px-10 py-4 bg-[#003459] text-white rounded-2xl hover:bg-[#0072bc] transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-16 pb-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white shadow-md px-8 py-3 rounded-full mb-6">
            <SparklesIcon className="w-6 h-6 text-[#ed1c24]" />
            <span className="uppercase tracking-[3px] text-sm font-semibold text-[#003459]">Leadership</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#003459] tracking-tight">
            Our Leadership Team
          </h1>
        
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <FilterButton label="All" activeFilter={filter} setFilter={setFilter} icon={<BuildingOfficeIcon className="w-5 h-5" />} />
          <FilterButton label="Board of Directors" activeFilter={filter} setFilter={setFilter} icon={<AcademicCapIcon className="w-5 h-5" />} />
          <FilterButton label="Management" activeFilter={filter} setFilter={setFilter} icon={<BriefcaseIcon className="w-5 h-5" />} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            {/* ====================== BOARD OF DIRECTORS ====================== */}
            {(filter === "All" || filter === "Board of Directors") && (chairman || otherBoardMembers.length > 0) && (
              <div className="mb-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl py-16 px-8 lg:px-12">
                <h2 className="text-4xl font-bold text-[#003459] mb-12 flex items-center gap-4">
                  <AcademicCapIcon className="w-10 h-10 text-[#0072bc]" />
                  Board of Directors
                </h2>

                {chairman && (
                  <div className="flex justify-center mb-16">
                    <LeaderCard leader={chairman} isTopLeader={true} />
                  </div>
                )}

                {otherBoardMembers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {otherBoardMembers.map(leader => (
                      <LeaderCard key={leader.leadership_id} leader={leader} isTopLeader={false} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ====================== MANAGEMENT TEAM ====================== */}
            {(filter === "All" || filter === "Management") && (managingDirector || otherManagementMembers.length > 0) && (
              <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-3xl py-16 px-8 lg:px-12">
                <h2 className="text-4xl font-bold text-[#003459] mb-12 flex items-center gap-4">
                  <BriefcaseIcon className="w-10 h-10 text-[#ed1c24]" />
                  Management Team
                </h2>

                {managingDirector && (
                  <div className="flex justify-center mb-16">
                    <LeaderCard leader={managingDirector} isTopLeader={true} />
                  </div>
                )}

                {otherManagementMembers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {otherManagementMembers.map(leader => (
                      <LeaderCard key={leader.leadership_id} leader={leader} isTopLeader={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// Main Page
const LeadershipHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      <main>
        <LeadershipSection />
      </main>
      <Footer />
    </div>
  );
};

export default LeadershipHomePage;